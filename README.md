# AllenNLP Demo

This repository contains the [AllenNLP demo](https://demo.allennlp.org).

## Development

To run the demo locally for development, you will need to:

1. Create a fresh environment:

    ```
    conda create -n allennlp-demo python=3.6
    source activate allennlp-demo
    pip install -r requirements.txt
    ```

2.  Install the version of AllenNLP you would like to use.

    a.  To install the latest release, run `pip install allennlp`.

    b.  If you would like to use the same version this commit was tested on, please look in the
        Dockerfile and install that commit.

        ```
        git+git://github.com/allenai/allennlp.git@$SOURCE_COMMIT`.
        ```

    c.  To install AllenNLP from source you can use `pip install --editable .`

2. Build the frontend and start a development frontend service

    ```
    ./scripts/build_demo.py
    cd demo
    npm run start
    ```

    This will start a frontend service locally, which will hot refresh when you make changes to the JS.

3. (Optional) Set up a local DB for storing permalinks.

    ```
    brew install postgresql
    pg_ctl -D /usr/local/var/postgres start
    psql -d postgres -a -f scripts/local_db_setup.sql
    export DEMO_POSTGRES_HOST=localhost
    export DEMO_POSTGRES_DBNAME=postgres
    export DEMO_POSTGRES_USER=$USER
    ```

4. Start the backend service

    ```
    ./app.py
    ```

    Normally, the backend server would manage the frontend assets as well - the JS has a special hack for if it is running on port 3000 (which it does by default if you are running the unoptimized JS using `npm run start`), it will look for the backend service at port 8000. Otherwise, it serves the backend and the frontend from the same port.


## Running with Docker

Here is an example for how to manually build the Docker image and run the demo on port 8000.

```
$ export GIT_HASH=`git log -1 --pretty=format:"%H"`
$ docker build -t allennlp/demo:$GIT_HASH .
$ mkdir -p $HOME/.allennlp
$ docker run -p 8000:8000 -v $HOME/.allennlp:/root/.allennlp --rm allennlp/demo:$GIT_HASH
```

Note that the `run` process may get killed prematurely if there is insufficient memory allocated to Docker. As of September 14, 2018, setting a memory limit of 10GB was sufficient to run the demo. See [Docker Docs](https://docs.docker.com/docker-for-mac/#advanced) for more on setting memory allocation preferences.





## Contributing a new model to the demo

The following describes the steps to add a new [AllenNLP](https://github.com/allenai/allennlp) model to the online [AllenNLP demo](https://demo.allennlp.org).

To begin, we assume you have an AllenNLP model with the code for the model in `allennlp/models/`. First, create an AllenNLP Predictor for your model in `allennlp/predictors`. A good template to start with would be the [Sentiment Analysis predictor](https://github.com/allenai/allennlp/blob/master/allennlp/predictors/text_classifier.py).

With the predictor set up, we will now consider two possible scenarios: 

1. The task your model solves is already available in the demos (e.g., adding a new textual entailment model). 

2. You are creating a demo for a task that is not in the demos (below we pretend Sentiment Analysis is not present in the demo to illustrate this process). 

### Adding a New Model for an Existing Task

Adding a new model for a task that exists in the demos is a one line change of code: 

1. Fork and clone [allennlp-demo](https://github.com/allenai/allennlp-demo) and follow the installation instructions.

2. Modify the line that points to the saved model in `models.json`. For example, we can replace the link to the current textual entailment model `https://storage.googleapis.com/allennlp-public-models/decomposable-attention-elmo-2018.02.19.tar.gz` with the path to another archived AllenNLP model `my_model.tar.gz`. Note that if you specify a relative path to the gzip file, the path should start from the root directory of the project (the directory with `app.py` in it). If you run the demo now, you should see your model and the corresponding interpretations and attacks visualized.

3. If you want to add another model option for a task, instead of replacing the existing model, see the NER and reading comprehension demos, where a radio button is added.

### Creating a Demo for a New Task

If your task is not implemented in the AllenNLP demos, we will need to create the code to run the model predictions, as well as the front-end JavaScript/HTML to display its predictions and interpretations. We will use Sentiment Analysis as a running example.

Here is a [pull request](https://github.com/allenai/allennlp-demo/commit/149d068ccb970d93c1eaf93618a5b16c08cd6582) that implements the below steps. Feel free to follow that code as a guide.

1. Fork and clone [allennlp-demo](https://github.com/allenai/allennlp-demo) and follow the installation instructions.

2. Add the path to your trained model using a `DemoModel` in `models.json`. For example, we will add 
```json        
        "sentiment-analysis": {
           "archive_file": "https://s3-us-west-2.amazonaws.com/allennlp/models/sst-2-basic-classifier-glove-2019.06.27.tar.gz",
           "predictor_name": "text_classifier",
           "max_request_length": 1000
        },   
```
Make sure `text_classifiers` matches the name from your AllenNLP predictor. In our case, the predictor class should have `@Predictor.register('text_classifier')`. 

3. In `app.py` consider adding logging of your model's outputs. Search for `log_blob` in the `predict` route for an example of how to do this.

4. The backend is now set up. Now let's create the front end for your model. Add your model under its associated category in the `modelGroups` object in `demo/src/models.js`. 
```
{model: "sentiment-analysis", name: "Sentiment Analysis", component: SentimentAnalysis}
```
Also make sure to import your component at the top of the file.

5. Create a new JavaScript file for your model in `demo/src/components/demo`. The JavaScript follows a basic template that can be copied from other files. See the [Sentiment Analysis front end](https://github.com/allenai/allennlp-demo/blob/149d068ccb970d93c1eaf93618a5b16c08cd6582/demo/src/components/demos/SentimentAnalysis.js) for an example template.

You can find more information about the front end creation below.

### More Information on the Front End

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
