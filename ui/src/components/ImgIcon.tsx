import React from 'react';
import AntdIcon from '@ant-design/icons';

interface ImgIconProps {
    src: string;
    alt?: string;
    ariaHidden?: boolean;
}
export class ImgIcon extends React.PureComponent<ImgIconProps> {
    render() {
        const { src, alt = '', ariaHidden, ...other } = this.props;
        return (
            <AntdIcon
                {...other}
                component={() => (
                    <img src={src} alt={alt} aria-hidden={ariaHidden ? 'true' : 'false'} />
                )}
            />
        );
    }
}
