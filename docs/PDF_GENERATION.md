# PDF Generation Guide

This document explains how to generate professional PDFs from any Markdown file in the repository.

## Setup

Install the required dependency:

```bash
npm install
```

This will install `md-to-pdf`, which handles the conversion from Markdown to PDF with professional styling.

## Quick Start

### Generate Specific Documents

We've created convenient npm scripts for common documents:

```bash
# Generate the startup roadmap PDF
npm run pdf:roadmap

# Generate the VR support roadmap PDF
npm run pdf:vr

# Generate the asset pipeline survey PDF
npm run pdf:assets
```

### Generate Any Markdown File

To convert any Markdown file to PDF:

```bash
npm run pdf <filename.md>
```

**Examples:**

```bash
# Convert a file in the root directory
npm run pdf STARTUP_ROADMAP.md

# Convert a file in a subdirectory
npm run pdf docs/architecture.md

# Convert with absolute path
npm run pdf /Users/you/project/notes.md
```

## Output

- PDFs are generated in the **same directory** as the source Markdown file
- The filename will match the source: `STARTUP_ROADMAP.md` → `STARTUP_ROADMAP.pdf`
- PDFs are automatically excluded from git (via `.gitignore`)

## Styling

The generated PDFs include professional styling:

- **Typography**: System fonts optimized for readability
- **Tables**: Styled with headers and alternating row colors
- **Headings**: Color-coded hierarchy with bottom borders
- **Code blocks**: Syntax highlighting with left border accent
- **Links**: Blue hyperlinks (functional in PDF viewers)
- **Margins**: 25mm top/bottom, 20mm left/right

## Custom Styling

To customize the PDF appearance, edit the CSS in `scripts/generate-pdf.js`:

```javascript
stylesheet: [
  `
  body {
    font-family: 'Your Font', sans-serif;
    // Your custom styles...
  }
  `
]
```

## Troubleshooting

**"Error generating PDF"**
- Ensure the Markdown file exists and path is correct
- Check that you've run `npm install`

**"Cannot find module 'md-to-pdf'"**
- Run `npm install` to install dependencies

**Tables not rendering correctly**
- Ensure tables use proper Markdown syntax
- Check for pipe alignment: `| Column 1 | Column 2 |`

**Missing styles**
- The CSS is embedded in `scripts/generate-pdf.js`
- Verify the stylesheet array is properly formatted

## Script Details

The conversion script (`scripts/generate-pdf.js`) uses:

- **md-to-pdf**: Core conversion engine
- **Puppeteer**: Headless Chrome for rendering (installed automatically)
- **Marked**: Markdown parser with GitHub Flavored Markdown support

## Adding New Shortcuts

To add a new npm script shortcut, edit `package.json`:

```json
{
  "scripts": {
    "pdf:yourfile": "node scripts/generate-pdf.js YOUR_FILE.md"
  }
}
```

Then run: `npm run pdf:yourfile`

## Use Cases

Perfect for:
- **Investor presentations** (roadmaps, pitch decks)
- **Documentation distribution** (technical specs, guides)
- **Reports and surveys** (asset pipeline, architecture)
- **Meeting materials** (agendas, notes)
- **Archival purposes** (preserving documentation versions)

## Notes

- PDFs are **not version controlled** (excluded by `.gitignore`)
- Generate fresh PDFs before important meetings/presentations
- Source Markdown files remain the source of truth
- Consider generating PDFs as part of release process
