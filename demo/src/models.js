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
import Gpt2 from './components/demos/Gpt2';

// This is the order in which they will appear in the menu
const modelGroups = [
    {
        label: "Annotate a sentence",
        models: [
            {model: "semantic-role-labeling", name: "Semantic Role Labeling", component: SemanticRoleLabeling},
            {model: "named-entity-recognition", name: "Named Entity Recognition", component: NamedEntityRecognition},
            {model: "constituency-parsing", name: "Constituency Parsing", component: ConstituencyParser},
            {model: "dependency-parsing", name: "Dependency Parsing", component: DependencyParser},
            {model: "open-information-extraction", name: "Open Information Extraction", component: OpenIe}
        ]
    },
    {
        label: "Annotate a passage",
        models: [
            {model: "coreference-resolution", name: "Coreference Resolution", component: Coref}
        ]
    },
    {
        label: "Answer a question",
        models: [
            {model: "reading-comprehension", name: "Reading Comprehension", component: ReadingComprehension}
        ]
    },
    {
        label: "Semantic parsing",
        models: [
            {model: "wikitables-parser", name: "WikiTableQuestions Semantic Parser", component: WikiTables},
            {model: "nlvr-parser", name: "Cornell NLVR Semantic Parser", component: Nlvr},
            {model: "atis-parser", name: "Text to SQL (ATIS)", component: Atis},
            {model: "quarel-parser-zero", name: "QuaRel Zero", component: QuarelZero}
        ]
    },
    {
        label: "Other",
        models: [
            {model: "textual-entailment", name: "Textual Entailment", component: TextualEntailment},
            {model: "sentiment-analysis", name: "Sentiment Analysis", component: SentimentAnalysis},
            {model: "event2mind", name: "Event2Mind", component: Event2Mind},
            {model: "gpt2", name: "Language Modeling", component: Gpt2},
            {model: "user-models", name: "Your model here!"}
        ]
    }
]

// Create mapping model => component
let modelComponents = {}
modelGroups.forEach((mg) => mg.models.forEach(({model, component}) => modelComponents[model] = component));

export { modelComponents, modelGroups }
