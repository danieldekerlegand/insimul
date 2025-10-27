# Insimul - Unified Narrative Simulation Platform

## Overview

Insimul is a comprehensive social simulation platform that combines three powerful narrative AI systems (Ensemble, Kismet, and Talk of the Town) into an insimul editor and execution environment. The platform features:

- **Insimul Rule Syntax**: A new DSL that combines Ensemble's predicate logic, Kismet's Prolog-style patterns, and Talk of the Town's procedural generation
- **Multi-System Execution**: Rules can be written in native formats (Ensemble JSON, Kismet Prolog, TotT Python) or the new insimul syntax
- **Rich Character Generation**: Full genealogy support with personality, physical traits, social relationships, and multi-generational family trees
- **World Building**: Procedural world generation with locations, social structures, historical events, and cultural values
- **Tracery Integration**: Built-in procedural text generation for dynamic narratives
- **Professional IDE**: Multi-tab editor with syntax highlighting, validation, and real-time compilation
- **AI Character Chat**: Language-aware character conversations with quest assignment system powered by Google Gemini

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Google Gemini API key (for character chat feature)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd insimul
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   MONGO_URL=mongodb://localhost:27017/insimul
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```
   
   **Get a Gemini API key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to create a free API key.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to `http://localhost:5000` in your browser.

### Features Overview

- **Rules Tab**: Write and compile social simulation rules in multiple formats
- **Characters Tab**: Create and manage characters with language skills and personalities
- **Actions Tab**: Define available actions and interactions
- **Truth Tab**: Manage temporal facts and events on a timeline
- **Quests Tab**: View language learning quests assigned by characters
- **Simulations Tab**: Run and analyze simulation results

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (September 08, 2025)

### World-Centric Architecture Migration
- **Complete Restructuring**: Migrated from Project-centric to World-centric architecture, making Worlds the primary containers for all content
- **Database Schema Refactoring**: Updated all tables to reference `worldId` instead of `projectId`, removing the Projects table entirely
- **API Endpoints Restructuring**: Changed all API routes to use `/api/worlds/:worldId/*` pattern with legacy support for existing `/api/projects/*` endpoints  
- **Frontend Migration**: Updated editor UI to show World selection first, then display world contents (rules, characters, simulations)
- **Unified Data Model**: Characters, Rules, and Simulations now belong directly to Worlds, creating a cleaner conceptual hierarchy

### Previous Updates (August 19, 2025)
- **Insimul Schema Design**: Completely redesigned database schema to support all three systems with enhanced character attributes, world generation, and social predicate tracking
- **Insimul Rule Syntax**: Created new DSL combining Ensemble predicate logic, Kismet traits/patterns, and TotT genealogy rules
- **Multi-System Engine**: Built insimul simulation engine that can execute rules from all three systems simultaneously
- **Rich Sample Data**: Added comprehensive medieval kingdom project with noble families, succession rules, and chosen one narratives

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Custom React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Custom textarea-based editor with syntax highlighting support

### Backend Architecture
- **Runtime**: Node.js with Express.js RESTful API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas for runtime type validation
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL via @neondatabase/serverless
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions
- **Data Models**: Projects, rule files, social rules, characters, worlds, and simulations

### Authentication and Authorization
- Session-based authentication with PostgreSQL storage
- No explicit authentication system currently implemented (development setup)

### Multi-Engine Integration
- **Ensemble**: JavaScript-based predicate logic system for social rules
- **Kismet**: Prolog-style social rules with Tracery grammar integration  
- **Talk of the Town**: Python-based procedural generation system
- **Unified Syntax**: Custom DSL that compiles to multiple target systems

### Editor Features
- Multi-tab editor with file tree navigation
- Live validation and error reporting
- Console output and debugging tools
- Real-time preview of generated content
- System-specific syntax highlighting and validation

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database adapter
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation
- **express**: Web application framework for API routes
- **connect-pg-simple**: PostgreSQL session store

### Frontend UI Dependencies
- **@radix-ui/***: Comprehensive set of low-level UI primitives
- **@tanstack/react-query**: Data fetching and caching library
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx** and **tailwind-merge**: CSS class manipulation utilities
- **date-fns**: Date manipulation and formatting library

### Development and Build Tools
- **vite**: Frontend build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **tsx**: TypeScript execution for Node.js development
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools

### External Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment and deployment platform
- **Google Fonts**: Web font delivery (Inter, JetBrains Mono, etc.)