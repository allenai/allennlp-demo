# How To Add a Demo

Adding a demo is easy!
Here we assume you have some API endpoint that accepts a JSON input
and returns some JSON output. Typically this endpoint represents
an AllenNLP `Predictor` (wrapping an AllenNLP `Model`), but really
it could be anything.

In this document we'll walk through the construction of our `ReadingComprehension` demo.
The corresponding API expects inputs that look like

```js
{passage: "The Matrix is ...", question: "Who starred in ..."}
```

and returns a result that looks like

```js
{best_span: [24, 25], best_span_str: "Keanu Reeves", ...}
```

## Creating the Demo

### Step 0: Some Conventions

* `requestData`: a JSON object representing data you send over the wire to the API
* `responseData`: a JSON object representing the response from the API

### Step 1: Title and Description

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

### Step 2: Input Fields

Unless you are doing something outlandish, you can just specify the input fields declaratively:

```js
const fields = [
    {name: "passage", label: "Passage", type: "TEXT_AREA", placeholder: `"Saturn is ... "`}
    {name: "question", label: "Question", type: "TEXT_INPUT", placeholder: `"What does ... "`}
]
```

Currently the only other fields implemented are a `"SELECT"` and a `"RADIO"` field,
which take an `options` parameter specifying its choices.


### Step 3: Examples

All of our demos have a dropdown with pre-written examples to run through the model.
These are specified as you'd expect:

```js
const examples = [
    {passage: "A reusable launch system ... ", question: "How many ... "},
    {passage: "Robotics is an ... ", question: "What do robots ... "}
]
```

Notice that the keys of the examples correspond to the field names.

### Step 4: Endpoint

The endpoint should be specified as a function that takes `requestData` and returns a URL.
In most cases this will be a constant function; however, if you wanted your demo to query different endpoints
based on its inputs, that logic would live here:

```js
const apiUrl = () => `http://my-api-server:8000/predict/reading-comprehension`
```

### Step 5: The Demo Output

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

### Step 6: The Demo Component

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

### Step 7: Adding Your New Model to the Menu

Go to `src/models.js`. First you'll need to import your new component:

```js
import ReadingComprehension from './components/demos/ReadingComprehension';
```

And then you'll need to add it to the list of models:

```js
{model: "reading-comprehension", name: "Reading Comprehension", component: ReadingComprehension}
```

And that's it, you've added a model!
