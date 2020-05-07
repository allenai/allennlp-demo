/**
 * This template is used to generate Kubernetes manifests for running the
 * old model serving solution.
 */

local config = import '../../skiff.json';

local models = import '../models.json';
local model_names = std.objectFields(models);

local env = std.extVar('env');
local image = std.extVar('image');
local build_id = std.extVar('buildId');
local repo = std.extVar('repo');
local sha = std.extVar('sha');

local api_port = 8000;

// Use less replicas in non-prod environments as their availability requirements
// are less stringent.
local num_replicas = (
    if env == 'prod' then
        2
    else
        1
);

// For production environments we use `demos.allennlp.org` and the regular
// `apps.allenai.org` hostname used by Skiff applications.
local tld = '.apps.allenai.org';
local hosts =
    if env == 'prod' then
        [ config.appName + tld, 'demo.allennlp.org' ]
    else
        [ config.appName + '.' + env + tld ];

// Each app gets it's own namespace
local namespace_name = config.appName;

// Since we deploy resources for different environments in the same namespace,
// we need to give things a fully qualified name that includes the environment
// as to avoid unintentional collision.
local fqn = config.appName + '-' + env;

// Every resource is tagged with the same set of labels. These labels serve the
// following purposes:
//  - They make it easier to query the resources, i.e.
//      kubectl get pod -l app=my-app,env=staging
//  - The service definition uses them to find the pods it directs traffic to.
local namespace_labels = {
    app: config.appName,
    contact: config.contact,
    team: config.team
};

local labels = namespace_labels + {
    env: env
};

local model_labels(model_name) = labels + {
    model: model_name,
    env: env,
    role: 'model-server'
};

local namespace = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
        name: namespace_name,
        labels: namespace_labels
    }
};

local cloudsql_proxy_container = {
    name: "cloudsql-proxy",
    image: "gcr.io/cloudsql-docker/gce-proxy:1.11",
    command: ["/cloud_sql_proxy", "--dir=/cloudsql",
              "-instances=ai2-allennlp:us-central1:allennlp-demo-database=tcp:5432",
              "-credential_file=/secrets/cloudsql/credentials.json"],
    securityContext: {
        runAsUser: 2,
        allowPrivilegeEscalation: false
    },
    volumeMounts: [
        {
            name: "cloudsql-instance-credentials",
            mountPath: "/secrets/cloudsql",
            readOnly: true
        },
        {
            name: "ssl-certs",
            mountPath: "/etc/ssl/certs"
        },
        {
            name: "cloudsql",
            mountPath: "/cloudsql"
        }
    ]
};

local cloudsql_volumes = [
    {
        name: "cloudsql-instance-credentials",
        secret: {
            secretName: "cloudsql-instance-credentials"
        },
    },
    {
        name: "cloudsql",
        emptyDir: {},
    },
    {
        name: "ssl-certs",
        hostPath: {
            path: "/etc/ssl/certs"
        }
    }
];

// Generates the path that should be routed to the backend for the specified
// model.
local model_path(model_name, endpoint) = {
    path: '/' + endpoint + '/' + model_name,
    backend: {
        serviceName: fqn + '-' + model_name,
        servicePort: api_port
    },
};

local readinessProbe = {
    failureThreshold: 2,
    periodSeconds: 10,
    initialDelaySeconds: 15,
    httpGet: {
        path: '/health',
        port: api_port,
        scheme: 'HTTP'
    }
};

local db_env_variables = [
    {
        name: "DEMO_POSTGRES_HOST",
        value: "127.0.0.1"
    },
    {
        name: "DEMO_POSTGRES_PORT",
        value: "5432"
    },
    {
        name: "DEMO_POSTGRES_DBNAME",
        value: "demo"
    },
    {
        name: "DEMO_POSTGRES_USER",
        valueFrom: {
            secretKeyRef: {
                name: "cloudsql-db-credentials",
                key: "username"
            }
        }
    },
    {
        name: "DEMO_POSTGRES_PASSWORD",
        valueFrom: {
            secretKeyRef: {
                name: "cloudsql-db-credentials",
                key: "password"
            }
        }
    }
];

// We deploy a single version of the Python application, without any models
// loaded, that's responsible for serving permadata from the database.
local permadata_labels = labels + {
    'role': 'permadata-server'
};

local permadata_deployment = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Deployment',
    metadata: {
        labels: permadata_labels,
        name: fqn + '-permadata',
        namespace: namespace_name,
    },
    spec: {
        revisionHistoryLimit: 3,
        replicas: num_replicas,
        template: {
            metadata: {
                name: fqn + '-permadata',
                namespace: namespace_name,
                labels: permadata_labels
            },
            spec: {
                containers: [
                    {
                        name: 'permadata',
                        image: image,
                        args: [ '--no-models' ],
                        readinessProbe: readinessProbe,
                        resources: {
                            requests: {
                                cpu: '50m',
                                memory: '500Mi'
                            }
                        },
                        env: db_env_variables
                    },
                    cloudsql_proxy_container
                ],
                volumes: cloudsql_volumes
            }
        }
    }
};

local permadata_service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
        name: fqn + '-permadata',
        namespace: namespace_name,
        labels: permadata_labels
    },
    spec: {
        selector: permadata_labels,
        ports: [
            {
                port: api_port,
                name: 'http'
            }
        ]
    }
};

// We allow each model's JSON to specify how much memory and CPU it needs.
// If not specified, we fall back to defaults.
local DEFAULT_CPU = "0.2";
local DEFAULT_MEMORY = "1Gi";

local get_cpu(model_name) = if std.objectHas(models[model_name], "cpu") then models[model_name]["cpu"] else DEFAULT_CPU;
local get_memory(model_name) = if std.objectHas(models[model_name], "memory") then models[model_name]["memory"] else DEFAULT_MEMORY;

// A model can specify its own docker image by providing an environment
// variable with the image name. It needs to run a server on config.port
// that serves up the model at /predict/{model_name}
local get_image(model_name) = if std.objectHas(models[model_name], "image") then models[model_name]["image"] else image;

local model_deployment(model_name) = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Deployment',
    metadata: {
        labels: model_labels(model_name),
        name: fqn + "-" + model_name,
        namespace: namespace_name,
    },
    spec: {
        revisionHistoryLimit: 3,
        replicas: num_replicas,
        template: {
            metadata: {
                name: fqn + "-" + model_name,
                namespace: namespace_name,
                labels: model_labels(model_name)
            },
            spec: {
                containers: [
                    {
                        name: model_name,
                        image: get_image(model_name),
                        args: [ '--model', model_name ],
                        readinessProbe: readinessProbe,
                        resources: {
                            requests: {
                                cpu: get_cpu(model_name),
                                memory: get_memory(model_name)
                            }
                        },
                        env: db_env_variables
                    },
                    cloudsql_proxy_container
                ],
                volumes: cloudsql_volumes
            }
        }
    }
};

local model_service(model_name) = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
        name: fqn + "-" + model_name,
        namespace: namespace_name,
        labels: model_labels(model_name)
    },
    spec: {
        selector: model_labels(model_name),
        ports: [
            {
                port: api_port,
                name: 'http'
            }
        ]
    }
};

local ingress = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Ingress',
    metadata: {
        name: fqn + '-ingress',
        namespace: namespace_name,
        labels: labels,
        annotations: {
            'certmanager.k8s.io/cluster-issuer': 'letsencrypt-prod',
            'kubernetes.io/ingress.class': 'nginx',
            'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
            'apps.allenai.org/build': build_id,
            'apps.allenai.org/sha': sha,
            'apps.allenai.org/repo': repo
        }
    },
    spec: {
        tls: [
            {
                secretName: fqn + '-tls',
                hosts: hosts
            }
        ],
        rules: [
            {
                host: host,
                http: {
                    paths: [
                        // The backend for each model is served at /predict/{model_name} (in its
                        // own service) so we need to generate an ingress path entry that points
                        // that path to that service.
                        model_path(model_name, 'predict')
                        for model_name in model_names
                    ] + [
                        // Attacking is handled by the model backend.
                        model_path(model_name, 'attack')
                        for model_name in model_names
                    ] + [
                        // Interpreting is handled by the model backend.
                        model_path(model_name, 'interpret')
                        for model_name in model_names
                    ] + [
                        {
                            path: '/permadata',
                            backend: {
                                serviceName: permadata_service.metadata.name,
                                servicePort: api_port
                            }
                        }
                   ]
                }
            } for host in hosts
        ]
    }
};

[
    namespace,
    ingress,
    permadata_deployment,
    permadata_service,
] + [
    model_deployment(model_name)
    for model_name in model_names
] + [
    model_service(model_name)
    for model_name in model_names
]
