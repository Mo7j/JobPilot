import { normalizeText } from '../../lib/ats';

// Lazy-load the heavy parsers so they never weigh down the initial bundle.
let pdfToolsPromise;
async function getPdfTools() {
  if (!pdfToolsPromise) {
    pdfToolsPromise = Promise.all([
      import('pdfjs-dist/build/pdf.mjs'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjsLib, workerModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
      return pdfjsLib;
    });
  }
  return pdfToolsPromise;
}

let mammothPromise;
async function getMammoth() {
  if (!mammothPromise) {
    mammothPromise = import('mammoth/mammoth.browser.js').then((m) => m.default ?? m);
  }
  return mammothPromise;
}

/** Extract plain text from an uploaded resume (PDF, DOCX, or TXT). */
export async function extractResumeText(file) {
  const lowerName = file.name.toLowerCase();
  const lowerType = (file.type || '').toLowerCase();

  if (lowerName.endsWith('.txt') || lowerType === 'text/plain') {
    const text = normalizeText(await file.text());
    if (!text) throw new Error('That file appears to be empty.');
    return text;
  }

  if (lowerName.endsWith('.pdf') || lowerType === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await getPdfTools();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      pages.push(textContent.items.map((item) => item.str).join(' '));
    }
    const text = normalizeText(pages.join('\n'));
    if (!text) throw new Error('The PDF did not contain readable text (is it a scan?).');
    return text;
  }

  if (
    lowerName.endsWith('.docx') ||
    lowerType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await getMammoth();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    const text = normalizeText(value);
    if (!text) throw new Error('The DOCX did not contain readable text.');
    return text;
  }

  throw new Error('Unsupported file type, use PDF, DOCX, or TXT.');
}
