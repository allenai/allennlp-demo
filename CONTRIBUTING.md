# Contributing a new model to the demo

The following describes the steps necessary to add a
model implemented in [allennlp](https://github.com/allenai/allennlp) to the online demo.

These assume that the model to be added to the demo is already available in master of allennlp.
We will follow the implementation of the SRL demo as an example.

## Instructions

1. Fork and clone [allennlp-demo](https://github.com/allenai/allennlp-demo), then follow installation instructions.
2. `Dockerfile`:
   * Make sure the commit id for `allennlp/commit` points to a commit where your model is implemented.  Alternatively, you can use a release that includes your model with, for example, `allennlp/allennlp:v0.6.2`.
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
   * Import the model component implemented in the previous step:
   ```python 
   import SrlComponent from './components/SrlComponent';
   ```
   * In the instantiation of `ModelComponent`, add an `else if` clause returning an instance of your new component:
   ```python
      else if (selectedModel === "semantic-role-labeling") {
          return (<SrlComponent requestData={requestData} responseData={responseData}/>)
      }
    ```
7. `app.py`:
   * Add a `app.route` to the html page, using the same name provided in step (2).  This allows users to link directly to your model.
   ```python
   @app.route('/semantic-role-labeling/<permalink>')
   ```
