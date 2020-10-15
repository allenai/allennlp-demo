import SemanticRoleLabeling from './components/demos/SemanticRoleLabeling';
import OpenIe from './components/demos/OpenIe';
import TextualEntailment from './components/demos/TextualEntailment';
import SentimentAnalysis from './components/demos/SentimentAnalysis';
import ReadingComprehension from './components/demos/ReadingComprehension';
import VisualQuestionAnswering from './components/demos/VisualQuestionAnswering';
import Coref from './components/demos/Coref';
import NamedEntityRecognition from './components/demos/NamedEntityRecognition';
import ConstituencyParser from './components/demos/ConstituencyParser';
import DependencyParser from './components/demos/DependencyParser';
import WikiTables from './components/demos/WikiTables';
import Nlvr from './components/demos/Nlvr';
import Atis from './components/demos/Atis';
import LanguageModel from './components/demos/LanguageModel';
import MaskedLm from './components/demos/MaskedLm';
import annotateIcon from './icons/annotate-14px.svg';
import otherIcon from './icons/other-14px.svg';
import parseIcon from './icons/parse-14px.svg';
import passageIcon from './icons/passage-14px.svg';
import questionIcon from './icons/question-14px.svg';
import addIcon from './icons/add-14px.svg';

// This is the order in which they will appear in the menu
const modelGroups = [
    {
        label: "Answer a question",
        iconSrc: questionIcon,
        defaultOpen: true,
        models: [
            {model: "reading-comprehension", name: "Reading Comprehension", component: ReadingComprehension},
            {model: "visual-question-answering", name: "Visual Question Answering", component: VisualQuestionAnswering}
        ]
    },
    {
        label: "Annotate a sentence",
        iconSrc: annotateIcon,
        defaultOpen: true,
        models: [
            {model: "named-entity-recognition", name: "Named Entity Recognition", component: NamedEntityRecognition},
            {model: "open-information-extraction", name: "Open Information Extraction", component: OpenIe},
            {model: "sentiment-analysis", name: "Sentiment Analysis", component: SentimentAnalysis},
            {model: "dependency-parsing", name: "Dependency Parsing", component: DependencyParser},
            {model: "constituency-parsing", name: "Constituency Parsing", component: ConstituencyParser},
            {model: "semantic-role-labeling", name: "Semantic Role Labeling", component: SemanticRoleLabeling},
        ]
    },
    {
        label: "Annotate a passage",
        iconSrc: passageIcon,
        defaultOpen: true,
        models: [
            {model: "coreference-resolution", name: "Coreference Resolution", component: Coref}
        ]
    },
    {
        label: "Semantic parsing",
        iconSrc: parseIcon,
        defaultOpen: true,
        models: [
            {model: "wikitables-parser", name: "WikiTableQuestions Semantic Parser", component: WikiTables},
            {model: "nlvr-parser", name: "Cornell NLVR Semantic Parser", component: Nlvr},
            {model: "atis-parser", name: "Text to SQL (ATIS)", component: Atis}
        ]
    },
    {
        label: "Other",
        iconSrc: otherIcon,
        defaultOpen: true,
        models: [
            {model: "textual-entailment", name: "Textual Entailment", component: TextualEntailment},
            {model: "next-token-lm", name: "Language Modeling", component: LanguageModel, redirects: ["gpt2"]},
            {model: "masked-lm", name: "Masked Language Modeling", component: MaskedLm}
        ]
    },
    {
        label: "Contributing",
        iconSrc: addIcon,
        defaultOpen: true,
        models: [
            {model: "user-models", name: "Your model here!"}
        ]
    }
]

// Create mapping from model to component
let modelComponents = {}
modelGroups.forEach((mg) => mg.models.forEach(({model, component}) => modelComponents[model] = component));

let modelRedirects = {}
modelGroups.forEach((mg) => mg.models.forEach(
  ({model, redirects}) => {
    if (redirects) {
      redirects.forEach((redirect) => modelRedirects[redirect] = model)
    }
  }
));

export { modelComponents, modelGroups, modelRedirects }
