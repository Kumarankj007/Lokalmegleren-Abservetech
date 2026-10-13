/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { handleImageError } from "./PlaceHolder";

const imageLoader = ({ src, width, quality=80 } : any) => `${src}?_w=${width}&&_q=${quality}`;

const ImageComponent = ({
  src = "",
  altSrc = "",
  alt = "image",
  width = '',
  height = '',
  priority = true,
  loading = "eager",
  ...rest
}: any) => {
  // Use errorImage.webp as fallback if src and altSrc are empty
  const fallback = '/assets/errorImage.webp';
  const imageSrc = (process.env.NEXT_PUBLIC_BASE_PATH || "") + (src ? src : altSrc ? altSrc : fallback);
  return (
    <Image
      alt={alt}
      width={width}
      height={height}
      src={imageSrc}
      loader={imageLoader}
      unoptimized
      // Defaults stay eager/priority for legacy call sites, but callers can now
      // opt individual images out - `priority` + `loading` sit before the
      // spread so props win.
      priority={priority}
      loading={priority ? "eager" : loading}
      onError={handleImageError}
      {...rest}
      // quality={50}
    />
  );
};

export default ImageComponent;
