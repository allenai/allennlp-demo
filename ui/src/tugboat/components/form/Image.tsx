import React from 'react';

import { FieldItem } from './controls';
import { ImageUpload, blobToString } from '../ImageUpload';

/**
 * A component that renders an image uploader for capturing an image to be processed by a model.
 *
 * The component should be a child of the Fields component.
 */
interface Props {
    value?: string;
    onChange: (v: any) => void;
}

export const Image = (props: Props) => {
    return (
        <FieldItem label="Image" name="image" rules={[{ required: true }]}>
            <ImageUpload
                onChange={(img) => {
                    blobToString(img.image)
                        .then((str) => {
                            img.image_base64 = str;
                            props.onChange({
                                image: img,
                            });
                        })
                        .catch((e) => console.log(e));
                }}
                modelParams={{ imgSrc: props.value }}
            />
        </FieldItem>
    );
};
