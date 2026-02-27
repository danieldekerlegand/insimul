#!/usr/bin/env node

import { mdToPdf } from 'md-to-pdf';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node scripts/generate-pdf.js <markdown-file>');
    console.error('Example: node scripts/generate-pdf.js STARTUP_ROADMAP.md');
    process.exit(1);
  }

  const inputFile = args[0];
  const inputPath = path.isAbsolute(inputFile) 
    ? inputFile 
    : path.join(process.cwd(), inputFile);

  const outputPath = inputPath.replace(/\.md$/, '.pdf');

  console.log(`Converting ${inputFile} to PDF...`);
  console.log(`Input:  ${inputPath}`);
  console.log(`Output: ${outputPath}`);

  try {
    const pdf = await mdToPdf(
      { path: inputPath },
      {
        dest: outputPath,
        css: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 40px;
            font-size: 2.5em;
          }
          h2 {
            color: #34495e;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 8px;
            margin-top: 35px;
            font-size: 2em;
          }
          h3 {
            color: #34495e;
            margin-top: 30px;
            font-size: 1.5em;
          }
          h4 {
            color: #555;
            margin-top: 25px;
            font-size: 1.25em;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 0.9em;
          }
          table th {
            background-color: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          table td {
            padding: 10px;
            border: 1px solid #ddd;
          }
          table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
          }
          pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #3498db;
          }
          pre code {
            background-color: transparent;
            padding: 0;
          }
          blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin-left: 0;
            color: #555;
            font-style: italic;
          }
          ul, ol {
            padding-left: 30px;
            margin: 15px 0;
          }
          li {
            margin: 8px 0;
          }
          strong {
            color: #2c3e50;
          }
          em {
            color: #555;
          }
          hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 30px 0;
          }
          a {
            color: #3498db;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          @page {
            margin: 25mm;
          }
        `,
        pdf_options: {
          format: 'Letter',
          margin: {
            top: '25mm',
            bottom: '25mm',
            left: '20mm',
            right: '20mm'
          },
          printBackground: true,
          preferCSSPageSize: true
        },
        marked_options: {
          headerIds: true,
          mangle: false,
          breaks: true
        }
      }
    );

    if (pdf) {
      console.log('✅ PDF generated successfully!');
      console.log(`📄 Saved to: ${outputPath}`);
    }
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    process.exit(1);
  }
}

generatePDF();
