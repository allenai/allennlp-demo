import React from 'react';

interface Props {
    name: string;
    url?: any;
}

export const MaybeLink = ({ props }: { props: Props }) => {
    return props.url ? <a href={props.url}>{props.name}</a> : <span>{props.name}</span>;
};
