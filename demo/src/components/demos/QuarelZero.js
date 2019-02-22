import React from 'react';
import HeatMap from '../HeatMap'
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
  } from 'react-accessible-accordion';
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import OutputField from '../OutputField'
import { API_ROOT } from '../../api-config';

const title = "Qualitative Relations Story Question Answering"

const description = (
  <span>
    Answer story questions about qualitative relations
    (<a href = "http://data.allenai.org/quarel/" target="_blank" rel="noopener noreferrer">QuaRel dataset</a>)
    while adding new relations
    without retraining. This uses the QuaSP+Zero semantic parser described in
    {' '}
    <i>QuaRel: A Dataset and Models for
    Answering Questions about Qualitative Relationships</i>{' '}
    (<a href = "https://arxiv.org/abs/1811.08048" target="_blank" rel="noopener noreferrer">AAAI 2019</a>).
    The first few examples use
    new relations, the rest are from the validation set.
  </span>
)

const descriptionEllipsed = (
  <span>
    Answer story questions about qualitative relations
    (<a href = "http://data.allenai.org/quarel/" target="_blank" rel="noopener noreferrer">QuaRel dataset</a>)
    while adding new relations without…
  </span>
)

const fields = [
  {name: "question", label: "Question", type: "TEXT_AREA",
   placeholder: `E.g. "A hockey puck slides a lot longer on a frozen lake then on a slushy lake. This means the surface of the _____ is smoother (A) frozen lake (B) slushy lake"`},
   {name: "qrspec", label: "Qualitative Relations", type: "TEXT_AREA", optional: true,
   placeholder: `[friction, -speed, +heat]\n[weight, acceleration]`},
   {name: "entitycues", label: "Attribute Cues", type: "TEXT_AREA", optional: true,
   placeholder: `friction: resistance\nspeed: velocity, fast, slow`}
]

const ActionInfo = ({ action, question_tokens }) => {
  const question_attention = action['question_attention'].map(x => [x])
  const considered_actions = action['considered_actions']
  const action_probs = action['action_probabilities'].map(x => [x])

  const probability_heatmap = (
    <div className="heatmap, heatmap-tile">
      <HeatMap colLabels={['Prob']} rowLabels={considered_actions} data={action_probs} xLabelWidth={250} />
    </div>
  )

  const question_attention_heatmap = question_attention.length > 0 ? (
    <div className="heatmap, heatmap-tile">
      <HeatMap colLabels={['Prob']} rowLabels={question_tokens} data={question_attention} xLabelWidth={70} />
    </div>
    ) : null

    return (
    <div className="flex-container">
      {probability_heatmap}
      {question_attention_heatmap}
    </div>
    )
}

const Explanation = ({entry}) => {
  const listItems = entry.content.map((c, index) => (<li key={`content_${index}`} className="model__explanation__ul">{c}</li>))

  return (
    <div>
      <div className="model__explanation__header">
        {entry.header}:
      </div>
      <ul className="model__explanation__ul">
        {listItems}
      </ul>
    </div>
  )
}

const Output = ({ responseData }) => {
  const { answer, logical_form, score, predicted_actions, question_tokens, world_extractions, explanation } = responseData

  const explanations = explanation.map((entry, index) => <Explanation key={`entry_${index}`} entry={entry}/>)

  return (
    <div className="model__content answer">
      <OutputField label="Answer">
        {answer}
      </OutputField>

      <OutputField label="Explanation">
        {explanations}
      </OutputField>

      <OutputField label="Model internals">
        <Accordion accordion={false}>
          <OutputField label="Logical Form">
            {logical_form}
          </OutputField>
          <OutputField label="Score">
            {score}
          </OutputField>
          <OutputField label="Extracted world entities">
            world1: {world_extractions.world1} world2: {world_extractions.world2}
          </OutputField>
          <Accordion accordion={false}>
            <AccordionItem expanded={true}>
              <AccordionItemTitle>
                Predicted actions
                <div className="accordion__arrow" role="presentation"/>
              </AccordionItemTitle>
              <AccordionItemBody>
                {predicted_actions.map((action, action_index) => (
                  <Accordion accordion={false} key={"action_" + action_index}>
                    <AccordionItem>
                      <AccordionItemTitle>
                        {action['predicted_action']}
                        <div className="accordion__arrow" role="presentation"/>
                      </AccordionItemTitle>
                      <AccordionItemBody>
                        <ActionInfo action={action} question_tokens={question_tokens}/>
                      </AccordionItemBody>
                    </AccordionItem>
                  </Accordion>
                ))}
              </AccordionItemBody>
            </AccordionItem>
          </Accordion>
        </Accordion>
      </OutputField>
    </div>
  )
}


const qrspecDefault = "[friction, -speed, -smoothness, -distance, +heat]\n[speed, -time]\n[speed, +distance]\n[time, +distance]\n[weight, -acceleration]\n[strength, +distance]\n[strength, +thickness]\n[mass, +gravity]\n[flexibility, -breakability]\n[distance, -loudness, -brightness, -apparentSize]\n[exerciseIntensity, +amountSweat]"

const entitycuesDefault = "friction: resistance, traction\nspeed: velocity, pace, fast, slow, faster, slower, slowly, quickly, rapidly\ndistance: length, way, far, near, further, longer, shorter, long, short, farther, furthest\nheat: temperature, warmth, smoke, hot, hotter, cold, colder\nsmoothness: slickness, roughness, rough, smooth, rougher, smoother, bumpy, slicker\nacceleration: \namountSweat: sweat, sweaty\napparentSize: size, large, small, larger, smaller\nbreakability: brittleness, brittle, break, solid\nbrightness: bright, shiny, faint\nexerciseIntensity: excercise, run, walk\nflexibility: flexible, stiff, rigid\ngravity: \nloudness: loud, faint, louder, fainter\nmass: weight, heavy, light, heavier, lighter, massive\nstrength: power, strong, weak, stronger, weaker\nthickness: thick, thin, thicker, thinner, skinny\ntime: long, short\nweight: mass, heavy, light, heavier, lighter"

const appendDefault = (example, fieldName, defaults) => {
  if (example[fieldName] && example[fieldName].slice(-1) === '*') {
    // Ends with *, so don't append anything and get rid of the '*'
    example[fieldName] = example[fieldName].slice(0, -1)
  } else if (example[fieldName]) {
    example[fieldName] += "\n" + defaults
  } else {
    example[fieldName] = defaults
  }
}


const examples = [
  {
    question: "Bill eats way more sweets than Sue. Based on this, who has more diabetes risk? (A) Sue (B) Bill",
    qrspec: "[sugar, +diabetes]",
    entitycues: "sugar: sweets"
  },
  {
    question: "In his research, Joe is finding there is a lot more diabetes in the city than out in the countryside. He hypothesizes this is because people in _____ consume less sugar. (A) city (B) countryside",
    qrspec: "[sugar, +diabetes]"
  },
  {
    question: "There are way fewer trucks driving through Bob's city than Sue's city. Where would one expect air quality to be higher? (A) Bob's city (B) Sue's city",
    qrspec: "[pollution, +vehicles, -air quality]",
    entitycues: "vehicles: cars, trucks"
  },
  {
    question: "There are way fewer trucks driving through Bob's city than Sue's city. Where would one expect air quality to be higher? (A) Bob's city (B) Sue's city",
    qrspec: "[pollution, +vehicles, -air quality]*",
    entitycues: "vehicles: cars, trucks*"
  },
  {
    question: "Mary has always been weaker then Jimbo. Which person is able to throw a ball farther? (A) Jimbo (B) Mary"
  },
  {
    question: "An empty pot generates less heat when Mary slides it the wood counter than it does when she slides it across a dish towel. This is because the _____ has less resistance. (A) towel (B) wood counter"
  },
  {
    question: "A hockey puck slides a lot longer on a frozen lake then on a slushy lake. This means the surface of the _____ is smoother (A) frozen lake (B) slushy lake"
  },
  {
    question: "The sun has much more mass than the earth so it has (A) weaker gravity (B) stronger gravity"
  },
  {
    question: "Annabel and Lydia are riding their tricycles. Lydia is not as fast as Annabel is. Which one goes a shorter distance? (A) Annabel (B) Lydia"
  },
  {
    question: "The fastest land animal on earth, a cheetah was having a 100m race against a rabbit. Which one one the race? (A) the cheetah (B) the rabbit"
  },
  {
    question: "Jim was playing with his new ball. He rolled it on the carpet in his living room and it didn't go very far. He decided to go outside and play. Jim rolled his ball on the concrete driveway and it went a much longer distance. He realized there was more resistance to the ball on (A) the carpet (B) the concrete."
  },
  {
    question: "If Mona is doing pushups and Milo is reading a book, which person is sweating less? (A) Mona (B) Milo"
  },
  {
    question: "James has rigorous fencing lessons in the morning, and in the evening goes to see a film at the cinema with his girlfriend. Where is he less likely to be sweaty? (A) While fencing (B) While watching a movie"
  },
  {
    question: "Jose pushed his burrito cart on the bumpy sidewalk and went slow, while much faster on the street because it had (A) more resistance (B) less resistance"
  }
]

// Add defaults
examples.forEach(example => {
  appendDefault(example, 'qrspec', qrspecDefault)
  appendDefault(example, 'entitycues', entitycuesDefault)
})

const apiUrl = () => `${API_ROOT}/predict/quarel-parser-zero`

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)

