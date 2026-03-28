# Main Quest Walkthrough: "The Missing Writer"

## Overview

The main quest follows a reporter investigating the disappearance of a celebrated writer. It spans 6 chapters, CEFR-gated from A1 to B2, integrating language learning objectives with a mystery narrative.

## Prerequisites

- A world with generated settlements, characters, and buildings
- The narrative system generates writer identity and clues from world data
- Hidden locations are automatically spawned by `ExplorationDiscoverySystem`

## Flow

### Game Start
1. Player creates/selects a playthrough
2. `createInitialMainQuestState()` sets Chapter 1 as active
3. The game intro cutscene plays via `NarrativeCutscenePanel` (chapter_intro for Ch1)

### Chapter 1: Assignment Abroad (A1)
**Objectives:**
- Complete 2 vocabulary quests ("First Words")
- Complete 3 conversation quests ("Ask Around")
- Complete 2 collect_text quests ("Read the Signs")

**Flow:**
1. Player completes quests (any quest of the matching type counts)
2. Each completion triggers `POST /api/worlds/:worldId/main-quest/:playerId/record-completion`
3. Server records objective progress, generates case notes
4. When all objectives complete: chapter_outro cutscene, Chapter 2 activates

### Chapter 2: Following the Trail (A1)
**Objectives:** Vocabulary (4), Conversation (4), Grammar (2), Collect Text (2)
- Explore key locations (cafe, bookshop, park)
- Interview locals, find the writer's first book
- The bookseller reveals "the last book made people nervous"

### Chapter 3: The Inner Circle (A2)
**Objectives:** Conversation (7), Vocabulary (6), Collect Text (3)
- Build rapport with the 5 main quest NPCs (Editor, Neighbor, Patron, Scholar, Confidant)
- Each NPC is gated by their `activeChapterIds`
- Patron reveals the writer was documenting secrets of old families

### Chapter 4: Hidden Messages (A2)
**Objectives:** Vocabulary (3), Conversation (6), Grammar (3), Collect Text (3)
- Follow clues to hidden locations (abandoned cabin, cave entrance, secret garden)
- `ExplorationDiscoverySystem` spawns investigation points at writer secret spots
- Investigating clue-type points auto-creates physical evidence clues in ClueStore

### Chapter 5: The Truth Emerges (B1)
**Objectives:** Conversation (6), Grammar (4), Vocabulary (3), Collect Text (4)
- Scholarly debates, confront the patron
- The confidant reveals the writer went into hiding voluntarily

### Chapter 6: The Final Chapter (B2)
**Objectives:** Conversation (5), Vocabulary (6), Collect Text (5)
- Find and meet the writer
- Final conversation entirely in target language
- Write and file report

### Game Completion
1. All Chapter 6 objectives complete
2. Chapter_outro cutscene plays (final revelation)
3. `PlaythroughCompletionPanel` shows summary stats
4. Departure assessment triggered if available

## Key Systems

### Narrative Generation
- `shared/narrative/narrative-generator.ts` produces world-specific narrative from templates
- Writer name is deterministic per worldId + targetLanguage
- Narrative stored as world truth (category: `world_narrative`)
- Editable via Narrative tab in world editor

### Cutscene System
- `NarrativeCutscenePanel` renders cinematic text overlays
- `NarrativeBeatDispatcher` queues chapter_intro / chapter_outro beats
- Cutscenes are skippable but not auto-skipped
- Delivered beats tracked in `MainQuestState.narrativeBeatsDelivered`

### Clue System
- `ClueStore` tracks 4 categories: witness_testimony, written_evidence, physical_evidence, photo_evidence
- Auto-creates clues from: NPC conversations (investigation keywords), text collection, photo, location investigation
- Investigation board in GameMenuSystem merges server board data with real-time ClueStore counts

### Case Notes
- Auto-generated server-side when quest objectives progress
- Categories: clue, npc_interview, text_found, location_visited, chapter_event
- Displayed in Journal tab of GameMenuSystem

### CEFR Gating
- Chapters require minimum CEFR levels (A1, A1, A2, A2, B1, B2)
- `tryUnlockNextChapter()` called when CEFR level changes
- Player can be blocked between chapters until reaching required level

## WorldIR Export
- `mainQuestLocations` field contains all hidden location definitions
- `narrative` field contains the full narrative outline
- Both available to standalone exports (Godot, Unity, Unreal)

## API Endpoints
- `GET /api/worlds/:worldId/main-quest/:playerId/journal` - Journal data
- `POST /api/worlds/:worldId/main-quest/:playerId/record-completion` - Record quest completion
- `POST /api/worlds/:worldId/main-quest/:playerId/try-unlock` - Try CEFR unlock
- `GET /api/worlds/:worldId/narrative` - Get narrative data
- `PUT /api/worlds/:worldId/narrative` - Save narrative data
- `POST /api/worlds/:worldId/narrative/regenerate` - Regenerate narrative
