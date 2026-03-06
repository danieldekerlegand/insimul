# Quick PDF Generation

Convert any Markdown document to a professional PDF:

## Installation
```bash
npm install
```

## Usage

### Pre-configured Documents
```bash
npm run pdf:roadmap    # STARTUP_ROADMAP.pdf
npm run pdf:vr         # VR_SUPPORT_ROADMAP.pdf
npm run pdf:assets     # ASSET_PIPELINE_SURVEY.pdf
```

### Custom Documents
```bash
npm run pdf <filename.md>
```

**Examples:**
```bash
npm run pdf docs/architecture.md
npm run pdf notes/meeting-2026-02-24.md
```

## Features
✅ Professional styling with tables, headings, code blocks  
✅ Automatic hyperlinks  
✅ Letter-size pages with proper margins  
✅ Generated in same directory as source file  
✅ Auto-excluded from git  

See [docs/PDF_GENERATION.md](docs/PDF_GENERATION.md) for full documentation.
