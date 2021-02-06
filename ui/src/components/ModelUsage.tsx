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
    let evaluationCommand = null;

    if (props.modelCard.evaluation_dataset.processed_url) {
        evaluationCommand = `
            allennlp evaluate \\
        ${props.modelCard.archive_file} \\
        ${props.modelCard.evaluation_dataset.processed_url}`.trim();
    }

    let trainingCommand = null;

    if (props.modelCard.training_config) {
        trainingCommand = `allennlp train \\
        ${props.modelCard.training_config} \\
        -s /path/to/output`.trim();
    }

    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    return (
        <>
            <h5>Installing AllenNLP</h5>
            {props.modelCard.install_instructions ? (
                <UsageCode>
                    <SyntaxHighlight language="bash">
                        {props.modelCard.install_instructions}
                    </SyntaxHighlight>
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
            {props.modelCard.evaluation_dataset.notes ? (
                <p>{props.modelCard.evaluation_dataset.notes}</p>
            ) : null}
            {props.modelCard.evaluation_dataset ? (
                <h6>
                    About the dataset: <DatasetLink link={props.modelCard.evaluation_dataset} />
                </h6>
            ) : null}
            {evaluationCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{evaluationCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}
            {!(evaluationCommand && props.modelCard.evaluation_dataset.notes) ? (
                <p>Evaluation command is unavailable.</p>
            ) : null}

            <h5>Training</h5>
            {props.modelCard.training_dataset.notes ? (
                <p>{props.modelCard.training_dataset.notes}</p>
            ) : null}
            {props.modelCard.training_dataset ? (
                <h6>
                    About the dataset: <DatasetLink link={props.modelCard.training_dataset} />
                </h6>
            ) : null}
            {trainingCommand ? (
                <UsageCode>
                    <SyntaxHighlight language="python">{trainingCommand}</SyntaxHighlight>
                </UsageCode>
            ) : null}
            {!(trainingCommand && props.modelCard.training_dataset.notes) ? (
                <p>Training command is unavailable.</p>
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

const DatasetLink = ({ link }: { link: Link }) => {
    return link.url ? <a href={link.url}>{link.name}</a> : <span>{link.name}</span>;
};
