import React from 'react';
import { withRouter } from 'react-router-dom';

import { FormField } from '../Form';
import Model from '../Model'
import NestedHighlight, { withHighlightClickHandling } from '../highlight/NestedHighlight';

const apiUrl = () => `/api/coreference-resolution/predict`

const title = "Co-reference Resolution";

const description = (
  <span>
    <p>
      Coreference resolution is the task of finding all expressions that refer to the same entity
      in a text. It is an important step for many higher level NLP tasks that involve natural
      language understanding such as document summarization, question answering, and information extraction.
    </p>
    <p>
      <a href = "https://www.semanticscholar.org/paper/End-to-end-Neural-Coreference-Resolution-Lee-He/3f2114893dc44eacac951f148fbff142ca200e83">End-to-end Neural Coreference Resolution (Lee et al, 2017)</a> is
      a neural model which considers all possible spans in the document as potential mentions and
      learns distributions over possible anteceedents for each span, using aggressive
      pruning strategies to retain computational efficiency. It achieved state-of-the-art accuracies on
      on <a href = "http://cemantix.org/data/ontonotes.html">the Ontonotes 5.0 dataset</a>
      in early 2017. The model here is based on that paper, but we have substituted the GloVe embeddings
      that it uses with <a href = "https://www.semanticscholar.org/paper/SpanBERT%3A-Improving-Pre-training-by-Representing-Joshi-Chen/81f5810fbbab9b7203b9556f4ce3c741875407bc" target="_blank" rel="noopener noreferrer">SpanBERT embeddings</a>
      . On Ontonotes this model achieves an F1 score of 78.87% on the test set.
    </p>
    <br/>
    <b>Contributed by:</b> <a href = "https://zhaofengwu.github.io" target="_blank" rel="noopener noreferrer">Zhaofeng Wu</a>
  </span>
);

const modelUrl = 'https://storage.googleapis.com/allennlp-public-models/coref-spanbert-large-2020.02.27.tar.gz'

const bashCommand =
    `echo '{"document": "The woman reading a newspaper sat on the bench with her dog."}' | \\
allennlp predict ${modelUrl} -`

const pythonCommand =
    `from allennlp.predictors.predictor import Predictor
import allennlp_models.coref
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  document="The woman reading a newspaper sat on the bench with her dog."
)`

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const defaultUsage = {
  installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
  bashCommand,
  pythonCommand,
  evaluationNote: (<span>
    The Coreference model was evaluated on the CoNLL 2012 dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    To compile the data in the right format for evaluating the Coreference model, please see scripts/compile_coref_data.sh.
    This script requires the Ontonotes 5.0 dataset, available on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
  </span>),
  trainingNote: (<span>
    The Coreference model was evaluated on the CoNLL 2012 dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    To compile the data in the right format for evaluating the Coreference model, please see scripts/compile_coref_data.sh.
    This script requires the Ontonotes 5.0 dataset, available on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
  </span>)
}

const fields = [
    {name: "document", label: "Document", type: "TEXT_AREA",
     placeholder: "We 're not going to skimp on quality , but we are very focused to make next year . The only problem is that some of the fabrics are wearing out - since I was a newbie I skimped on some of the fabric and the poor quality ones are developing holes . For some , an awareness of this exit strategy permeates the enterprise , allowing them to skimp on the niceties they would more or less have to extend toward a person they were likely to meet again ." }
]

const Output = (props) => {
  const {
    responseData,
    activeIds,
    activeDepths,
    isClicking,
    selectedId,
    onMouseDown,
    onMouseOut,
    onMouseOver,
    onMouseUp,
  } = props;
  const { document, clusters } = responseData
  return (
    <div className="model__content answer">
      <FormField>
        <NestedHighlight
          activeDepths={activeDepths}
          activeIds={activeIds}
          clusters={clusters}
          tokens={document}
          isClickable
          isClicking={isClicking}
          labelPosition="left"
          onMouseDown={onMouseDown}
          onMouseOut={onMouseOut}
          onMouseOver={onMouseOver}
          onMouseUp={onMouseUp}
          selectedId={selectedId}
        />
      </FormField>
    </div>
  );
}

const examples = [
    {
      document: "Paul Allen was born on January 21, 1953, in Seattle, Washington, to Kenneth Sam Allen and Edna Faye Allen. Allen attended Lakeside School, a private school in Seattle, where he befriended Bill Gates, two years younger, with whom he shared an enthusiasm for computers. Paul and Bill used a teletype terminal at their high school, Lakeside, to develop their programming skills on several time-sharing computer systems."
    },
    {
      document: "The legal pressures facing Michael Cohen are growing in a wide-ranging investigation of his personal business affairs and his work on behalf of his former client, President Trump. In addition to his work for Mr. Trump, he pursued his own business interests, including ventures in real estate, personal loans and investments in taxi medallions."
    },
    {
      document: "We are looking for a region of central Italy bordering the Adriatic Sea. The area is mostly mountainous and includes Mt. Corno, the highest peak of the mountain range. It also includes many sheep and an Italian entrepreneur has an idea about how to make a little money of them."
    }
  ]

const modelProps = {apiUrl, title, description, fields, examples, Output: withHighlightClickHandling(Output), defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
