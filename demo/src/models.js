import SemanticRoleLabeling from './components/demos/SemanticRoleLabeling';
import OpenIe from './components/demos/OpenIe';
import Event2Mind from './components/demos/Event2Mind';
import TextualEntailment from './components/demos/TextualEntailment';
import MachineComprehension from './components/demos/MachineComprehension';
import Coref from './components/demos/Coref';
import NamedEntityRecognition from './components/demos/NamedEntityRecognition';
import ConstituencyParser from './components/demos/ConstituencyParser';
import DependencyParser from './components/demos/DependencyParser';
import WikiTables from './components/demos/WikiTables';
import Atis from './components/demos/Atis';
import QuarelZero from './components/demos/QuarelZero'

// This is the order in which they will appear in the menu
const models = [
    {model: "machine-comprehension", name: "Machine Comprehension", component: MachineComprehension},
    {model: "textual-entailment", name: "Textual Entailment", component: TextualEntailment},
    {model: "semantic-role-labeling", name: "Semantic Role Labeling", component: SemanticRoleLabeling},
    {model: "coreference-resolution", name: "Coreference Resolution", component: Coref},
    {model: "named-entity-recognition", name: "Named Entity Recognition", component: NamedEntityRecognition},
    {model: "constituency-parsing", name: "Constituency Parsing", component: ConstituencyParser},
    {model: "dependency-parsing", name: "Dependency Parsing", component: DependencyParser},
    {model: "open-information-extraction", name: "Open Information Extraction", component: OpenIe},
    {model: "wikitables-parser", name: "WikiTableQuestions Semantic Parser", component: WikiTables},
    {model: "event2mind", name: "Event2Mind", component: Event2Mind},
    {model: "atis-parser", name: "Text to SQL (ATIS)", component: Atis},
    {model: "quarel-parser-zero", name: "QuaRel Zero", component: QuarelZero},
    {model: "user-models", name: "Your model here!"}
]

// Create mapping model => component
let modelComponents = {}
models.forEach(({model, component}) => modelComponents[model] = component)

export { models, modelComponents }
