/**
 * This file defines the infrastructure we need to run the API endpoint on Kubernetes.
 *
 * For more information on the JSONNET language, see:
 * https://jsonnet.org/learning/getting_started.html
 */

local common = import '../../common/.skiff/common.libsonnet';
local model = import '../model.json';

function(image, cause, sha, env, branch, repo, buildId)
    // This tells Kubernetes what resources we need to run.
    // For more information see:
    // https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes
    local cpu = '50m';
    local memory = '1Gi';
    common.APIEndpoint(model.id, image, cause, sha, cpu, memory, env, branch, repo, buildId)
