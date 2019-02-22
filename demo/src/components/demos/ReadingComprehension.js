import React from 'react';
import HeatMap from '../HeatMap'
import { withRouter } from 'react-router-dom';
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
} from 'react-accessible-accordion';
import Model from '../Model'
import OutputField from '../OutputField'
import { API_ROOT } from '../../api-config';
import { truncate } from '../DemoInput'

const title = "Reading Comprehension"

const description = (
  <span>
    Reading comprehension is the task of answering questions about a passage of text to show that
    the system understands the passage.
  </span>
  )

const descriptionEllipsed = (
  <span>
    Reading comprehension is the task of answering questions about a passage of text to show that
    the system…
  </span>
)

const taskModels = [
  {
    value: "BiDAF",
    desc: "Reimplementation of BiDAF (Seo et al, 2017), or Bi-Directional Attention Flow,<br/>\
    a widely used MC baseline that achieved state-of-the-art accuracies on<br/>\
    the SQuAD dataset (Wikipedia sentences) in early 2017."
  },
  {
    value: "Augmented QANet",
    desc: "Combining Local Convolution with Global Self-Attention for Reading Comprehension"
  }
]

const taskEndpoints = {
  "BiDAF": "machine-comprehension", // TODO: we should rename tha back-end model to reading-comprehension
  "Augmented QANet": "augmented-qanet-reading-comprehension"
};

const fields = [
  {name: "passage", label: "Passage", type: "TEXT_AREA",
   placeholder: `E.g. "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth. Although it has only one-eighth the average density of Earth, with its larger volume Saturn is just over 95 times more massive. Saturn is named after the Roman god of agriculture; its astronomical symbol represents the god's sickle"`},
  {name: "question", label: "Question", type: "TEXT_INPUT",
   placeholder: `E.g. "What does Saturn’s astronomical symbol represent"`}
  // {name: "model", label: "Model", type: "RADIO", options: taskModels, optional: true} // TODO: add when matts model is ready
]

const Attention = ({passage_question_attention, question_tokens, passage_tokens}) => {
  if(passage_question_attention && question_tokens && passage_tokens) {
    return (
        <OutputField label="Model internals">
          <Accordion accordion={false}>
            <AccordionItem expanded={true}>
              <AccordionItemTitle>
                Passage to Question attention
                <div className="accordion__arrow" role="presentation"/>
              </AccordionItemTitle>
              <AccordionItemBody>
                <p>
                  For every passage word, the model computes an attention over the question words.
                  This heatmap shows that attention, which is normalized for every row in the matrix.
                </p>
                <HeatMap
                  colLabels={question_tokens} rowLabels={passage_tokens}
                  data={passage_question_attention} />
              </AccordionItemBody>
            </AccordionItem>
          </Accordion>
        </OutputField>
    )
  }
  return null;
}

const NoAnswer = () => {
  return (
    <OutputField label="Answer">
      No answer returned.
    </OutputField>
  )
}

const MultiSpanHighlight = ({original, highlightSpans, highlightStyles}) => {
  if(original && highlightSpans && highlightStyles) {
    // assumes spans are not overlapping and in order
    let curIndex = 0;
    let spanList = [];
    highlightSpans.forEach((s, sIndex) => {
      if(s[0] > curIndex){
        // add preceding non-highlighted span
        spanList.push(<span key={`${curIndex}_${s[0]}`}>{original.slice(curIndex, s[0])}</span>);
        curIndex = s[0];
      }
      // add highlighted span
      if(s[1] > curIndex) {
        spanList.push(<span key={`${curIndex}_${s[1]}`} className={highlightStyles[sIndex]}>{original.slice(curIndex, s[1])}</span>);
        curIndex = s[1];
      }
    });
    // add last non-highlighted span
    if(curIndex < original.length) {
      spanList.push(<span key={`${curIndex}_${original.length}`}>{original.slice(curIndex)}</span>);
    }
    return (
      <span>
        {spanList.map(s=> s)}
      </span>
    )
  }
  return null;
}

const ArithmeticEquation = ({numbers}) => {
  if(numbers) {
    let ret = numbers
      .filter(n => n.sign !== 0)
      .map(n => `${n.sign > 0 ? "+" : "-"} ${n.value}`)
      .join(" ");
    while(ret.charAt(0) === "+" || ret.charAt(0) === " ") {
      ret = ret.substr(1);
    }
    return <span>{ret}</span>;
  }
  return null;
}

const AnswerByType = ({requestData, responseData}) => {
  if(requestData && responseData) {
    const { passage, question } = requestData;
    const { answer } = responseData;
    const { answer_type } = answer || {};

    switch(answer_type) {
      case "passage_span": {
        const { spans, value } = answer || {};
        if(question && passage && spans && value) {
          return (
            <section>
              <OutputField label="Answer">
                {value}
              </OutputField>

              <OutputField label="Explanation">
                The model decided the answer was in the passage.
              </OutputField>

              <OutputField label="Passage">
                <MultiSpanHighlight
                  original={passage}
                  highlightSpans={spans}
                  highlightStyles={spans.map(s => "highlight__answer")}/>
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      case "question_span": {
        const { spans, value } = answer || {};
        if(question && passage && spans && value) {
          return (
            <section>
              <OutputField label="Answer">
                {value}
              </OutputField>

              <OutputField label="Explanation">
                The model decided the answer was in the question.
              </OutputField>

              <OutputField label="Passage">
                {passage}
              </OutputField>

              <OutputField label="Question">
                <MultiSpanHighlight
                  original={question}
                  highlightSpans={spans}
                  highlightStyles={spans.map(s => "highlight__answer")}/>
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      case "count": {
        const { count } = answer || {};
        if(question && passage && count) {
          return (
            <section>
              <OutputField label="Answer">
                {count}
              </OutputField>

              <OutputField label="Explanation">
                The model decided this was a counting problem.
              </OutputField>

              <OutputField label="Passage">
                {passage}
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      case "arithmetic": {
        const { numbers, value } = answer || {};
        if(question && passage && numbers && value) {
          return (
            <section>
              <OutputField label="Answer">
                {value}
              </OutputField>

              <OutputField label="Explanation">
                The model used the arithmetic expression <ArithmeticEquation numbers={numbers} /> = {value}.
              </OutputField>

              <OutputField label="Passage">
                <MultiSpanHighlight
                  original={passage}
                  highlightSpans={numbers.map(n => n.span)}
                  highlightStyles={numbers.map(n => `highlight__num_${n.sign}`)}/>
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      default: { // old best_span_str path (TODO: delete after api update)
        const { best_span_str } = responseData;
        if(question && passage && best_span_str) {
          const start = passage.indexOf(best_span_str);
          const head = passage.slice(0, start);
          const tail = passage.slice(start + best_span_str.length);
          return (
            <section>
              <OutputField label="Answer">
                {best_span_str}
              </OutputField>

              <OutputField label="Passage Context">
                <span>{head}</span>
                <span className="highlight__answer">{best_span_str}</span>
                <span>{tail}</span>
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }
    }
  }
  return NoAnswer();
}

const Output = (props) => {
  return (
    <div className="model__content answer">
      <AnswerByType {...props}/>
    </div>
  )
}

const examples = [
  {
    passage: "A reusable launch system (RLS, or reusable launch vehicle, RLV) is a launch system which is capable of launching a payload into space more than once. This contrasts with expendable launch systems, where each launch vehicle is launched once and then discarded. No completely reusable orbital launch system has ever been created. Two partially reusable launch systems were developed, the Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: the orbiter (which included the Space Shuttle main engines and the Orbital Maneuvering System engines), and the two solid rocket boosters were reused after several months of refitting work for each launch. The external tank was discarded after each flight.",
    question: "How many partially reusable launch systems were developed?",
  },
  {
    passage: "Robotics is an interdisciplinary branch of engineering and science that includes mechanical engineering, electrical engineering, computer science, and others. Robotics deals with the design, construction, operation, and use of robots, as well as computer systems for their control, sensory feedback, and information processing. These technologies are used to develop machines that can substitute for humans. Robots can be used in any situation and for any purpose, but today many are used in dangerous environments (including bomb detection and de-activation), manufacturing processes, or where humans cannot survive. Robots can take on any form but some are made to resemble humans in appearance. This is said to help in the acceptance of a robot in certain replicative behaviors usually performed by people. Such robots attempt to replicate walking, lifting, speech, cognition, and basically anything a human can do.",
    question: "What do robots that resemble humans attempt to do?",
  },
  {
    passage: "The Matrix is a 1999 science fiction action film written and directed by The Wachowskis, starring Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving, and Joe Pantoliano. It depicts a dystopian future in which reality as perceived by most humans is actually a simulated reality called \"the Matrix\", created by sentient machines to subdue the human population, while their bodies' heat and electrical activity are used as an energy source. Computer programmer \"Neo\" learns this truth and is drawn into a rebellion against the machines, which involves other people who have been freed from the \"dream world.\"",
    question: "Who stars in The Matrix?",
  },
  {
    passage: "Kerbal Space Program (KSP) is a space flight simulation video game developed and published by Squad for Microsoft Windows, OS X, Linux, PlayStation 4, Xbox One, with a Wii U version that was supposed to be released at a later date. The developers have stated that the gaming landscape has changed since that announcement and more details will be released soon. In the game, players direct a nascent space program, staffed and crewed by humanoid aliens known as \"Kerbals\". The game features a realistic orbital physics engine, allowing for various real-life orbital maneuvers such as Hohmann transfer orbits and bi-elliptic transfer orbits.",
    question: "What does the physics engine allow for?",
  }
].map(ex => ({...ex, snippet: truncate(ex.passage)}));

const apiUrl = ({model}) => {
  const selectedModel = model || taskModels[0]
  const endpoint = taskEndpoints[selectedModel.value]
  return `${API_ROOT}/predict/${endpoint}`
}

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
