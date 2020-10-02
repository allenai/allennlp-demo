/**
 * This template is used to generate Kubernetes manifests for running the
 * ui that serves `https://demo.allennlp.org/`.
 */

local config = import '../../skiff.json';

local env = std.extVar('env');
local image = std.extVar('image');
local sha = std.extVar('sha');
local build_id = std.extVar('buildId');
local repo = std.extVar('repo');

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
local top_level_domain = '.apps.allenai.org';
local hosts =
    if env == 'prod' then
        [ config.appName + top_level_domain, 'demo.allennlp.org' ]
    else
        [ config.appName + '.' + env + top_level_domain ];

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
local labels = {
    app: config.appName,
    contact: config.contact,
    team: config.team
};

local ui_labels = labels + {
    role: 'ui-server',
    env: env
};

local port = 80;

local namespace = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
        name: namespace_name,
        labels: labels
    }
};

local deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
        labels: ui_labels,
        name: fqn,
        namespace: namespace_name,
    },
    spec: {
        revisionHistoryLimit: 3,
        replicas: num_replicas,
        selector: {
            matchLabels: ui_labels
        },
        template: {
            metadata: {
                name: fqn,
                namespace: namespace_name,
                labels: ui_labels
            },
            spec: {
                containers: [
                    {
                        name: config.appName,
                        image: image,
                        readinessProbe: {
                            httpGet: {
                                path: '/',
                                port: port,
                                scheme: 'HTTP'
                            }
                        },
                        resources: {
                            requests: {
                                cpu: '50m',
                                memory: '100Mi'
                            }
                        }
                    }
                ],
            }
        }
    }
};

local service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
        name: fqn,
        namespace: namespace_name,
        labels: ui_labels
    },
    spec: {
        selector: ui_labels,
        ports: [
            {
                port: port,
                name: 'http'
            }
        ]
    }
};

local ingress = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Ingress',
    metadata: {
        name: fqn + '-ui',
        namespace: namespace_name,
        labels: ui_labels,
        annotations: {
            'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
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
                        {
                            backend: {
                                serviceName: fqn,
                                servicePort: port
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
    deployment,
    service
]
