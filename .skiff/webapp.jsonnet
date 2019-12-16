/**
 * This file is a template that's used to generate the Kubernetes manifest
 * for your application. It's a jsonnet file, which you can learn more
 * about via https://jsonnet.org/.
 *
 * This file defines the manifest for a simple web application. It's composed
 * by the following pieces:
 *  - Your Namespace, a way to group the resources related to your application
 *    so that they're nicely isolated from those related to other apps.
 *  - An Ingress definition, which tells Kubernetes what traffic to route to
 *    your web application and what protocols to use. It also sets up TLS,
 *    which ensures communications between the client and your app are securely
 *    encrypted.
 *  - A Deployment, which tells Kubernetes to run multiple versions of your
 *    application and what code to run.
 *  - A Service, which tells Kubernetes that your application can be exposed
 *    to traffic outside of the cluster.
 *
 * This file expects the following external variables to be defined:
 *  - image {string}    An identifier for the docker image to run. Any valid
 *                      docker tag and/or sha is appropriate, i.e. my-app:latest
 *                      or my-app:sha256.
 *  - env   {string}    An identifier for the environment. If the value is 'prod',
 *                      then the top-level domain, 'appName.apps.allenai.org'
 *                      is associated with the deployment.
 *  - sha   {string}    The GIT SHA of the code being built and deployed.
 *
 * This file exptects a config.json file to exist in the same directory with
 * the following parameters:
 *  - appName   {string}    A unique name identifying the application.
 *  - httpPort  {number}    The port on which your application listens for HTTP
 *                          traffic.
 *  - contact   {string}    An @allenai.org email address that can be contacted
 *                          for matters related to the application. Note, the
 *                          '@allenai.org' suffix is not present in the value,
 *                          as Kubernetes labels don't accept the '@' character.
 */

// This file is generated once at template creation time and unlikely to change
// from that point forward.
local config = import 'config.json';

// Load the models
local models = import '../models.json';
local model_names = std.objectFields(models);

// These values are provided at runtime.
local env = std.extVar('env');
local image = std.extVar('image');
local sha = std.extVar('sha');

// Use 2 replicas in prod, only 1 in staging.
local num_replicas = (
    if env == 'prod' then
        2
    else
        1
);

local topLevelDomain = '.apps.allenai.org';
local canonicalTopLevelDomain = '.allennlp.org';

local hosts = [
    if env == 'prod' then
        config.appName + topLevelDomain
    else
        config.appName + '.' + env + topLevelDomain,
    if env == 'prod' then
        'demo' + canonicalTopLevelDomain
    else
        'demo' + '.' + env + canonicalTopLevelDomain
];

// Each app gets it's own namespace
local namespaceName = config.appName;

// Since we deploy resources for different environments in the same namespace,
// we need to give things a fully qualified name that includes the environment
// as to avoid unintentional collission / redefinition.
local fullyQualifiedName = config.appName + '-' + env;

// Every resource is tagged with the same set of labels. These labels serve the
// following purposes:
//  - They make it easier to query the resources, i.e.
//      kubectl get pod -l app=my-app,env=staging
//  - The service definition uses them to find the pods it directs traffic to.
local labels = {
    app: config.appName,
    env: env,
    contact: config.contact,
    team: config.team
};

local model_labels(model_name) = labels + {
    model: model_name,
    role: 'model-server'
};

local ui_server_labels = labels + {
    role: 'ui-server'
};

local namespace = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
        name: namespaceName,
        labels: labels
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

// Each model typically has its own service running that handles several different endpoints
// (/predict, /permadata, /task, /attack, etc.).  This is a convenience function that will route
// all of those endpoints to the model service, instead of the main frontend.
// TODO(mattg): we might want to change this some day so that all model backend services start with
// /model/[model-name], so that we only have to have one route per backend, instead of this mess of
// registering every endpoint separately.
local model_path(model_name, endpoint, url_extra='') = {
    path: '/' + endpoint + '/' + model_name + url_extra,
    backend: {
        serviceName: fullyQualifiedName + '-' + model_name,
        servicePort: config.httpPort
    },
};



local ingress = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Ingress',
    metadata: {
        name: fullyQualifiedName + '-ingress',
        namespace: namespaceName,
        labels: labels,
        annotations: {
            'certmanager.k8s.io/cluster-issuer': 'letsencrypt-prod',
            'kubernetes.io/ingress.class': 'nginx',
            'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
            'nginx.ingress.kubernetes.io/enable-cors': 'false',
            'nginx.ingress.kubernetes.io/use-regex': 'true',
            'apps.allenai.org/build': std.extVar('buildId'),
            'apps.allenai.org/sha': std.extVar('sha'),
            'apps.allenai.org/repo': std.extVar('repo')
        }
    },
    spec: {
        tls: [
            {
                secretName: fullyQualifiedName + '-tls',
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
                        // The (chromeless) frontend for each model is served at /task/{model_name}
                        // (in its own service) so we need to generate an ingress path entry that
                        // points that path to that service.
                        // The extra bit on the url is because this will sometimes have permadata
                        // on it also.
                        // TODO: allow the frontend and the backend to be different services?
                        model_path(model_name, 'task', "(/[.*])?")
                        for model_name in model_names
                    ] + [
                        // We also want to pass through the permadata/ requests to each model,
                        // because different models might handle them in different ways (or not at
                        // all).
                        model_path(model_name, 'permadata')
                        for model_name in model_names
                    ] + [
                        {
                            backend: {
                                serviceName: fullyQualifiedName,
                                servicePort: config.httpPort
                            },
                            path: '/.*'
                        }
                    ]
                }
            } for host in hosts
        ]
    }
};

local readinessProbe = {
    failureThreshold: 2,
    periodSeconds: 10,
    initialDelaySeconds: 15,
    httpGet: {
        path: '/health',
        port: config.httpPort,
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

local env_variables = db_env_variables + [
    {
        name: 'GIT_SHA',
        value: sha
    }
];

local deployment = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Deployment',
    metadata: {
        labels: ui_server_labels,
        name: fullyQualifiedName,
        namespace: namespaceName,
    },
    spec: {
        revisionHistoryLimit: 3,
        replicas: num_replicas,
        template: {
            metadata: {
                name: fullyQualifiedName,
                namespace: namespaceName,
                labels: ui_server_labels
            },
            spec: {
                containers: [
                    {
                        name: config.appName,
                        image: image,
                        args: [ '--no-models' ],
                        readinessProbe: readinessProbe,
                        resources: {
                            requests: {
                                // Our machines currently have 2 vCPUs, so this
                                // will allow 4 apps to run per machine
                                cpu: '0.2',
                                // Each machine has 13 GB of RAM. We target 4
                                // apps per machine, so we reserve 3 GB of RAM
                                // for each (whether they use it our not).
                                memory: '1Gi'
                            }
                        },
                        env: env_variables
                    },
                    cloudsql_proxy_container
                ],
                volumes: cloudsql_volumes
            }
        }
    }
};

// We allow each model's JSON to specify how much memory and CPU it needs.
// If not specified, we fall back to defaults.
local DEFAULT_CPU = "0.2";
local DEFAULT_MEMORY = "1Gi";

local get_cpu(model_name) = if std.objectHas(models[model_name], "cpu") then models[model_name]["cpu"] else DEFAULT_CPU;
local get_memory(model_name) = if std.objectHas(models[model_name], "memory") then models[model_name]["memory"] else DEFAULT_MEMORY;

// A model can specify its own docker image. It needs to run a server on config.port
// that serves up the model at /predict/{model_name}
// and that serves up the front-end at /task/{model_name}
// and that (optionally) serves up permalinks at /permadata/{model_name},
local get_image(model_name) = if std.objectHas(models[model_name], "image") then models[model_name]["image"] else image;

local model_deployment(model_name) = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Deployment',
    metadata: {
        labels: model_labels(model_name),
        name: fullyQualifiedName + "-" + model_name,
        namespace: namespaceName,
    },
    spec: {
        revisionHistoryLimit: 3,
        replicas: num_replicas,
        template: {
            metadata: {
                name: fullyQualifiedName + "-" + model_name,
                namespace: namespaceName,
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
                        env: env_variables
                    },
                    cloudsql_proxy_container
                ],
                volumes: cloudsql_volumes
            }
        }
    }
};

local service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
        name: fullyQualifiedName,
        namespace: namespaceName,
        labels: ui_server_labels
    },
    spec: {
        selector: ui_server_labels,
        ports: [
            {
                port: config.httpPort,
                name: 'http'
            }
        ]
    }
};


local model_service(model_name) = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
        name: fullyQualifiedName + "-" + model_name,
        namespace: namespaceName,
        labels: model_labels(model_name)
    },
    spec: {
        selector: model_labels(model_name),
        ports: [
            {
                port: config.httpPort,
                name: 'http'
            }
        ]
    }
};

[
    namespace,
    ingress,
    deployment,
    service,
] + [
    model_deployment(model_name)
    for model_name in model_names
] + [
    model_service(model_name)
    for model_name in model_names
]
