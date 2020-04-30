/**
 * This file contains common code that's used to generate the Kubernetes config for individual
 * model endpoints.
 *
 * For more information on the JSONNET language, see:
 * https://jsonnet.org/learning/getting_started.html
 */

local config = import '../../../skiff.json';

{
    ModelEndpoint(modelId, image, cause, sha, cpu, memory, env, branch, repo, buildId):
        // We deploy everything in a single namespace so names need to be fully qualified to
        // prevent collissions. We don't use the canonical `config.appName` to avoid long
        // names for things.
        local fullyQualifiedName = 'mapi-' + modelId + '-' + env;

        // Every resource is tagged with the same set of labels. These labels serve the
        // following purposes:
        //  - They make it easier to query the resources, i.e.
        //      kubectl get pod -l app=my-app,env=staging
        //  - The service definition uses them to find the pods it directs traffic to.
        local namespaceLabels = {
            app: config.appName,
            contact: config.contact,
            team: config.team
        };

        local namespace = {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
                name: config.appName,
                labels: namespaceLabels
            }
        };

        local labels = namespaceLabels + {
            env: env,
            model: modelId
        };

        // By default multiple instances of your application could get scheduled
        // to the same node. This means if that node goes down your application
        // does too. We use the label below to avoid that.
        local antiAffinityLabels = {
            onlyOneOfPerNode: config.appName + '-' + env
        };
        local podLabels = labels + antiAffinityLabels;

        // Annotations carry additional information about your deployment that
        // we use for auditing, debugging and administrative purposes
        local annotations = {
            'apps.allenai.org/sha': sha,
            'apps.allenai.org/branch': branch,
            'apps.allenai.org/repo': repo,
            'apps.allenai.org/build': buildId
        };

        // The port the Flask application listens on.
        local apiPort = 8000;

        // In production we run two versions of your application, as to ensure that
        // if one instance goes down or is busy, end users can still use the application.
        // In all other environments we run a single instance to save money.
        local replicas =
            if env == 'prod' then
                2
            else
                1;

        local deployment = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                labels: labels,
                name: fullyQualifiedName,
                namespace: namespace.metadata.name,
                annotations: annotations + {
                    'kubernetes.io/change-cause': cause
                }
            },
            spec: {
                revisionHistoryLimit: 3,
                replicas: replicas,
                selector: {
                    matchLabels: labels
                },
                template: {
                    metadata: {
                        name: fullyQualifiedName,
                        namespace: namespace.metadata.name,
                        labels: podLabels,
                        annotations: annotations
                    },
                    spec: {
                        # This block tells the cluster that we'd like to make sure
                        # each instance of your application is on a different node. This
                        # way if a node goes down, your application doesn't:
                        # See: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#node-isolation-restriction
                        affinity: {
                            podAntiAffinity: {
                                requiredDuringSchedulingIgnoredDuringExecution: [
                                    {
                                    labelSelector: {
                                            matchExpressions: [
                                                {
                                                        key: labelName,
                                                        operator: 'In',
                                                        values: [ antiAffinityLabels[labelName], ],
                                                } for labelName in std.objectFields(antiAffinityLabels)
                                        ],
                                        },
                                        topologyKey: 'kubernetes.io/hostname'
                                    },
                                ]
                            },
                        },
                        containers: [
                            {
                                name: fullyQualifiedName,
                                image: image,
                                # Stop serving traffic if the container is busy doing something
                                # else.
                                readinessProbe: {
                                    httpGet: {
                                        port: apiPort,
                                        scheme: 'HTTP',
                                        path: '/?check=readiness_probe'
                                    },
                                    periodSeconds: 10,
                                    failureThreshold: 1,
                                },
                                # Restart the container if the container doesn't respond for a
                                # a full minute.
                                livenessProbe: {
                                    httpGet: {
                                        port: apiPort,
                                        scheme: 'HTTP',
                                        path: '/?check=liveness_probe'
                                    },
                                    periodSeconds: 10,
                                    failureThreshold: 6,
                                    initialDelaySeconds: 120
                                },
                                resources: {
                                    requests: {
                                        cpu: cpu,
                                        memory: memory
                                    }
                                },
                            }
                        ]
                    }
                }
            }
        };

        local service = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: fullyQualifiedName,
                namespace: namespace.metadata.name,
                labels: labels,
                annotations: annotations
            },
            spec: {
                selector: labels,
                ports: [
                    {
                        port: apiPort,
                        name: 'http'
                    }
                ]
            }
        };

        // In production we use demos.allennlp.org, everywhere else we use the Skiff TLD.
        local topLevelDomain =
            if env == 'prod' then
                'demo.allennlp.org'
            else
                '.apps.allenai.org';
        local hosts = [
            if env == 'prod' then
                topLevelDomain
            else
                config.appName + '.' + env + topLevelDomain
        ];


        local ingress = {
            apiVersion: 'networking.k8s.io/v1beta1',
            kind: 'Ingress',
            metadata: {
                name: fullyQualifiedName,
                namespace: namespace.metadata.name,
                labels: labels,
                annotations: annotations + {
                    'certmanager.k8s.io/cluster-issuer': 'letsencrypt-prod',
                    'kubernetes.io/ingress.class': 'nginx',
                    'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
                    'nginx.ingress.kubernetes.io/proxy-body-size': '0.5m',
                    // We route requests for `/api/:modelId` to the container. This setting trims
                    // that prefix when forwarding the request to the container, so that
                    // /api/:modelId/predict becomes /predict.
                    'nginx.ingress.kubernetes.io/rewrite-target': '/$2'
                }
            },
            spec: {
                tls: [
                    {
                        secretName: fullyQualifiedName,
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
                                        serviceName: service.metadata.name,
                                        servicePort: apiPort
                                    },
                                    path: '/api/' + modelId + '(/(.*))?'
                                }
                            ]
                        }
                    } for host in hosts
                ]
            }
        };

        [
            namespace,
            deployment,
            service,
            ingress
        ]
}
