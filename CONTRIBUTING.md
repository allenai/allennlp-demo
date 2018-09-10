# Contributing a new model to the demo

The following describes the steps necessary to add a
model implemented in [allennlp](https://github.com/allenai/allennlp) to the online demo.

These assume that the model to be added is available in the main fork of allennlp.
In all these steps, we will follow the implementation of the SRL demo as an example.

## Instructions

1. Fork and clone [allennlp-demo](https://github.com/allenai/allennlp-demo), then follow installation instructions.
2. `Dockerfile`:
   * Make sure the commit id for `allennlp/commit` points to a commit where your model is implemented.
3. `server/models.py`:  Instantiate a `DemoModel` object in the `MODELS` dictionary.
   * Provide a url to the trained model (e.g., `https://s3-us-west-2.amazonaws.com/allennlp/models/srl-model-2018.05.25.tar.gz`).
4. `demo/src/components/menu.js`:
   * Add a `buildLink` clause:
   ```js
   {buildLink("semantic-role-labeling", "Semantic Role Labeling")}
   ```
5. `demo/src/components/`:
   * Add a `<your-model-name>Component.js` file. 
   * this is where most of the model-specific js logic is implemented. See `demo/src/components/SrlComponent.js` for example.
6. `demo/src/app.js`:
   * Import the model component implemented in the previous step, e.g., `import SrlComponent from './components/SrlComponent';`
   * In the instantiation of `ModelComponent`, add an `else if` clause returning an instance of your new component, e.g.:
     ```
        else if (selectedModel === "open-information-extraction") {
        return (<OpenIeComponent requestData={requestData} responseData={responseData}/>)
        }
     ```
7. `app.py`:
   * Add a `app.route` to the html page, using the same name provided in step (2), e.g.,
   ```
   @app.route('/semantic-role-labeling/<permalink>')
   ```

