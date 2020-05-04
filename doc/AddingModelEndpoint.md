# Adding a New Model Endpoint

This document outlines how to add a new model API endpoint.

A list of endpoints can be found [here](https://github.com/allenai/reviz/issues/61).
Please put your Github handle in parenthesis next to the models you're
converting to avoid duplicating work.

You should probably work through these by task, where each task correlates to one
of the left-hand links in the [demo](https://demo.allennlp.org). Once you've
selected a model, follow these steps to port it to the new solution:

1. First, make a directory for the model. For the purpose of this example let's
   assume our model is named `OscarDROP`:

    ```bash
    mkdir allennlp_demo/oscar_drop
    ```

2. Now let's copy over the files we need. To do this we copy files from the
   `allennlp_demo/bidaf` directory as it's a good starting point:

    ```bash
    cd allennlp_demo/oscar_drop
    rsync -rv --filter="- __pycache__" --filter="- .pytest_cache" \
        ../oscar_drop/ ./
    ```

3. Next, open up the `Dockerfile` and replace all instances of `bidaf/` with
   `oscar_drop/`.

4. Now open up `models.json` in the root and copy over the model's configuration
   into `oscar_drop/model.json`.

    - You should omit the `max_request_length` and `memory` values.
      The `max_request_length` value is enforced by the cluster
      ingress controller and the `memory` value is configured in a different
      location.
    - You'll also need to add an `id` field. The `id` should be all
      lowercase, use `-` instead of `_` and be URL friendly. It also must be
      unique. Let's use `oscar` for `OsarDROP`, as we don't think we'll apply
      the grouch to anything else.

5. Next edit `api.py`. Replace all instances of `Bidaf` with `OscarDROP` so
   that `BidafModelEndpoint` becomes `OscarDROPModelEndpoint`.

6. Now open up `test_api.py` and do the same. You'll also need to replace the
   `allennlp_demo.bidaf` import with `allennlp_demo.oscar_drop`.

7. At this point it's time to build a Docker image and run the tests. You should
   do this in the `allennlp_demo` directory.

    ```bash
    cd allennlp_demo
    docker build -f oscar_drop/Dockerfile -t oscar_drop:latest && \
        docker run --rm -it --entrypoint pytest oscar_drop:latest -x -ra
    ```

8. If the tests pass, move on to the next step. If they don't, then you'll need
   figure out what's wrong. If there's issues building the container you may
   need to install additional dependencies or change the AllenNLP version.
   If the endpoint won't start you may need to modify the endpoint code and
   the tests. You can override methods in the [ModelEndpoint](https://github.com/allenai/allennlp-demo/blob/master/allennlp_demo/common/http.py#L55)
   class to provide custom behavior as needed. Don't hesitate to ping Sam as
   this point for help, as this can be nuansced.

9. Push your code to a branch attached to the origin (Google Cloud Build cannot
   access your fork by default):

    ```bash
    git add .
    git commit -m "Oscar may be a grouch, but he's great at NLP."
    git push origin oscar
    ```

10. After pushing the code it's time to create a Google Cloud Build trigger
    that deploys the endpoint. This is a multi-step process:

    1. Start by going [here](https://console.cloud.google.com/cloud-build/triggers?project=ai2-reviz&enabled_repos_list=%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22allennlp-demo_5C_22_22%257D%255D).

    2. Find the trigger named `allennlp-demo-bidaf-deploy-prod`, click the
       three dots on the right and select "Duplicate."

    3. The duplicate will be named `allennlp-demo-bidaf-deploy-prod-1`. Find
       that entry, click the three dots again and select "Edit" this time.

    4. Change the name by replacing `bidaf` with your model's id `oscar`
       and by removing the `-1` suffix.

    5. Edit the `branch` and temporarily set to the branch where your code
       is pushed, so `^oscar$`.

    6. Edit the "Included files filter", removing `allennlp_demo/bidaf/**/*`
       and adding `allennlp_demo/oscar_drop/**/*` instead.

    7. Change the `_MODEL_PATH` substitution variable to the name of the
       directory that containers your model, in this case that's `oscar_drop`.

    8. Save the changes and go back to the list of triggers.

11. Find the trigger you just edited and click "Run trigger." Once the notification
    appears informing you that a build has started, click "Show" to see the
    build progress.

12. If things fail you'll need to figure out why. You might need to edit the
    CPU, RAM or the startup time -- all of which can be changed by editing
    `oscar_drop/.skiff/webapp.jsonnet`.  Again don't hesitate to ping Sam
    here as this can be a little tricky.

13. Once the deploy is working edit the trigger and change the branch back to
    `^master$`.

14. Go through the regular PR cycle. Once the code merges to `master` you're
    all set.

At this point the new endpoint is deployed alongside the old one. The effort
to port the UI to use these new endpoints will be executed separately.

