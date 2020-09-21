import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Table } from '@allenai/varnish';
import { BasicFilterDropdown, FilterIcon } from '@allenai/varnish/es/table';

import Model from '../Model'
import OutputField from '../OutputField'

import baseballSrc from './exampleImages/baseball_game.jpg';
import busStopSrc from './exampleImages/bus_stop.jpg';
import kitchenSrc from './exampleImages/kitchen.jpg';
import livingRoomSrc from './exampleImages/living_room.jpg';

const title = "Visual Question Answering";

// TODO(dirkg): please update the description
const description = (
  <span>
    Visual Question Answering (VQA) is the task of generating a answer in response to a natural
    language question about the contents of an image. VQA models are typically trained and
    evaluated on datasets such as VQA2.0, GQA, Visual7W and VizWiz.
   <br/>
   <br/>
    This page demonstrates ViLBERT for VQA. ViLBERT (short for Vision-and-Language BERT), is a
    model for learning task-agnostic joint representations of image content and natural language.
  </span>
);

// TODO(dirkg): is this the correct url?
const modelUrl = 'https://storage.googleapis.com/allennlp-public-models/openie-model.2020.03.26.tar.gz'

// TODO(dirkg): is this the correct command?
const bashCommand =
    `echo '{"question": "What game are they playing?", image: { image_base64: "..." } }' | \\
allennlp predict ${modelUrl} -`
// TODO(dirkg): is this the correct command?
const pythonCommand =
    `from allennlp.predictors.predictor import Predictor
import allennlp_models.structured_prediction
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  question="What game are they playing?",
  image: {
    image_base64: "..."
  }
)`

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const defaultUsage = {
  installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
  bashCommand,
  pythonCommand,
  // TODO(dirkg): please update the notes
  evaluationNote: (<span>
    <mark>[TODO(dirkg): please update the notes]</mark>.
  </span>),
  // TODO(dirkg): please update the notes
  trainingNote: (<span>
    <mark>[TODO(dirkg): please update the notes]]</mark>.
  </span>)
}

const fields = [
    {name: "image", label: "Image", type: "IMAGE_UPLOAD"},
    {name: "question", label: "Question", type: "TEXT_INPUT",
     placeholder: `E.g. "What game are they playing?"`}
]

const answerPageSize = 6;

const answerColumns = [
    {
      title: 'Score',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (val) => (
        <div title={val.toString()}>
          <SparkEnvelope>
            <Spark value={val} />
          </SparkEnvelope>{' '}
          <SparkValue>{`${(val).toFixed(1)}%`}</SparkValue>
        </div>
      ),
      sorter: (a, b) => a.confidence - b.confidence,
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend'
    },
  {
      title: 'Answer',
      dataIndex: 'answer',
      key: 'answer',
      sorter: (a, b) => (a.answer < b.answer ? -1 : 1),
      sortDirections: ['descend', 'ascend'],
      filterDropdown: BasicFilterDropdown,
      filterIcon: FilterIcon,
      onFilter: (filter, record) => record.answer.toLowerCase().includes(filter.toString().toLowerCase())
    }
]

// put in a shared place if we use these styles elsewhere
// ie, if we add more tables of scored values
const SparkEnvelope = styled.div`
  width: ${({ theme }) => theme.spacing.xl2};
  height: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.palette.background.info};
  margin: ${({ theme }) => `${theme.spacing.xxs} 0`};
  display: inline-block;
`

const Spark = styled.div`
  background: ${({ theme }) => theme.palette.primary.light};
  width: ${({ value }) => `${Math.max(0, value)}%`};
  height: 100%;
`

const SparkValue = styled.div`
  display: inline-block;
  vertical-align: top;
`

const StyledTable = styled(Table)`
  table {
    min-width: 98% !important; // boo! there seems to be an error in the width of the inner table
  }
`

const Output = ({ responseData }) => {
    return (
      <div className="model__content answer">
        {responseData ? (
          <>
            <OutputField label="Predicted Answers" />
            <StyledTable
              size="small"
              scroll={{ x: true }}
              rowKey={(record) => `${record.answer}_${record.confidence}`}
              columns={answerColumns}
              dataSource={responseData}
              pagination={
                responseData.length > answerPageSize && {
                  pageSize: answerPageSize,
                  simple: true
                }
              }
            />
          </>
        ) : null}
      </div>
    );
}

const examples = [
    {
      snippet: 'Baseball Game: "What game are they playing?"',
      image: {imgSrc:baseballSrc, imageName:'baseball_game.jpg'},
      question: "What game are they playing?",
    },
    {
      snippet: 'Bus Stop: "What are the people waiting for?"',
      image: {imgSrc:busStopSrc, imageName:'bus_stop.jpg'},
      question: "What are the people waiting for?",
    },
    {
      snippet: 'Kitchen: "What is in the bowls on the island?"',
      image: {imgSrc:kitchenSrc, imageName:'kitchen.jpg'},
      question: "What is in the bowls on the island?",
    },
    {
      snippet: 'Living Room: "What color is the pillow in the middle?"',
      image: {imgSrc:livingRoomSrc, imageName:'living_room.jpg'},
      question: "What color is the pillow in the middle?",
    }
];

const apiUrl = () => '/api/vilbert_vqa/predict'

const modelProps = {
  apiUrl,
  title,
  description,
  fields,
  examples,
  Output,
  defaultUsage,
  exampleLabel: "Enter Image & Question or"
}

export default withRouter(props => <Model {...props} {...modelProps}/>)
