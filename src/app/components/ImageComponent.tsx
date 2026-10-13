'use client';
import { handleImageError } from './PlaceHolder';
import Image, { ImageLoaderProps, ImageProps } from 'next/image';
// Custom Image Loader
const imageLoader = ({ src, width, quality = 80 }: ImageLoaderProps) =>
  `${src}?_w=${width}&&_q=${quality}`;
// Type Definition for Props
interface ImageComponentProps extends Omit<ImageProps, 'src' | 'loader'> {
  src?: string;
  altSrc?: string;
  className?: string;
  width?: number;
  height?: number;
}
// Image Component
const ImageComponent: React.FC<ImageComponentProps> = ({
  src = '',
  alt = 'image',
  className = '',
  priority = false,
  width = 800,
  height = 800,
  ...rest
}) => {
  const imageSrc =
    typeof src === 'string' && (src.startsWith('/') || src.startsWith('https'))
      ? src
      : process.env.NEXT_PUBLIC_IMAGE_URL + src;
  return (
    <Image
      alt={alt}
      src={imageSrc}
      loader={imageLoader}
      priority={priority}
      className={className}
      onError={handleImageError}
      width={width}
      height={height}
      {...rest}
    />
  );
};
export default ImageComponent;