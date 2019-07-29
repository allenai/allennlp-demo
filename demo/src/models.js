import SemanticRoleLabeling from './components/demos/SemanticRoleLabeling';
import OpenIe from './components/demos/OpenIe';
import Event2Mind from './components/demos/Event2Mind';
import TextualEntailment from './components/demos/TextualEntailment';
import SentimentAnalysis from './components/demos/SentimentAnalysis';
import ReadingComprehension from './components/demos/ReadingComprehension';
import Coref from './components/demos/Coref';
import NamedEntityRecognition from './components/demos/NamedEntityRecognition';
import ConstituencyParser from './components/demos/ConstituencyParser';
import DependencyParser from './components/demos/DependencyParser';
import WikiTables from './components/demos/WikiTables';
import Nlvr from './components/demos/Nlvr';
import Atis from './components/demos/Atis';
import QuarelZero from './components/demos/QuarelZero';
import LanguageModel from './components/demos/LanguageModel';
import MaskedLm from './components/demos/MaskedLm';
import annotateIcon from './icons/annotate-14px.svg';
import otherIcon from './icons/other-14px.svg';
import parseIcon from './icons/parse-14px.svg';
import passageIcon from './icons/passage-14px.svg';
import questionIcon from './icons/question-14px.svg';

// This is the order in which they will appear in the menu
const modelGroups = [
    {
        label: "Annotate a sentence",
        icon: "highlight",
        iconSrc: annotateIcon,
        defaultOpen: true,
        models: [
            {model: "sentiment-analysis", name: "Sentiment Analysis", component: SentimentAnalysis}
        ]
    },
    {
        label: "Annotate a passage",
        icon: "pic-right",
        iconSrc: passageIcon,
        defaultOpen: true,
        models: [
            {model: "coreference-resolution", name: "Coreference Resolution", component: Coref}
        ]
    },
    {
        label: "Semantic parsing",
        icon: "apartment",
        iconSrc: parseIcon,
        defaultOpen: true,
        models: [
            {model: "nlvr-parser", name: "Cornell NLVR Semantic Parser", component: Nlvr},
            {model: "atis-parser", name: "Text to SQL (ATIS)", component: Atis},
            {model: "quarel-parser-zero", name: "QuaRel Zero", component: QuarelZero}
        ]
    },
    {
        label: "Other",
        icon: "experiment",
        iconSrc: otherIcon,
        defaultOpen: true,
        models: [
            {model: "next-token-lm", name: "Language Modeling", component: LanguageModel},
            {model: "masked-lm", name: "Masked Language Modeling", component: MaskedLm},
            {model: "user-models", name: "Your model here!"}
        ]
    }
]

// Create mapping model => component
let modelComponents = {}
modelGroups.forEach((mg) => mg.models.forEach(({model, component}) => modelComponents[model] = component));

export { modelComponents, modelGroups }
