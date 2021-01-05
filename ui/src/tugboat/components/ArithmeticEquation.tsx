import React from 'react';

interface NumberWithSign {
    value: number;
    sign: number;
}
interface Props {
    numbersWithSign: NumberWithSign[];
    answer: string;
    answerAtEnd?: boolean;
}
export const ArithmeticEquation = ({ numbersWithSign, answer, answerAtEnd }: Props) => {
    let expression = '';
    for (const { sign, value } of numbersWithSign) {
        // Filter expressions that evaluate to 0
        if (sign === 0) {
            continue;
        }

        // Trim leading "+" characters
        if (sign > 0 && expression.length === 0) {
            expression = `${value}`;
            continue;
        }

        expression += ` ${sign > 0 ? '+' : '-'} ${value}`;
    }
    if (answerAtEnd) {
        expression = `${expression.trim()} = ${answer}`;
    } else {
        expression = `${answer} = ${expression.trim()}`;
    }

    return <code>{expression}</code>;
};
