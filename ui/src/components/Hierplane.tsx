// TODO: we will be removing Hierplane someday soon!

import React from 'react';
import styled from 'styled-components';

import { Tree } from 'hierplane';

export const Hierplane = ({ tree, theme }: { tree: {}; theme?: string }) => {
    return (
        <HierplaneWrapper>
            <Tree tree={tree} theme={theme} />
        </HierplaneWrapper>
    );
};

const HierplaneWrapper = styled.div`
    overflow-y: auto;

    .hierplane__visualization-verbs {
        background: #f9fafc;
        padding: 1em 1.25em;
        border-bottom: 1px solid #e5eaf0;
        color: rgba(28, 47, 58, 0.5);
    }

    .hierplane__visualization-verbs a {
        display: inline-block;
        margin-right: 1em;
    }

    .hierplane__visualization-verbs button svg {
        fill: rgba(28, 47, 58, 0.5);
    }

    .hierplane__visualization-verbs button:hover svg {
        fill: #1c2f3a;
    }

    .hierplane__visualization-verbs__prev {
        transform: rotateY(-180deg);
    }

    .hierplane__visualization-verbs__label {
        user-select: none;
    }

    /* THESE ARE HACKS PUT HERE BY @codeviking */

    /*
    Center the controls in the toolbar.
    */
    .hierplane__visualization
        .hierplane
        .parse-tree-toolbar
        .parse-tree-toolbar__item
        .parse-tree-toolbar__item__label {
        top: 50%;
        margin-top: -13px;
    }

    /*
    Make the toolbar background transparent, as it looks weird when it matches the color of the
    tab / verb-select bars.
    */
    .hierplane__visualization .hierplane--theme-light .parse-tree-toolbar {
        background: transparent;
        border: none;
    }
    .hierplane__visualization .hierplane--theme-light .parse-tree-toolbar:before {
        background: transparent;
        border: none;
    }

    /*
    This eliminates the negative left margin used to artifically bump punctuation such that it
    doesn't appear to have space before it. This isn't worth the side-effect in SRL, as here
    we have spans that contain things other than punctuation that are ignored. This can in the
    long run potentially be fixed in hierplane...but that might not happen.
    */
    .hierplane__visualization .hierplane #passage p .passage__readonly .span-slice__ignored {
        margin-left: 0 !important;
    }

    /*
    Adjust the "passage" display so that it accomodates the entire sentence, if possible. This
    prevents the user from having to scroll when the sentence is long.
    */
    .hierplane__visualization .hierplane--theme-light #passage {
        height: auto !important;
        flex: 1;
    }

    /*
    Resolve wrapping issues.
    */
    .hierplane__visualization .hierplane #passage p span {
        display: inline;
    }

    .hierplane__visualization .hierplane .parse-tree-toolbar {
        max-height: 0;
        align-items: center;
    }

    .hierplane__visualization .hierplane #passage {
        min-height: auto;
        -webkit-transition: min-height 0.2s ease;
        transition: min-height 0.2s ease;
    }

    .hierplane__visualization .hierplane #passage p {
        padding: 1em;
        -webkit-transition: padding 0.2s ease;
        transition: padding 0.2s ease;
    }

    .hierplane__visualization .hierplane #main-stage .main-stage__tree-container {
        margin: 0 auto;
    }

    @media screen and (max-height: 800px) {
        .hierplane__visualization .hierplane #passage {
            min-height: auto;
        }

        .hierplane__visualization .hierplane #passage p {
            padding: 0.1em;
        }
    }
`;
