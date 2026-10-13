export const downloadFn = async (fileUrl: string, fileName: string) => {
  if(!fileUrl || fileUrl == "") return
  const res = await fetch(fileUrl);

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName + ".pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
};
