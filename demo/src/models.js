import SrlComponent from './components/SrlComponent';
import OpenIeComponent from './components/OpenIeComponent';
import Event2MindComponent from './components/Event2MindComponent';
import TeComponent from './components/TeComponent';
import McComponent from './components/McComponent';
import CorefComponent from './components/CorefComponent';
import NamedEntityComponent from './components/NamedEntityComponent';
import ConstituencyParserComponent from './components/ConstituencyParserComponent';
import DependencyParserComponent from './components/DependencyParserComponent';
import WikiTablesComponent from './components/WikiTablesComponent';
import AtisComponent from './components/AtisComponent';

// This is the order in which they will appear in the menu
const models = [
    {model: "machine-comprehension", name: "Machine Comprehension", component: McComponent},
    {model: "textual-entailment", name: "Textual Entailment", component: TeComponent},
    {model: "semantic-role-labeling", name: "Semantic Role Labeling", component: SrlComponent},
    {model: "coreference-resolution", name: "Coreference Resolution", component: CorefComponent},
    {model: "named-entity-recognition", name: "Named Entity Recognition", component: NamedEntityComponent},
    {model: "constituency-parsing", name: "Constituency Parsing", component: ConstituencyParserComponent},
    {model: "dependency-parsing", name: "Dependency Parsing", component: DependencyParserComponent},
    {model: "open-information-extraction", name: "Open Information Extraction", component: OpenIeComponent},
    {model: "wikitables-parser", name: "WikiTableQuestions Semantic Parser", component: WikiTablesComponent},
    {model: "event2mind", name: "Event2Mind", component: Event2MindComponent},
    {model: "atis-parser", name: "Text to SQL (ATIS)", component: AtisComponent},
    {model: "user-models", name: "Your model here!"}
]

// Create mapping model => component
let modelComponents = {}
models.forEach(({model, component}) => modelComponents[model] = component)

export { models, modelComponents }
