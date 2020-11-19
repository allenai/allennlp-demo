import { DemoGroup } from './tugboat';

/**
 * TODO: These are SVGs, so we should just convert them into React.Components that are output
 * as part of the DOM. They'll be faster, look better and we can change colors n' such via
 * CSS.
 */
import annotateIcon from './icons/annotate-14px.svg';
import otherIcon from './icons/other-14px.svg';
import parseIcon from './icons/parse-14px.svg';
import passageIcon from './icons/passage-14px.svg';
import questionIcon from './icons/question-14px.svg';
import addIcon from './icons/add-14px.svg';

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
        label: 'Semantic parsing',
        iconSrc: parseIcon,
    },
    {
        label: 'Other',
        iconSrc: otherIcon,
    },
    {
        label: 'Contributing',
        iconSrc: addIcon,
    },
];
