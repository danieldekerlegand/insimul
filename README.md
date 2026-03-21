# Insimul

A procedural game world generation engine that combines social simulation, narrative AI, and logic programming to produce playable 3D worlds. The primary showcase is a language-learning RPG built with Babylon.js, but the system is designed to generate worlds across multiple genres and export to multiple game engines.

## Quick Start

```bash
npm install
npm run dev
```

This starts both the Express.js backend and the React frontend. Navigate to `http://localhost:5000` to access the world editor and game.

## Architecture

**Frontend**: React + TypeScript with Babylon.js for 3D rendering
**Backend**: Express.js (Node.js) with MongoDB
**AI**: Google Gemini API for content generation and NPC conversations
**Logic**: tau-prolog (primary, pure JS) with SWI-Prolog server fallback
**Narrative**: Tracery grammar system + Kismet narrative rules

### Source Engines

Insimul integrates three research engines located in `sources/`:

- **Talk of the Town** (`sources/talkofthetown/`) — Procedural town generation with 140-year historical simulation, genealogy, social dynamics, and 23 social simulation modules
- **Ensemble** (`sources/ensemble/`) — Social AI and volition system with 1,274 seed entries for NPC goal-formation and action selection
- **Kismet** (`sources/kismet/`) — Narrative rules language for dynamic story events and location-based role casting

### Key Directories

| Path | Description |
|------|-------------|
| `client/src/components/3DGame/` | Babylon.js game (40+ files): terrain, buildings, NPCs, quests, UI |
| `server/routes.ts` | API endpoints (346 routes) |
| `server/engines/` | Unified simulation engine + Prolog integration |
| `server/extensions/tott/` | 23 Talk of the Town social simulation modules |
| `server/services/game-export/` | Export pipelines for Babylon.js, Godot, Unity, Unreal |
| `shared/schema.ts` | Drizzle ORM type definitions |
| `server/db/mongo-storage.ts` | MongoDB storage layer (27+ collections) |
| `shared/prolog/` | Prolog predicate schema, sync, and converters |
| `shared/feature-modules/` | Composable genre module system |

## Core Features

### World Generation
- Procedural countries, states, settlements, and lots
- Terrain with heightmaps, water features, vegetation, and roads
- Procedural buildings with exteriors and multi-room interiors
- Public buildings (schools, city halls, libraries) and 30+ business types (cafes, bookstores, hardware stores, etc.)
- Outdoor furniture and market stalls in settlement exteriors

### Characters & NPCs
- Full genealogy and life event simulation
- Big Five personality model driving behavior
- Daily schedules with work, meals, socializing, and sleep
- NPCs confined to town boundaries with proper pathfinding
- Occupation-based work behaviors inside businesses
- Ambient life behaviors (chores, eating, socializing)
- Animal NPCs (cats, dogs, birds) for world ambiance
- NPC model diversity with procedural appearance variation

### Quest System
- Quest-driven minimap markers derived from objective data
- Dynamic waypoints pointing toward objective targets
- 15+ objective types: visit_location, collect_item, deliver_item, talk_to_npc, read_sign, defeat_enemies, escort_npc, gain_reputation, photography, and more
- Quest completability validation and fallback system for uncompletable objectives
- Quest-giving NPC indicators with accept/decline flow
- Quest completion rewards and turn-in flow
- Container system (chests, cupboards, barrels) with browsing UI

### Main Quest: The Missing Writer
- Multi-chapter investigation narrative about a disappeared famous writer
- Collectible texts (books, journals, letters, flyers, recipes) placed throughout the world
- Writer's associate NPCs who provide leads and context
- Clue board in the Journal tab tracking investigation progress
- Text collection drives chapter progression

### Texts & Library System
- Texts schema with categories: books, journals, letters, flyers, recipes
- Procedural text generation via Gemini API in the target language
- Texts section in the Content editor for managing and generating texts
- Library page with reading interface, hover-to-translate, and comprehension quizzes
- Reading progress and quiz completion persisted to the server

### Language Learning (PhD Showcase)
- Hover-to-translate for all target-language text in the game
- Vocabulary tracking from NPC conversations with server-side persistence
- Grammar tracking with structured feedback and pattern definitions
- French vocabulary corpus (2000+ common words) and grammar patterns
- Spaced repetition review prompts and vocabulary practice mini-games
- Language Progress page displaying vocabulary and grammar data
- NPC conversation prompts incorporating vocabulary review and grammar focus
- CEFR-based proficiency tiers driving adaptive difficulty

### Photography System
- First-person photo mode for capturing items, buildings, NPCs, and natural features
- Photo book with noun labeling in the target language
- Photography quest objectives integrated with the quest system

### Economy & Mercantile
- Player gold with item prices
- Mercantile system connected to quest objectives
- Spending sinks and economic pressure so gold matters
- XP and money rewards for quest completions
- XP gains wired to skill tree progression and level-up rewards

### Day/Night & Weather
- Visual day/night cycle with lighting and sky color transitions
- Time-of-day HUD indicator and time controls
- Weather system with rain, clouds, and atmospheric effects
- Ambient sound system with environmental audio tied to location and time

### Player Vehicle
- Bicycle or horse for faster travel across the world

### Asset Management
- Asset scaling management in the Admin Panel with NPC reference preview
- Stored scales applied throughout the rendering pipeline
- Polyhaven and Sketchfab integration for sourcing 3D assets
- 500+ base items across furniture, kitchen, food, tools, stationery, garden, and decorative categories

### Editor & Admin
- Character detail view showing workplace, residence, and business ownership
- Business detail view showing owner, employees, and inventory
- Residence detail view showing residents and household information
- Texts section in Content editor for managing procedurally generated reading content
- Prolog knowledge base browser with predicate documentation

### Export
- Engine-agnostic intermediate representation (IR)
- Export pipelines for Babylon.js, Godot, Unity, and Unreal

## Genre System

The platform uses a composable feature module architecture. Each module is genre-agnostic and can be enabled/disabled per world:

- Knowledge Acquisition, Proficiency Tracking, Pattern Recognition
- Performance Scoring, Voice Interaction, Gamification
- Skill Tree, Adaptive Difficulty, World Lore
- Conversation Analytics, Assessment, NPC Exams, Onboarding

Genre bundles (language-learning, RPG, survival, strategy) activate appropriate module subsets.

## Background

Insimul is designed to procedurally generate game worlds across genres (High Fantasy, Sci-Fi, Cyberpunk, Post-Apocalyptic, Medieval, Victorian, Steampunk, Horror, and more) and game types (RPG, action, platformer, strategy, survival, simulation, language-learning, adventure). It supports multiple perspective templates (3D, 2D top-down, isometric, 2D side-scroller, VR).

The primary showcase game is a French language-learning RPG for a PhD dissertation on endangered language preservation. A secondary showcase (Alderforest) demonstrates horror/mystery/puzzle generation from the same underlying system.
