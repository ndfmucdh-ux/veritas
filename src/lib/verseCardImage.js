import html2canvas from "html2canvas";

// Renders a DOM element (the verse card) to a PNG blob at 2x resolution.
export async function renderCardBlob(el) {
  const canvas = await html2canvas(el, { useCORS: true, backgroundColor: null, scale: 2, logging: false });
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("render failed"))), "image/png")
  );
}

// Saves a blob to the device without opening a new tab.
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}