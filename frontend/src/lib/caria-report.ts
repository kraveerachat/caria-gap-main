/**
 * Shared client-side PDF utilities for the CARIA lead-gen flow.
 *
 * `elementToPdfBlob` rasterizes an off-screen, light-themed report sheet
 * (html2canvas) into a multi-page A4 PDF (jsPDF). Both libraries are imported
 * dynamically so they stay out of the initial bundle. The capture forces a
 * light render of the clone so design tokens resolve to their hex (never oklch)
 * values and the PDF looks the same regardless of the live theme.
 */

/** Rasterize a DOM element into an A4 PDF blob (multi-page if it overflows). */
export async function elementToPdfBlob(el: HTMLElement): Promise<Blob> {
  // Make sure web fonts (incl. Thai) and the chart have painted before capture.
  if (typeof document !== "undefined" && (document as { fonts?: { ready: Promise<unknown> } }).fonts?.ready) {
    await (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready;
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 320));

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: (doc) => doc.documentElement.classList.remove("dark"),
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH, undefined, "FAST");
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH, undefined, "FAST");
    heightLeft -= pageH;
  }
  return pdf.output("blob");
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
