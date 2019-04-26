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

local topLevelDomain = '.apps.allenai.org';

// We only allow registration of hostnames attached to '*.apps.allenai.org'
// at this point, as that's all our certmanager can (easily) handle. At one
// point we may support additional domain names. If you support for this, let
// us know! https://github.com/allenai/skiff/issues/new
local hosts = [
    if env == 'prod' then
        config.appName + topLevelDomain
    else
        config.appName + '.' + env + topLevelDomain
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
    contact: config.contact
};

local model_labels(model_name) = labels + {
    model: model_name
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

// Generate the ingress path entry for the given model
local predict_path(model_name) = {
    path: '/predict/' + model_name,
    backend: {
        serviceName: fullyQualifiedName + '-' + model_name,
        servicePort: config.httpPort
    },
};

local frontend_path(model_name) = {
    path: '/' + model_name,
    backend: {
        serviceName: fullyQualifiedName,
        servicePort: config.httpPort
    }
};

local permalink_path(model_name) = {
    path: '/' + model_name + '/.*',
    backend: {
        serviceName: fullyQualifiedName,
        servicePort: config.httpPort
    }
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
            'nginx.ingress.kubernetes.io/use-regex': 'true'
        }
    },
    spec: {
        backend: {
            serviceName: fullyQualifiedName,
            servicePort: config.httpPort
        },
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
                        predict_path(model_name)
                        for model_name in model_names
                    ] + [
                        frontend_path(model_name)
                        for model_name in model_names
                    ] + [
                        permalink_path(model_name)
                        for model_name in model_names
                    ],
                }
            } for host in hosts
        ]
    }
};

local healthCheck = {
    failureThreshold: 3,
    periodSeconds: 10,
    initialDelaySeconds: 15,
    httpGet: {
        path: '/',
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
        labels: labels,
        name: fullyQualifiedName,
        namespace: namespaceName,
    },
    spec: {
        revisionHistoryLimit: 3,
        replicas: 1,
        template: {
            metadata: {
                name: fullyQualifiedName,
                namespace: namespaceName,
                labels: labels
            },
            spec: {
                containers: [
                    {
                        name: config.appName,
                        image: image,
                        args: [ '--no-models' ],
                        readinessProbe: healthCheck,
                        livenessProbe: healthCheck,
                        resources: {
                            requests: {
                                // Our machines currently have 2 vCPUs, so this
                                // will allow 4 apps to run per machine
                                cpu: '0.5',
                                // Each machine has 13 GB of RAM. We target 4
                                // apps per machine, so we reserve 3 GB of RAM
                                // for each (whether they use it our not).
                                memory: '3Gi'
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
        replicas: 1,
        template: {
            metadata: {
                name: fullyQualifiedName + "-" + model_name,
                namespace: namespaceName,
                labels: model_labels(model_name)
            },
            spec: {
                containers: [
                    {
                        name: config.appName + '-' + model_name,
                        image: image,
                        args: [ '--model', model_name ],
                        readinessProbe: healthCheck,
                        livenessProbe: healthCheck,
                        resources: {
                            requests: {
                                // Our machines currently have 2 vCPUs, so this
                                // will allow 4 apps to run per machine
                                cpu: '0.5',
                                // Each machine has 13 GB of RAM. We target 4
                                // apps per machine, so we reserve 3 GB of RAM
                                // for each (whether they use it our not).
                                memory: '3Gi'
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
        labels: labels
    },
    spec: {
        selector: labels,
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
