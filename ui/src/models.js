import LanguageModel from './components/demos/LanguageModel';
import otherIcon from './icons/other-14px.svg';

// This is the order in which they will appear in the menu
const modelGroups = [
    {
        label: 'Other',
        iconSrc: otherIcon,
        defaultOpen: true,
        models: [
            {
                model: 'next-token-lm',
                name: 'Language Modeling',
                component: LanguageModel,
                redirects: ['gpt2'],
            },
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
