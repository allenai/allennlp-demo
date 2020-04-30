/**
 * This file defines the infrastructure we need to run the API endpoint on Kubernetes.
 *
 * For more information on the JSONNET language, see:
 * https://jsonnet.org/learning/getting_started.html
 */

local common = import '../../common/.skiff/common.libsonnet';

/**
 * @param image     {string}    The image tag to deploy.
 * @param cause     {string}    A message describing the reason for the deployment.
 * @param sha       {string}    The git sha.
 * @param env       {string}    A unique identifier for the environment. This determines the
 *                              the hostname that'll be used, the number of replicas, and more.
 *                              If set the 'prod' this deploys to demo.allennlp.org.
 * @param branch    {string}    The branch name.
 * @param repo      {string}    The repo name.
 * @param buildId   {string}    The Google Cloud Build id.
 */
function(image, cause, sha, env, branch, repo, buildId)
    // This/sets/theTKubernetes resource requests associated with our endpoint.
    // For more information see:
    // https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes
    local cpu = '50m';
    local memory = '2Gi';
    common.ModelEndpoint('bidaf', image, cause, sha, cpu, memory, env, branch, repo, buildId)
