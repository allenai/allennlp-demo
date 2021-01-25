import TextualEntailment from './components/demos/TextualEntailment';
import SentimentAnalysis from './components/demos/SentimentAnalysis';
import VisualQuestionAnswering from './components/demos/VisualQuestionAnswering';
import LanguageModel from './components/demos/LanguageModel';
import MaskedLm from './components/demos/MaskedLm';
import annotateIcon from './icons/annotate-14px.svg';
import otherIcon from './icons/other-14px.svg';
import passageIcon from './icons/passage-14px.svg';
import questionIcon from './icons/question-14px.svg';

// This is the order in which they will appear in the menu
const modelGroups = [
    {
        label: 'Answer a question',
        iconSrc: questionIcon,
        defaultOpen: true,
        models: [
            {
                model: 'visual-question-answering',
                name: 'Visual Question Answering',
                component: VisualQuestionAnswering,
            },
        ],
    },
    {
        label: 'Annotate a sentence',
        iconSrc: annotateIcon,
        defaultOpen: true,
        models: [
            {
                model: 'sentiment-analysis',
                name: 'Sentiment Analysis',
                component: SentimentAnalysis,
            },
        ],
    },
    {
        label: 'Annotate a passage',
        iconSrc: passageIcon,
        defaultOpen: true,
        models: [],
    },
    {
        label: 'Other',
        iconSrc: otherIcon,
        defaultOpen: true,
        models: [
            {
                model: 'textual-entailment',
                name: 'Textual Entailment',
                component: TextualEntailment,
            },
            {
                model: 'next-token-lm',
                name: 'Language Modeling',
                component: LanguageModel,
                redirects: ['gpt2'],
            },
            { model: 'masked-lm', name: 'Masked Language Modeling', component: MaskedLm },
        ],
    },
];

// Create mapping from model to component
const modelComponents = {};
modelGroups.forEach((mg) =>
    mg.models.forEach(({ model, component }) => (modelComponents[model] = component))
);

const modelRedirects = {};
modelGroups.forEach((mg) =>
    mg.models.forEach(({ model, redirects }) => {
        if (redirects) {
            redirects.forEach((redirect) => (modelRedirects[redirect] = model));
        }
    })
);

export { modelComponents, modelGroups, modelRedirects };
