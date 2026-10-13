export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  console.log('imgErr', (e.target as HTMLImageElement).src);
  (e.target as HTMLImageElement).srcset = '';
  (e.target as HTMLImageElement).src = 'assets/errorImage.webp';
};
export const handleSVGError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  (e.target as HTMLImageElement).srcset = '';
  (e.target as HTMLImageElement).src = 'assets/errorImage.webp';
  (e.target as HTMLImageElement).width = 30;
  (e.target as HTMLImageElement).height = 30;
};