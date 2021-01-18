/**
 * This file contains common code that's used to generate the Kubernetes config for individual
 * model endpoints.
 *
 * For more information on the JSONNET language, see:
 * https://jsonnet.org/learning/getting_started.html
 */

local config = import '../../../../skiff.json';
local db = import 'db.libsonnet';

{
    /**
     * @param id            {string}    A unique identifier for the endpoint. This identifier
     *                                  must be URL safe, as it's used to determine what requests
     *                                  are routed to the endpoint. For instance, if the id is
     *                                  `foo`, requests beginning with `/api/foo` are routed
     *                                  to the endpoint.
     * @param image         {string}    The image tag to deploy.
     * @param cause         {string}    A message describing the reason for the deployment.
     * @param sha           {string}    The git sha.
     * @param env           {string}    A unique identifier for the environment. This determines the
     *                                  the hostname that'll be used, the number of replicas, and more.
     *                                  If set the 'prod' this deploys to demo.allennlp.org.
     * @param branch        {string}    The branch name.
     * @param repo          {string}    The repo name.
     * @param buildId       {string}    The Google Cloud Build ID.
     * @param startupTime   {number}    The amount of time in seconds the container should take to
     *                                  start. If this is set too low your container will get into
     *                                  a restart loop when it's started. Defaults to 120 seconds.
     * @param useDb         {boolean}   If true the required resources will provision to provide
     *                                  a secure connection to the database. The required secrets
     *                                  must be manually provisioned by system administrator.
     * @param maxBodySize   {string}    Maximum size of allowed HTTP body payload. For example,
     *                                  '10M'. See NGINX docs for syntax:
     *                                      Sizes can be specified in bytes, kilobytes (suffixes k
     *                                      and K) or megabytes (suffixes m and M), for example,
     *                                      "1024”, "8k”, "1m”.
     *                                  NGINX docs: http://nginx.org/en/docs/syntax.html
     */
    APIEndpoint(id, image, cause, sha, cpu, memory, env, branch, repo, buildId, startupTime=120, useDb=false, maxBodySize = '0.5m'):
        // Different environments are deployed to the same namespace. This serves to prevent
        // collissions.
        local fullyQualifiedName = config.appName + '-api-' + id + '-' + env;

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
                name: config.appName + '-api-' + id,
                labels: namespaceLabels
            }
        };

        local labels = namespaceLabels + {
            env: env,
            endpoint: id
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
                                    initialDelaySeconds: startupTime,
                                },
                                resources: {
                                    requests: {
                                        cpu: cpu,
                                        memory: memory
                                    }
                                },
                            # Add the database configuration as environment variables if we need
                            # them.
                            } + if useDb then
                                    { env: db.EnvironmentVariables() }
                                else
                                    {},
                        # If we need the DB we run Google's Cloud SQL Proxy which provides
                        # a secure tunnel to the database. Connecting to localhost:5432 routes
                        # to the database via a mTLS encrypted tunnel.
                        ] + if useDb then
                                [ db.containers.CloudSQLProxy() ]
                            else
                                []
                    # This volume provides the secrets required by the CloudSQL proxy. They're
                    # mounted in as files. This is a better setup for Kubernetes and something
                    # we should transition the database configuration to at some point. It allows
                    # secrets to be updated without a container restart, which make rotating them
                    # easier.
                    } + if useDb then
                            { volumes: [ db.volumes.CloudSQLServiceAccountCreds() ] }
                        else
                            {}
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
                    'kubernetes.io/ingress.class': 'nginx',
                    'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
                    'nginx.ingress.kubernetes.io/proxy-body-size': maxBodySize,
                    // We trim the prefix before sending requests to the container, so a request for
                    // /api/$path_prefix/foo becomes /foo.
                    'nginx.ingress.kubernetes.io/rewrite-target': '/$2'
                }
            },
            spec: {
                tls: [
                    // We explicitly omit secretName here, which is optional, so that the root
                    // certificate that's managed by the UI is used instead.
                    {
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
                                    path: '/api/' + id + '(/(.*))?$'
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
