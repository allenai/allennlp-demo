import { DemoGroup } from './tugboat/lib';

/**
 * TODO: These are SVGs, so we should just convert them into React.Components that are output
 * as part of the DOM. They'll be faster, look better and we can change colors n' such via
 * CSS.
 */
import annotateIcon from './icons/annotate-14px.svg';
import otherIcon from './icons/other-14px.svg';
import passageIcon from './icons/passage-14px.svg';
import questionIcon from './icons/question-14px.svg';

export const groups: DemoGroup[] = [
    {
        label: 'Answer a question',
        iconSrc: questionIcon,
    },
    {
        label: 'Annotate a sentence',
        iconSrc: annotateIcon,
    },
    {
        label: 'Annotate a passage',
        iconSrc: passageIcon,
    },
    {
        label: 'Other',
        iconSrc: otherIcon,
    },
];
