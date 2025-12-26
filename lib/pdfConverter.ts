// lib/pdfConverter.ts

// Helper: Load script from CDN if not already loaded
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (window.pdfjsLib) {
      // @ts-ignore
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    // Using version 3.11.174 (Stable & widely cached)
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      // @ts-ignore
      const lib = window.pdfjsLib;
      // Set the worker immediately after loading
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(lib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF library"));
    document.head.appendChild(script);
  });
};

export const convertPdfToImage = async (file: File): Promise<string> => {
  try {
    // 1. Ensure Library is Loaded
    const pdfjs = await loadPdfJs();

    // 2. Load the PDF Document
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 3. Get First Page
    const page = await pdf.getPage(1);
    
    // 4. Set Scale (1.5 is standard for good OCR)
    const viewport = page.getViewport({ scale: 1.5 });

    // 5. Prepare Canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    if (!context) throw new Error("Canvas context failed");
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 6. Render
    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // 7. Export
    return canvas.toDataURL("image/jpeg");

  } catch (error) {
    console.error("PDF Engine Error:", error);
    throw new Error("Could not process this PDF.");
  }
};