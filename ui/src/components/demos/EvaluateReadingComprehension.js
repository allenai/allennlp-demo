import React from 'react';
import { withRouter } from 'react-router-dom';

import Model from '../Model'

const apiUrl = () => `/api/lerc/predict`
const modelUrl = 'https://storage.googleapis.com/allennlp-public-models/coref-spanbert-large-2020.02.27.tar.gz'
const title = "Evaluate Reading Comprehension"
const defaultUsage = undefined;
const description = (
  <span>
      <p> Evaluating reading comprehension is the task of determining how correct a candidate answer is with respect to a passage, question, and reference answer. </p>
      <p> The evaluation metric we highlight is LERC, a learned metric trained on <a href = "https://arxiv.org/abs/2010.03636" target="_blank">MOCHA</a>.</p>
      <br/><b>Contributed by:</b> <a href = "https://anthonywchen.github.io/" target="_blank">Anthony Chen</a>
  </span>
)

const fields = [
  {name: "context", label: "Context", type: "TEXT_AREA",
   placeholder: `E.g. "The story begins in 1647 when King Charles I has been defeated in the civil war and has fled from London towards the New Forest. Parliamentary soldiers have been sent to search the forest and decide to burn Arnwood, the house of Colonel Beverley, a Cavalier officer killed at the Battle of Naseby. The four orphan children of the house, Edward, Humphrey, Alice and Edith, are believed to have died in the flames. However, they are saved by Jacob Armitage, a local verderer, who hides them in his isolated cottage and disguises them as his grandchildren. Under Armitage's guidance, the children adapt from an aristocratic lifestyle to that of simple foresters. After Armitage's death, Edward takes charge and the children develop and expand the farmstead, aided by the entrepreneurial spirit of the younger brother Humphrey. They are assisted by a gypsy boy, Pablo, who they rescue from a pitfall trap."`},
  {name: "question", label: "Question", type: "TEXT_INPUT",
   placeholder: `E.g. "Who do the children rescue from a trap?"`},
  {name: "reference", label: "Reference", type: "TEXT_INPUT",
   placeholder: `E.g. "Pablo."`},
  {name: "candidate", label: "Candidate", type: "TEXT_INPUT",
   placeholder: `E.g. "A gypsy kid."`}
]

const Output = (props) => {
  switch (props.requestData.model) {
    case NMNModel.name:
    case NMNModel.modelId:
      return (
        <div className="model__content answer">
          <nmn.Output response={props.responseData} />
        </div>
      );
    default:
      return (
        <div className="model__content answer">
          <AnswerByType {...props} />
        </div>
      )
  }
}

const examples = [
    {
        context: "The short story takes place in a land ruled by a semi-barbaric king. Some of the king's ideas are progressive, but others cause people to suffer. One of the king's innovations is the use of a public trial by ordeal as an agent of poetic justice, with guilt or innocence decided by the result of chance. A person accused of a crime is brought into a public arena and must choose one of two doors. Behind one door is a lady whom the king has deemed an appropriate match for the accused; behind the other is a fierce, hungry tiger. Both doors are heavily soundproofed to prevent the accused from hearing what is behind each one. If he chooses the door with the lady behind it, he is innocent and must immediately marry her, but if he chooses the door with the tiger behind it, he is deemed guilty and is immediately devoured by it. The king learns that his daughter has a lover, a handsome and brave youth who is of lower status than the princess, and has him imprisoned to await trial.",
        question: "What feature do the doors have?",
        reference: "Soundproofing",
        candidate: "They are heavily soundproofed to prevent the accused from hearing what's behind each one.",

    },
    {
        context: "This past summer, my family went on vacation to San Diego. One of the reasons that we like going to this city so much, apart from all the things there is to do, is going to the beach. We would always make sure to pack some beachwear or swimwear with all of our normal clothes because of this. We would all go to the beach dressed in our beachwear, so that we wouldn't have to worry about finding a bathroom to change in. There was so much fun things to do there when we recently went. One of the things that me and my younger brother did was buy some molds from a nearby shop to make sand castles with. Another thing that I did was sunbathe, with a beach towel to lay down on while I felt the sun on my skin. My brother and my mom actually went into the water, something that I've always been nervous about doing. After we'd had enough, we dried ourselves off with the towels, hopped back in the car, and went back to our hotel room.",
        question: "How did they arrive?",
        reference: "they got to the beach by car",
        candidate: "By car",

    },
    {
        context: "The plot revolves around Hypatia the pagan philosopher; Cyril the Christian patriarch; Orestes the power-hungry prefect of Egypt; and Philammon an Egyptian monk. Philammon travels from his monastic community in the desert to Alexandria, and expresses a desire to attend Hypatia's lectures despite Cyril's dislike of Hypatia. Philammon also encounters Pelagia, his long-lost sister, a former singer and dancer who is now married to a Gothic warrior. Philammon naturally desires to convert both women to Christianity. A subplot involves Raphael Aben-Ezra, a wealthy Jewish associate of Hypatia who falls in love with a Christian girl called Victoria and converts to win her love.",
        question: "What does Raphael do to win Victoria's love?",
        reference: "He converts to Christianity.",
        candidate: "Becomes the man who converts Hypatia to a Christian faith",
    },
    {
        context: "The story begins in 1647 when King Charles I has been defeated in the civil war and has fled from London towards the New Forest. Parliamentary soldiers have been sent to search the forest and decide to burn Arnwood, the house of Colonel Beverley, a Cavalier officer killed at the Battle of Naseby. The four orphan children of the house, Edward, Humphrey, Alice and Edith, are believed to have died in the flames. However, they are saved by Jacob Armitage, a local verderer, who hides them in his isolated cottage and disguises them as his grandchildren. Under Armitage's guidance, the children adapt from an aristocratic lifestyle to that of simple foresters. After Armitage's death, Edward takes charge and the children develop and expand the farmstead, aided by the entrepreneurial spirit of the younger brother Humphrey. They are assisted by a gypsy boy, Pablo, who they rescue from a pitfall trap.",
        question: "Who do the children rescue from a trap?",
        reference: "Pablo.",
        candidate: "A gypsy kid",

    },
    {
        context: "The plot concerns the children of the Duke of Omnium, Plantagenet Palliser, and his late wife, Lady Glencora. When Lady Glencora dies unexpectedly, the Duke is left to deal with his grownup children, with whom he has a somewhat distant relationship. As the government in which he is Prime Minister has also fallen, the Duke is left bereft of both his beloved wife and his political position. Before her death, Lady Glencora had imprudently given her secret blessing to her daughter Mary's courtship by a poor gentleman, Frank Tregear, a friend of Lord Silverbridge, the Duke's older son and heir. ",
        question: "What has happened to the government that the Duke is a part of?",
        reference: "It has collapsed",
        candidate: "government has been falling",

    },
    {
        context: "The other day I vowed to spend ten minutes a day doing something for the election to support Obama. So , I called my grandfather, because eight months ago he said he was going to vote for McCain. I wanted to have a conversation with him about it, and just hear him, and let him know how I felt. I was really surprised, because one of the first things he said to me was; \" You, your husband, and your new baby are going to have a good life, because change is coming. \" I asked him what he meant , and he said , \" Obama is going to win by a landslide , people want change.",
        question: "What may be your reason for taking 10 minutes out of your day for something?",
        reference: "I wanted to influence political opinions.",
        candidate: "I want to support him in the election.",

    },
    {
        context: "Sasha beat the test easily because she studied so hard.",
        question: "What will happen to others?",
        reference: "they will be jealous",
        candidate: "they will appreciate Sasha",

    },
]

const modelProps = {apiUrl, title, description, fields, examples, Output, defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
