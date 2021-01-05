import React from 'react';

interface NumberWithSign {
    value: number;
    span: [number, number];
    sign: number;
}

interface Props {
    numbersWithSign: NumberWithSign[];
}

export const ArithmeticEquation = ({ numbersWithSign }: Props) => {
    if (numbersWithSign) {
        let ret = numbersWithSign
            .filter((n) => n.sign !== 0)
            .map((n) => `${n.sign > 0 ? '+' : '-'} ${n.value}`)
            .join(' ');
        while (ret.charAt(0) === '+' || ret.charAt(0) === ' ') {
            ret = ret.substr(1);
        }
        return <span>{ret}</span>;
    }
    return null;
};
