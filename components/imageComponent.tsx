/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { handleImageError } from "./defaultImg";

const imageLoader = ({ src, width, quality = 80 }: any) =>
  `${src}?_w=${width}&&_q=${quality}`;

const ImageComponent = ({
  src = "",
  altSrc = "",
  alt = "image",
  width = "",
  height = "",
  ...rest
}: any) => {
  // Use errorImage.webp as fallback if src and altSrc are empty
  const fallback = "/assets/logo.png";
  const imageSrc = src ? src : altSrc ? altSrc : fallback;
  return (
    <Image
      alt={alt}
      width={width}
      height={height}
      src={imageSrc}
      loader={imageLoader}
      {...rest}
      unoptimized
      priority={true}
      onError={handleImageError}
      loading="eager"
      // quality={50}
    />
  );
};

export default ImageComponent;
