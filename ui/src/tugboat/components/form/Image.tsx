import React from 'react';
import * as Sentry from '@sentry/react';

import { FieldItem } from './controls';
import { UploadedImage, ImageUpload, blobToString } from '../ImageUpload';

/**
 * A component that renders an image uploader for capturing an image to be processed by a model.
 *
 * The component should be a child of the Fields component.
 */
interface Props {
    value?: string;
    onChange: (i: UploadedImage) => void;
}

export const Image = (props: Props) => {
    return (
        <FieldItem label="Image" name="image" rules={[{ required: true }]}>
            <ImageUpload
                onChange={(image) => {
                    blobToString(image.image)
                        .then((str) => {
                            image.image_base64 = str;
                            props.onChange(image);
                        })
                        .catch((e) => {
                            Sentry.captureException(e);
                            console.error(e);
                        });
                }}
                uploadedImage={{ imageSrc: props.value }}
            />
        </FieldItem>
    );
};
