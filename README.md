# AllenNLP Demo

This repository contains the [AllenNLP demo](https://demo.allennlp.org).

## Development

To run the demo locally for development, you will need to:

1. Create a fresh environment:

    ```bash
    conda create -n allennlp-demo python=3.7
    conda activate allennlp-demo
    pip install -r requirements.txt
    ```

2.  Install the version of AllenNLP you would like to use.

    a.  To install the latest release, run `pip install allennlp`.

    b.  If you would like to use the same version this commit was tested on, please look in the
        Dockerfile and install that commit.

        git+git://github.com/allenai/allennlp.git@$SOURCE_COMMIT`.

    c.  To install AllenNLP from source you can use `pip install --editable .`

2. Build the frontend and start a development frontend service

    ```bash
    ./scripts/build_demo.py
    cd demo
    npm run start
    ```

    This will start a frontend service locally, which will hot refresh when you make changes to the JS.

3. (Optional) Set up a local DB for storing permalinks.

    ```bash
    brew install postgresql
    pg_ctl -D /usr/local/var/postgres start
    psql -d postgres -a -f scripts/local_db_setup.sql
    export DEMO_POSTGRES_HOST=localhost
    export DEMO_POSTGRES_DBNAME=postgres
    export DEMO_POSTGRES_USER=$USER
    ```

4. Start the backend service. If you don't specify specific models, it will load every model in the demo, which might use more memory than you have available. If your goal is to test out one or two models, you should load them exclusively:

    ```bash
    ./app.py --model model1 --model model2
    ```

    Where you see "model1" and "model2" examples above, you would use actual model names which are listed as JSON object key names [here](https://github.com/allenai/allennlp-demo/blob/master/models.json).

    e.g.
    ```bash
    ./app.py --model reading-comprehension
    ```

    If you really want to load every model, you can do that with

    ```bash
    ./app.py
    ```

    Normally, the backend server would manage the frontend assets as well - the JS has a special hack for if it is running on port 3000 (which it does by default if you are running the unoptimized JS using `npm run start`), it will look for the backend service at port 8000. Otherwise, it serves the backend and the frontend from the same port.


## Running with Docker

Here is an example for how to manually build the Docker image and run the demo on port 8000.
As above, you probably don't want to load every model,
so you should specify the specific models you want in your `docker run` command.

```bash
export GIT_HASH=`git log -1 --pretty=format:"%H"`
docker build -t allennlp/demo:$GIT_HASH .
mkdir -p $HOME/.allennlp
docker run -p 8000:8000 \
           -v $HOME/.allennlp:/root/.allennlp \
           --rm \
           allennlp/demo:$GIT_HASH \
           --model model1 --model model2
```

Where you see "model1" and "model2" examples above, you would use actual model names which are listed as JSON object key names [here](https://github.com/allenai/allennlp-demo/blob/master/models.json).

Note that the `run` process may get killed prematurely if there is insufficient memory allocated to Docker. As of September 14, 2018, setting a memory limit of 10GB was sufficient to run the demo. See [Docker Docs](https://docs.docker.com/docker-for-mac/#advanced) for more on setting memory allocation preferences.

## Deploying

The AllenNLP demo runs on [Skiff](https://github.com/allenai/skiff)
and is deployed using Google Cloud Build triggers. In particular, it runs on Kubernetes with each model getting its own container, along with a
container to serve the shared UI / menu.

Although (as in previous steps) the demo is able to run on a single machine
(modulo the memory pressure from loading all the models),
the Skiff version is distributed using Kubernetes as follows:

(1) there is a dedicated "demo front-end" container that doesn't load any models
(2) the ingress controller routes e.g. /predict/reading-comprehension to a dedicated "reading comprehension" container
(3) that container loads only the machine comprehension model

See the comments in `src/App.js` for more detail.

Every commit to the `master` branch will deploy to [demo.staging.allennlp.org](https://demo.staging.allennlp.org).

To deploy the production demo, merge this branch into the `release` branch.

## Monitoring

You can access the demo logs through [Marina](https://marina.apps.allenai.org/a/allennlp-demo),
which links to GCP, or by visiting GCP directly. The two that are most frequently useful are

* [Cloud Build - History](https://console.cloud.google.com/cloud-build/builds?project=ai2-reviz&query=results.images.name%3D%20%22gcr.io%2Fai2-reviz%2Fallennlp-demo%22) (where you can see if / why your builds failed)
* [Kubernetes Engine - Workloads](https://console.cloud.google.com/kubernetes/workload?project=ai2-reviz&workload_list_tablesize=50&workload_list_tablequery=%255B%257B_22k_22_3A_22is_system_22_2C_22t_22_3A11_2C_22v_22_3A_22_5C_22false_5C_22_22_2C_22s_22_3Atrue%257D_2C%257B_22k_22_3A_22metadata%252Fname_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22allennlp-demo-*_5C_22_22%257D%255D) (where you can find the various containers making up the service)

although you can get the logs directly through Marina.

## Contributing a new AllenNLP model to the demo

The following describes the steps to add a new [AllenNLP](https://github.com/allenai/allennlp) model to the online [AllenNLP demo](https://demo.allennlp.org).

We assume you already have an AllenNLP model with the code for the model in `allennlp/models/`. To begin, create an AllenNLP Predictor for your model in `allennlp/predictors`. A good template to start with would be the [Sentiment Analysis predictor](https://github.com/allenai/allennlp/blob/master/allennlp/predictors/text_classifier.py).

With the predictor set up, we will now consider two possible scenarios:

1. The task your model solves is already available in the demos (e.g., adding a new textual entailment model).

2. You are creating a demo for a task that is not in the demos (below we pretend Sentiment Analysis is not present in the demo to illustrate this process).

### Adding a New Model for an Existing Task

It should only you to change a single line of code to add a new model for a task that already exists in the demos.

1. Fork and clone [allennlp-demo](https://github.com/allenai/allennlp-demo) and follow the installation instructions.

2. Modify the line that points to the saved model in `models.json`. For example, we can replace the link to the current textual entailment model `https://storage.googleapis.com/allennlp-public-models/decomposable-attention-elmo-2018.02.19.tar.gz` with the path to another archived AllenNLP model `my_model.tar.gz` (where `my_model.tar.gz` is the model to interpret). Note that if you specify a relative path to the gzip file, the path should start from the root directory of the project (the directory with `app.py` in it). If you start the demo, you should see your model and the corresponding interpretation and attack visualizations.

3. If you want to add a model as an additional option (e.g., for side-by-side comparisons), you can add a radio button to toggle between models instead of replacing the existing model. See the NER and reading comprehension demos for an example.

### Creating a demo for a new task

If your task is not implemented in the AllenNLP demos, we will need to create code to query the model, as well as the create the front-end JavaScript/HTML to display the predictions, interpretations, and attacks. We will use Sentiment Analysis as a running example. Accordingly our model name will be `sentiment-analysis` and we will be using the `SentimentAnalysis` React component.

Here is a [pull request](https://github.com/allenai/allennlp-demo/commit/149d068ccb970d93c1eaf93618a5b16c08cd6582) that implements the below steps. Feel free to follow that PR as a guide.

1. Fork and clone [allennlp-demo](https://github.com/allenai/allennlp-demo) and follow the installation instructions.

2. Add the path to your trained model using a `DemoModel` in `models.json`. For example, we will add
    ```json
    "sentiment-analysis": {
      "archive_file": "https://s3-us-west-2.amazonaws.com/allennlp/models/sst-2-basic-classifier-glove-2019.06.27.tar.gz",
      "predictor_name": "text_classifier",
      "max_request_length": 1000
    },
    ```

Make sure `text_classifier` matches the name from your AllenNLP predictor. In our case, the predictor class should have `@Predictor.register('text_classifier')` at the top.

3. In `app.py` consider adding a log of your model's outputs. Search for `log_blob` in the `predict` function for an example of how to do this.

4. The backend is now set up. Now let's create the front end for your model. Add your model under its associated category in the `modelGroups` object in `demo/src/models.js`.
```js
{model: "sentiment-analysis", name: "Sentiment Analysis", component: SentimentAnalysis}
```
Also make sure to import your component at the top of the file.

5. Create a new JavaScript file for your model in `demo/src/components/demos`. The JavaScript follows a basic template that can be copied from other files. See the [Sentiment Analysis front end](https://github.com/allenai/allennlp-demo/blob/149d068ccb970d93c1eaf93618a5b16c08cd6582/demo/src/components/demos/SentimentAnalysis.js) for an example template.

You can find more information about the front end creation at the bottom of the README.

## Contributing a non-AllenNLP Model

The models in the demo are served using a Flask wrapper
and the most recent release of AllenNLP. However, at some point you may want
to contribute a model to the demo that doesn't run on AllenNLP,
that runs on a fork of AllenNLP, or that requires an older version of AllenNLP or PyTorch.

You can add such components to the demo by preparing a Docker image
that serves them. It needs to follow the following conventions.
You need to choose a unique name for your model, say, `my-new-model`. Then

* your Docker image should have a web server running on port 8000

* it should serve your front-end at the URL `/task/my-new-model`

* it should serve your back-end (assuming you have one) at `/predict/my-new-model`

You will then need to add an entry to `models.json` that looks like

```
    "my-new-model": {
        "image": "myNewModelImage"
    }
```

That references an environment variable that will be pulled in by jsonnet. In the "config" step of .skiff/cloudbuild-deploy.yaml add a line like:

```
    '--ext-str', 'myNewModelImage=registry/location/of/docker/image',
```

and finally modify `demo/src/models.js` to add its entry to the menu:

```
    {"model": "my-new-model", "name": "Descriptive Name"}
```

(you don't have to specify a `component` for it, as your Docker image is 100% responsible
 for serving the front-end however it wants to).

## Adding a New Interpretation Method

Here we describe the steps to add a new interpretation/attack method to AllenNLP, as well as how to create the corresponding front-end visualization.

We will walk through adding the [SmoothGrad](https://arxiv.org/abs/1706.03825) gradient-based interpretation method from scratch. We will first modify the [AllenNLP repo](https://github.com/allenai/allennlp) to create the interpretation method. Then, we will  modify the [AllenNLP Demo](https://github.com/allenai/allennlp-demo) repo to create the front-end visualization.

1. Fork and clone [AllenNLP](https://github.com/allenai/allennlp#installing-from-source) and install it from source using `pip install --editable`, so that the library is editable.

2. The interpretations live inside `allennlp/allennlp/interpret`. Create a new file for your interpretation method inside that folder, e.g., `allennlp/allennlp/interpret/saliency_interpreters/smooth_gradient.py`. Now, implement the code for your interpretation method. In SmoothGrad's case, we average the over many noisy versions of the input. As a guide, you can copy another method's code (e.g., Integrated Gradient at `allennlp/allennlp/interpret/saliency_interpreters/integrated_gradient.py`) and modify it accordingly. The general structure for the file is:

```py
from allennlp.interpret.saliency_interpreters.saliency_interpreter import SaliencyInterpreter
from allennlp.common.util import JsonDict
# include any other imports you may need here

@SaliencyInterpreter.register('your-interpretation-method')
class MyFavoriteInterpreter(SaliencyInterpreter):
    def __init__(self, predictor: Predictor) -> None:
        super().__init__(predictor)
        # local variables here

    def saliency_interpret_from_json(self, inputs: JsonDict) -> JsonDict:
    # ** implement your interpretation technique here **
```
You can see the final code for SmoothGrad [here](https://github.com/allenai/allennlp/blob/master/allennlp/interpret/saliency_interpreters/smooth_gradient.py).

3. Add your new class to the `__init__.py` file in  `allennlp/allennlp/interpret/saliency_interpreters/__init__.py`. In our case we add the line `from allennlp.interpret.saliency_interpreters.smooth_gradient import SmoothGradient
`.

4. You are done with the interpretation method! Let's move on to the front-end visualizations. We will demonstrate how to add SmoothGrad to the Sentiment Analysis demo. First, fork and clone the [AllenNLP Demo repo](https://github.com/allenai/allennlp-demo).

5. In `app.py`, import SmoothGradient at the top: `from allennlp.interpret.saliency_interpreters import SmoothGradient. Then, register the Interpreter for Smoothgrad in `make_app()`: add `app.interpreters[name]['smooth_gradient'] = SmoothGradient(predictor)` at the bottom of the function.

6. Add your interpretation method's name to `allennlp-demo/demo/src/components/InterpretConstants.js`. And add a header title for your method here `allennlp-demo/demo/src/components/Saliency.js`.

6. Add the call to the reusable visaulization component in the demo front-end. For example, SmoothGrad is implemented alongside Integrated Gradients in the `SaliencyMaps` constant inside `allennlp-demo/demo/src/components/demos/SentimentAnalysis.js`. Now you are done! Start the demo, and look inside Sentiment Analysis for the SmoothGrad visualizations.


## More Information on the Front End

__Step 0: Some Conventions__

* `requestData`: a JSON object representing data you send over the wire to the API
* `responseData`: a JSON object representing the response from the API

__Step 1: Title and Description__

The title is just a string:

```js
const title = "Reading Comprehension"
```

and the description as just JSX (or some other element):

```js
const description = (
    <span>
      <span>
        Reading Comprehension (RC) ... etc ... etc ...
      </span>
    </span>
)
```

If the description is long, add the descriptionEllipsed as just JSX (or some other element):

```js
const descriptionEllipsed = (
    <span>
        Reading Comprehension… // Note: ending in a …
    </span>
)
```

__Step 2: Input Fields__

Unless you are doing something outlandish, you can just specify the input fields declaratively:

```js
const fields = [
    {name: "passage", label: "Passage", type: "TEXT_AREA", placeholder: `"Saturn is ... "`}
    {name: "question", label: "Question", type: "TEXT_INPUT", placeholder: `"What does ... "`}
]
```

Currently the only other fields implemented are a `"SELECT"` and a `"RADIO"` field,
which take an `options` parameter specifying its choices.


__Step 3: Examples__

All of our demos have a dropdown with pre-written examples to run through the model.
These are specified as you'd expect:

```js
const examples = [
    {passage: "A reusable launch system ... ", question: "How many ... "},
    {passage: "Robotics is an ... ", question: "What do robots ... "}
]
```

Notice that the keys of the examples correspond to the field names.

__Step 4: Endpoint__

The endpoint should be specified as a function that takes `requestData` and returns a URL.
In most cases this will be a constant function; however, if you wanted your demo to query different endpoints
based on its inputs, that logic would live here:

```js
const apiUrl = () => `http://my-api-server:8000/predict/reading-comprehension`
```

__Step 5: The Demo Output__

Notice that we haven't actually built out the demo part of the demo.
Here's where we do that, as a React component.
This component will receive as props the `requestData` (that is, the JSON that was sent to the API)
and the `responseData` (that is, the JSON that was received back from the API).

The output for this model will contain an `OutputField` with the answer,
another `OutputField` containing the passage itself (with the answer highlighted),
and a third `OutputField` containing some visualizations of model internals.

(You don't have to use `OutputField`, but it looks nice.)

```js
const Output = ({ requestData, responseData }) => {
    const { passage } = requestData
    const { answer } = responseData
    const start = passage.indexOf(answer);
    const head = passage.slice(0, start);
    const tail = passage.slice(start + answer.length);

    return (
        <div className="model__content answer answer">
            <OutputField label="Answer">
                {answer}
            </OutputField>

            <OutputField label="Passage Context">
                <span>{head}</span>
                <span className="highlight__answer">{answer}</span>
                <span>{tail}</span>
            </OutputField>

            <OutputField>
                etc...
            </OutputField>
        </div>
    )
}
```

__Step 6: The Demo Component__

There is a pre-existing `Model` component that handles all of the inputs and outputs.
We just need to pass it the things we've already defined as `props`:

```js
const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}
```

Your `modelProps` needs to have these exact names, as that's what the `Model` component is expecting.

The demo uses react-router, so we wrap our component in `withRouter` and export it:

```js
export default withRouter(props => <Model {...props} {...modelProps}/>)
```
