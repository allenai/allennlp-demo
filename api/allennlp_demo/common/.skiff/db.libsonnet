{
    EnvironmentVariables(): [
        { name: "DEMO_POSTGRES_HOST",   value: "127.0.0.1"      },
        { name: "DEMO_POSTGRES_PORT",   value: "5432"           },
        { name: "DEMO_POSTGRES_DBNAME", value: "demo"           },
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
    ],
    containers: {
        CloudSQLProxy(): {
            name: "cloudsql-proxy",
            image: "gcr.io/cloudsql-docker/gce-proxy:1.11",
            command: [
                "/cloud_sql_proxy", "--dir=/cloudsql",
                "-instances=ai2-allennlp:us-central1:allennlp-demo-database=tcp:5432",
                "-credential_file=/secrets/cloudsql/credentials.json"
            ],
            securityContext: {
                runAsUser: 2,
                allowPrivilegeEscalation: false
            },
            volumeMounts: [
                {
                    name: "cloudsql-instance-credentials",
                    mountPath: "/secrets/cloudsql",
                    readOnly: true
                }
            ]
        }
    },
    volumes: {
        CloudSQLServiceAccountCreds(): {
            name: "cloudsql-instance-credentials",
            secret: {
                secretName: "cloudsql-instance-credentials"
            }
        },
    }
}
