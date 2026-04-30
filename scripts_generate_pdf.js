const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.cwd(), 'PROJECT_DOCUMENTATION.md');
const outputPath = path.join(process.cwd(), 'PROJECT_DOCUMENTATION.pdf');

const raw = fs.readFileSync(inputPath, 'utf8').replace(/\r/g, '');
const sourceLines = raw.split('\n');

const maxChars = 95;
const wrapped = [];

function wrapLine(line) {
  if (line.length <= maxChars) return [line];
  const words = line.split(/\s+/);
  const out = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out;
}

for (const line of sourceLines) {
  if (line.trim() === '') {
    wrapped.push('');
    continue;
  }
  const isHeading = /^#{1,6}\s+/.test(line);
  const normalized = isHeading ? line.replace(/^#{1,6}\s+/, '').trim() : line;
  wrapped.push(...wrapLine(normalized));
}

const pageWidth = 612;
const pageHeight = 792;
const marginLeft = 50;
const marginTop = 50;
const lineHeight = 14;
const startY = pageHeight - marginTop;
const linesPerPage = Math.floor((pageHeight - marginTop - 50) / lineHeight);

const pages = [];
for (let i = 0; i < wrapped.length; i += linesPerPage) {
  pages.push(wrapped.slice(i, i + linesPerPage));
}

function pdfEscape(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

const objects = [];
function addObject(content) {
  objects.push(content);
  return objects.length;
}

const catalogObj = addObject('<< /Type /Catalog /Pages 2 0 R >>');
const pagesObj = addObject('');
const fontObj = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

const pageObjNums = [];
for (const pageLines of pages) {
  const pageObjNum = addObject('');
  const contentLines = [
    'BT',
    '/F1 11 Tf',
    `${lineHeight} TL`,
    `${marginLeft} ${startY} Td`
  ];

  for (let i = 0; i < pageLines.length; i++) {
    const line = pdfEscape(pageLines[i]);
    if (i === 0) {
      contentLines.push(`(${line}) Tj`);
    } else {
      contentLines.push('T*');
      contentLines.push(`(${line}) Tj`);
    }
  }

  contentLines.push('ET');

  const stream = contentLines.join('\n') + '\n';
  const streamBytes = Buffer.byteLength(stream, 'utf8');
  const contentObjNum = addObject(`<< /Length ${streamBytes} >>\nstream\n${stream}endstream`);

  objects[pageObjNum - 1] =
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObjNum} 0 R >>`;

  pageObjNums.push(pageObjNum);
}

objects[pagesObj - 1] =
  `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>`;

let pdf = '%PDF-1.4\n';
const offsets = [0];

for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefStart = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}

pdf +=
  `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

fs.writeFileSync(outputPath, pdf, 'binary');
console.log(`Created ${outputPath}`);
