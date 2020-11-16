import { DemoConfig } from '../tugboat';

export const demoConfig: DemoConfig = {
    demoGroup: 'Other',
    title: 'Masked Language Modeling',
    routePathOverride:
        'masked-lm?text=The%20doctor%20ran%20to%20the%20emergency%20room%20to%20see%20%5BMASK%5D%20patient.',
    order: 3,
    status: 'hidden',
};
