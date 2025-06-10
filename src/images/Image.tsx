import React from "react";
import { imageSrc } from "../db/LocalDataBase";

interface ImageProps {
    name: string;
    alt?: string;
    className?: string;
}

const Image: React.FC<ImageProps> = ({ name, alt, className }) => {
    const image = imageSrc[name];
    if (!image) return null;

    return (
        <img
            src={image.src}
            alt={alt || image.alt}
            className={className}
        />
    );
};

export default Image;