import { type RefObject } from "react";

/**
 * Utility to generate a PDF from a DOM element using html2canvas and jspdf.
 * We dynamically import them to avoid SSR issues and reduce initial bundle size.
 */
export async function generatePDF(
  elementRef: RefObject<HTMLElement | null>,
  filename: string
): Promise<void> {
  if (!elementRef.current) return;

  try {
    // Dynamic imports
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // Capture the element
    const canvas = await html2canvas(elementRef.current, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // PDF dimensions setup (A4 standard: 210 x 297 mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Calculate image height based on the aspect ratio of the canvas
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
