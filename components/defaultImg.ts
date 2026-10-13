export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  // console.log((e.target as HTMLImageElement).src, "error Image");
  (e.target as HTMLImageElement).srcset = '';
  (e.target as HTMLImageElement).src = '/assets/logo.png';
};
export const handleSVGError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  (e.target as HTMLImageElement).srcset = '';
  (e.target as HTMLImageElement).src = '/assets/logo.png';
  (e.target as HTMLImageElement).width = 30;
  (e.target as HTMLImageElement).height = 30;
};