This presents a guide for (1) adding interpretations to your allennlp model, and (2) creating a new interpretation method in AllenNLP and displaying it on the AllenNLP demos.

# Interpreting A New Model

The following assumes you have followed the steps to add a model to the [AllenNLP demo](https://github.com/allenai/allennlp-demo/blob/master/README.md).

1. You need to modify your predictor to include a function `predictions_to_labeled_instances` if you want to be able to have interpretations and attacks. This function will convert the model's output (e.g., class probabilities) into a predicted label and add this label to the instance passed in. For example, for classification this function takes the argmax of the class probabilities. A good template to start with would be the [Sentiment Analysis predictor](https://github.com/allenai/allennlp/blob/master/allennlp/predictors/text_classifier.py). 

2. Modify the front-end to include the interpretation and attack components. See the [Sentiment Analysis front end](https://github.com/IsThatYou/allennlp-demo/blob/attack_demo/demo/src/components/demos/SentimentAnalysis.js) for an example template. The four lines below create dropdowns for Input Reduction, HotFlip, gradient-based interpretations, and integrated gradients. 
```js
<InputReductionItem attackDataObject={attackData} attackModelObject={attackModel} requestDataObject={requestData}/>                              
<HotflipItem attackDataObject2={attackData2} attackModelObject2={attackModel2} requestDataObject2={requestData}/>                             
<InterpretationSingleInput interpretData={interpretData} tokens={tokens} interpretModel = {interpretModel} requestData = {requestData} interpreter={GRAD_INTERPRETER}/>        
<InterpretationSingleInput interpretData={interpretData} tokens={tokens} interpretModel = {interpretModel} requestData = {requestData} interpreter={IG_INTERPRETER}/>        
```

where: 
- `attackData` contains the original and final tokens after Input Reduction is applied 
- `attackModel` is a method on the [Model class](https://github.com/IsThatYou/allennlp-demo/blob/attack_demo/demo/src/components/Model.js) that sends a request to the allennlp API for an Input Reduction attack
- `attackData2` contains the original and final input after HotFlip is applied. It also contains the new prediction of the model for the flipped input. 
- `attackModel2` is a method on the [Model class](https://github.com/IsThatYou/allennlp-demo/blob/attack_demo/demo/src/components/Model.js) that sends a request to the allennlp API for a HotFlip attack
- `requestData` contains the raw (not tokenized) input(s) to the model and the interpreter to use
- `interpretData` contains the values of the normalized saliency scores for the input tokens
- `tokens` are the input tokens of the model
- `interpretModel` is a method on the [Model class](https://github.com/IsThatYou/allennlp-demo/blob/attack_demo/demo/src/components/Model.js) that sends a request to the allennlp API to interpret the model (using a technique specified in the request)

# Adding a New Interpretation Method

Below are the steps to add a new interpretation/attack method and the corresponding front-end visualization.

We will walk through adding the [SmoothGrad](https://arxiv.org/abs/1706.03825) gradient-based interpretation method from scratch. We will first modify the [AllenNLP repo](https://github.com/allenai/allennlp) to create the interpretation method. Then, we will  modify the [AllenNLP Demo repo](https://github.com/allenai/allennlp-demo) to create the front end visualization.

## Instructions
1. Fork and clone [AllenNLP from source](https://github.com/allenai/allennlp#installing-from-source), so that the library is editable.

2. The interpretations live inside `allennlp/interpret`, the saliency-based methods are in `allennlp/interpret/saliency_interpreters`. Create a new file for your interpretation method inside that folder, e.g., `smooth_gradient.py`. Now, you must implement the logic for your interpretation method inside a `saliency_interpret_from_json()` function. In SmoothGrad's case, we compute the gradient averaged over many noisy versions of the input. (For our implementation, we copied the integrated_gradient file and modified a few lines accordingly). The general structure for your new interpretation method file will be as follows: 
```py
from allennlp.interpretation import Interpreter
from allennlp.common.util import JsonDict
# include any other imports you may need here

@Interpreter.register('your-interpretation-method')
class MyFavoriteInterpreter(interpreter):
  def __init__(self, predictor):
    super().__init__(predictor)

  def saliency_interpret_from_json(self, inputs: JsonDict) -> JsonDict:    
    # ** implement your interpretation technique here **

```
You can see the final code with a commented walkthrough [here](https://github.com/allenai/allennlp/blob/master/allennlp/interpret/saliency_interpreters/smooth_gradient.py).

3. Add your new class to the `__init__.py` file in  `allennlp/interpret/saliency_interpreters/__init__.py`. In our case we add the line `from allennlp.interpret.saliency_interpreters.smooth_gradient import SmoothGradient`. 

You are done with the interpretation method, let's move on to the front end. We will demonstrate adding SmoothGrad to the Sentiment Analysis demo.

4. First, fork and clone the [AllenNLP Demo repo](https://github.com/allenai/allennlp-demo). 

5. In `app.py`, you need to register the Interpreter for Smoothgrad. After importing your interpretation method:
```py
from allennlp.interpret.saliency_interpreters import SimpleGradient, IntegratedGradient, SmoothGradient
```
Register the SmoothGradient interpreter in the `make_app()` function:
```py
app.interpreters[name]['smooth_gradient'] = SmoothGradient(predictor)
```

6. Add the front-end title and description for SmoothGrad into the shared interpretation component [here](https://github.com/allenai/allennlp-demo/blob/master/demo/src/components/Saliency.js).

7. Add your SmoothGrad method to the [Sentiment Analysis](https://github.com/allenai/allennlp-demo/blob/master/demo/src/components/demos/SentimentAnalysis.js) demo using the reusable HTML component.
