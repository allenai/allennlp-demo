import React from 'react';
import styled from 'styled-components';

import { Models } from '../tugboat/context';
import { ModelCard, Link } from '../tugboat/lib';
import { NoSelectedModelError } from '../tugboat/error';
import { SyntaxHighlight } from '../tugboat/components/SyntaxHighlight';

interface Props {
    modelCard: ModelCard;
    bashNote?: string;
    bashCommand: string;
    pythonNote?: string;
    pythonCommand: string;
}

export const ModelUsage = (props: Props) => {

    let installNote = null;
    const installCommand = `${props.modelCard.install_instructions}`;
    const evalDataPath =
        `${props.modelCard.evaluation_dataset.processed_url}`;

    const trainingDataPath = `${props.modelCard.training_config}`;

    const evalAvailable = evalDataPath !== 'null';

    const trainAvailable = (trainingDataPath !== 'null' && trainingDataPath !== 'undefined');

    let evaluationCommand = null;
    let evaluationNote = null;

    if (evalAvailable) {
        evaluationCommand = `
            allennlp evaluate \\
        ${props.modelCard.archive_file} \\
        ${evalDataPath}`.trim();
    }
    evaluationNote = props.modelCard.evaluation_dataset.notes;

    let trainingCommand = null;
    let trainingNote = null;

    if (trainAvailable) {
        trainingCommand = `allennlp train \\
        ${trainingDataPath} \\
        -s /path/to/output`.trim();
    }

    trainingNote = props.modelCard.training_dataset.notes;

    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    return (
        <>
            <h5>Installing AllenNLP</h5>
            {installNote ? <p>{installNote}</p> : null}
            {installCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="bash">{installCommand}</SyntaxHighlight>
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
            {evaluationNote ? <p>{evaluationNote}</p> : null}
            {props.modelCard.evaluation_dataset ? (
                <p>
                    About the dataset: 
                    <DatasetLink link={props.modelCard.evaluation_dataset} />
                </p>
            ) : (
                null
            )}
            {evaluationCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{evaluationCommand}</SyntaxHighlight>
                </UsageCode>
            ) : <p>Evaluation command is unavailable.</p>}

            <h5>Training</h5>
            {trainingNote ? <p>{trainingNote}</p> : null}
            {props.modelCard.training_dataset ? (
                <p>
                    About the dataset: 
                    <DatasetLink link={props.modelCard.training_dataset} />
                </p>
            ) : (
                null
            )}
            {trainingCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{trainingCommand}</SyntaxHighlight>
                </UsageCode>
            ) : <p>Training command is unavailable.</p>}
        </>
    );
    
}

/**
 * Create a little padding and border around code samples in the
 * usage sections, for readability and spacing.
 */
const UsageCode = styled.div`
    margin: ${({ theme }) => `${theme.spacing.sm} 0 ${theme.spacing.md}`};
`;

const DatasetLink = ({ link }: { link: Link }) => {
    return link.url ? <a href={link.url}>{link.name}</a> : <span>{link.name}</span>;
};
