import React from 'react';
import { withRouter } from 'react-router-dom';
import { ExternalLink } from '@allenai/varnish/components';

import { FormField } from '../Form';
import { API_ROOT } from '../../api-config';
import Model from '../Model'
import { UsageSection } from '../UsageSection';
import { UsageHeader } from '../UsageHeader';
import { UsageCode } from '../UsageCode';
import SyntaxHighlight from '../highlight/SyntaxHighlight';
import NestedHighlight, { withHighlightClickHandling } from '../highlight/NestedHighlight';

const apiUrl = () => `${API_ROOT}/predict/coreference-resolution`

const title = "Co-reference Resolution";

const description = (
  <span>
    <span>
    Coreference resolution is the task of finding all expressions that refer to the same entity
    in a text. It is an important step for a lot of higher level NLP tasks that involve natural
    language understanding such as document summarization, question answering, and information extraction.
    </span>
    <ExternalLink href = "https://www.semanticscholar.org/paper/End-to-end-Neural-Coreference-Resolution-Lee-He/3f2114893dc44eacac951f148fbff142ca200e83" target="_blank" rel="noopener">{' '} End-to-end Neural Coreference Resolution ( Lee et al, 2017) {' '}</ExternalLink>
    <span>
    is a neural model which considers all possible spans in the document as potential mentions and
    learns distributions over possible anteceedents for each span, using aggressive, learnt
    pruning strategies to retain computational efficiency. It achieved state-of-the-art accuracies on
    </span>
    <ExternalLink href = "http://cemantix.org/data/ontonotes.html" target="_blank" rel="noopener">{' '} the Ontonotes 5.0 dataset {' '}</ExternalLink>
    <span>
    in early 2017. The model here is based on that paper, but we have substituted the GloVe embeddings
    that it uses with BERT embeddings. On Ontonotes that gives an F1 score of 72.13 on test.
    </span>
    <p>
      <b>Contributed by:</b> Zhaofeng Wu
    </p>
  </span>
);

const descriptionEllipsed = (
  <span>
    Coreference resolution is the task of finding all expressions that refer to the same entity in a text. It is an…
  </span>
)

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

const usage = (
  <React.Fragment>
    <UsageSection>
      <UsageHeader>Prediction</UsageHeader>
      <strong>On the command line (bash):</strong>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"document": "The woman reading a newspaper sat on the bench with her dog."}' | \\
  allennlp predict https://s3-us-west-2.amazonaws.com/allennlp/models/coref-model-2018.02.05.tar.gz -`} />
        </SyntaxHighlight>
      </UsageCode>
      <strong>As a library (Python):</strong>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/coref-model-2018.02.05.tar.gz")
predictor.predict(
  document="The woman reading a newspaper sat on the bench with her dog."
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Evaluation</UsageHeader>
      <p>
        The Coreference model was evaluated on the CoNLL 2012 dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        To compile the data in the right format for evaluating the Coreference model, please see scripts/compile_coref_data.sh.
        This script requires the Ontonotes 5.0 dataset, available on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
      </p>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Training</UsageHeader>
      <p>
        The Coreference model was evaluated on the CoNLL 2012 dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        To compile the data in the right format for evaluating the Coreference model, please see scripts/compile_coref_data.sh.
        This script requires the Ontonotes 5.0 dataset, available on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
      </p>
    </UsageSection>
  </React.Fragment>
)

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output: withHighlightClickHandling(Output), usage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
