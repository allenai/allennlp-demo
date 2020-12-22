import React from 'react';
import styled from 'styled-components';

import { Models } from '../tugboat/context';
import { NoSelectedModel } from '../tugboat/error';
import { SyntaxHighlight } from '../tugboat/components/SyntaxHighlight';

interface Props {
    installNote?: string;
    installCommand: string;
    bashNote?: string;
    bashCommand: string;
    pythonNote?: string;
    pythonCommand: string;
    evaluationNote?: string;
    evaluationCommand: string;
    trainingNote?: string;
    trainingCommand: string;
}

export const ModelUsage = (props: Props) => {
    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModel();
    }

    return (
        <>
            <h5>Installing AllenNLP</h5>
            {props.installNote ? <p>{props.installNote}</p> : null}
            {props.installCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="bash">{props.installCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}

            <h5>Prediction</h5>
            <h6>On the command line (bash):</h6>
            {props.bashNote ? <p>{props.bashNote}</p> : null}
            {props.bashCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="bash">{props.bashCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}
            <h6>As a library (Python):</h6>
            {props.pythonNote ? <p>{props.pythonNote}</p> : null}
            {props.pythonCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{props.pythonCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}

            <h5>Evaluation</h5>
            {props.evaluationNote ? <p>{props.evaluationNote}</p> : null}
            {props.evaluationCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{props.evaluationCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}

            <h5>Training</h5>
            {props.trainingNote ? <p>{props.trainingNote}</p> : null}
            {props.trainingCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{props.trainingCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}
        </>
    );
};

/**
 * Create a little padding and border around code samples in the
 * usage sections, for readability and spacing.
 */
const UsageCode = styled.div`
    margin: ${({ theme }) => `${theme.spacing.sm} 0 ${theme.spacing.md}`};
`;
