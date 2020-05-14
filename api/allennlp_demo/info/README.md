# Info Service

This service lists all endpoints on the cluster and some information about them.

## Running this Locally

To run this locally you'll need to install `kubectl` and the
[Google Cloud SDK](https://cloud.google.com/sdk).

After both are installed you'll need to authenticate your local `kubectl` client against the
Skiff cluster. To do so ask someone from [reviz@allenai.org](mailto:reviz@allenai.org).

## One Time Setup

To run the service on a Kubernetes cluster, have an administrator run this command once:

```bash
kubectl create -f .skiff/role.json
```
