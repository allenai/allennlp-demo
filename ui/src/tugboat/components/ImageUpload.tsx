import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as Sentry from '@sentry/react';
import { Upload, message } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';

export interface UploadedImage {
    imageSrc?: string;
    fileName?: string;
    image?: File;
    image_base64?: string;
}

interface Props {
    uploadedImage: UploadedImage;
    onChange: (newParams: UploadedImage) => void;
}

export const ImageUpload = (props: Props) => {
    const [localState, setLocalState] = useState<UploadedImage>({});
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(
        () => {
            if (
                props.uploadedImage.imageSrc &&
                props.uploadedImage.imageSrc !== localState.imageSrc
            ) {
                fetchImage(props.uploadedImage.imageSrc);
            }
        },
        // eslint-disable-next-line
        [props.uploadedImage.imageSrc]
    );

    const compressAndSubmit = (
        file: File,
        maxFileBytes: number,
        onSuccess: Function,
        onError: Function
    ) => {
        if (file.size > maxFileBytes) {
            downscaleImage({ file, maxFileBytes, onSuccess, onError });
        } else {
            onSuccess(file);
        }
    };

    const beforeUpload = (file: File) => {
        const isImage =
            file.type === 'image/bmp' ||
            file.type === 'image/gif' ||
            file.type === 'image/png' ||
            file.type === 'image/jpeg' ||
            file.type === 'image/tiff';
        if (!isImage) {
            message.error('You can only upload JPG/PNG/BMP/GIF/TIFF files');
        } else {
            setImageLoadingAndSendEvent(true);
        }
        return isImage;
    };

    const handleImageChange = (info: UploadChangeParam<UploadFile<any>>) => {
        if (info.file.status === 'done') {
            const file = info.file.originFileObj as File;
            if (file) {
                compressAndSubmit(
                    file,
                    1024 * 1024, // compressing if larger than 1MB
                    (compressedFile: File) => {
                        setStateAndTriggerOnChange({
                            imageSrc: URL.createObjectURL(compressedFile),
                            fileName: compressedFile.name,
                            image: compressedFile,
                        });
                        setImageLoadingAndSendEvent(false);
                    },
                    () => {
                        message.error(
                            `${info.file.name} file upload failed: ${info.file.error.message}`
                        );
                        setStateAndTriggerOnChange({
                            imageSrc: undefined,
                            fileName: undefined,
                            image: undefined,
                        });
                        setImageLoadingAndSendEvent(false);
                    }
                );
            }
        } else if (info.file.status === 'error') {
            // If the image is too large, then info.file.error.message will
            // look like "cannot post api/permalink/noop 413'"
            const errorIs413 = info.file.error.message.match("^cannot post .* 413'$");

            const maxFileSize = 5 * 1024 * 1024;
            if (errorIs413 && info.file.size > maxFileSize) {
                // Show a friendly "too large" error if it's appropriate to do so
                message.error(
                    `${info.file.name} file is too large; must be smaller than ${maxFileSize} bytes`
                );
            } else {
                // Otherwise, it's a different error.
                message.error(`${info.file.name} file upload failed: ${info.file.error.message}`);
            }

            setStateAndTriggerOnChange({
                imageSrc: undefined,
                fileName: undefined,
                image: undefined,
            });
            setImageLoadingAndSendEvent(false);
        }
    };

    async function fetchImage(imageSrc: string) {
        setImageLoadingAndSendEvent(true);
        let s: UploadedImage = {
            imageSrc,
            fileName: undefined,
            image: undefined,
        };
        if (imageSrc) {
            const response = await fetch(imageSrc);
            const blob = await response.blob();

            const file = blob as any; // convert blob to file
            file.lastModifiedDate = new Date();
            file.name = imageSrc;
            s = {
                imageSrc,
                fileName: file.name,
                image: file as File,
            };
        }
        setStateAndTriggerOnChange(s);
        setImageLoadingAndSendEvent(false);
    }

    const setStateAndTriggerOnChange = (s: UploadedImage) => {
        const val = { ...localState, ...s };
        setLocalState(val);
        props.onChange(val);
    };

    const setImageLoadingAndSendEvent = (imageLoading: boolean) => {
        setImageLoading(imageLoading);
    };

    return (
        <React.Fragment>
            <div title="Upload an Image">
                <Dragger
                    onChange={handleImageChange}
                    showUploadList={false}
                    // This is just a noop endpoint, we need an endpoint, but we dont need
                    // to save the image.  This is just a hoop we need ofr the antd Dragger/Upload.
                    action="/api/permalink/noop"
                    beforeUpload={beforeUpload}>
                    {imageLoading ? (
                        <DraggerMessage>
                            <LoadingOutlined /> Loading...
                        </DraggerMessage>
                    ) : null}
                    {!imageLoading && localState.imageSrc ? (
                        <DraggerImg src={localState.imageSrc} />
                    ) : null}
                    {!imageLoading && !localState.imageSrc ? (
                        <DraggerMessage>
                            <UploadOutlined /> Upload an Image
                        </DraggerMessage>
                    ) : null}
                </Dragger>
            </div>
        </React.Fragment>
    );
};

// TODO: consider making a Promise<Image> instead of callback
// TODO: consider moving to a webworker
export const downscaleImage = ({
    file,
    maxFileBytes,
    newFileName,
    onSuccess,
    onError,
}: {
    file: File;
    maxFileBytes: number;
    newFileName?: string;
    onSuccess: Function;
    onError: Function;
}) => {
    const path = require('path');
    const originalFileName = path.basename(file.name);
    const fileName = newFileName || `${originalFileName}_c.jpg`;
    // console.log(`Compressing ${file.name} (${file.size}Bytes)`);
    // maxPixels captures the maximum pixels in an image that's maxFileBytes in size.
    // 3Bytes/px was calculated from random data case of png/jpg quality 1 https://superuser.com/questions/636333/what-is-the-largest-size-of-a-640x480-jpeg
    const maxPixels = maxFileBytes / 3;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target ? (event.target.result as string) : '';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const curPixels = img.width * img.height;
            const scale = Math.sqrt(maxPixels) / Math.sqrt(curPixels);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.canvas.toBlob(
                    (blob: Blob | null) => {
                        if (blob) {
                            const compressedFile = new File([blob], fileName, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            // console.log(`Generated ${fileName} (${compressedFile.size}Bytes)`);
                            onSuccess(compressedFile);
                        }
                        onError('canvas.toBlob failed.');
                    },
                    'image/jpeg',
                    1
                );
            } else {
                if (onError) {
                    onError('Invalid context.');
                }
            }
        };
        reader.onerror = (error) => {
            Sentry.captureException(error);
            console.error(error);
            if (onError) {
                onError('Error compressing image.');
            }
        };
    };
    reader.readAsDataURL(file);
};

const Dragger = styled(Upload.Dragger)`
    &&& {
        .ant-upload-drag {
            height: 260px;
        }
        .ant-upload-btn {
            padding: 0;
        }
    }
`;

const DraggerMessage = styled.div`
    padding: ${({ theme }) => `${theme.spacing.md} 0`};
`;

const DraggerImg = styled.img`
    max-height: ${({ theme }) => `calc(267px - ${theme.spacing.xxs} - ${theme.spacing.xxs})`};
    max-width: ${({ theme }) => `calc(100% - ${theme.spacing.xxs} - ${theme.spacing.xxs})`};
    padding: ${({ theme }) => theme.spacing.xxs};
`;

export async function blobToString(blob?: File) {
    return new Promise<string>((resolve, reject) => {
        if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
                var base64String = reader.result as string;
                // Base64 Encoded String without additional data: Attributes.
                if (base64String) {
                    resolve(base64String.substr(base64String.indexOf(',') + 1));
                }
                reject(reader.error);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        } else {
            resolve('');
        }
    });
}
