# PRD: Language Collection Unification

## Introduction

The game's target language configuration is currently fragmented across multiple locations: `worlds.targetLanguage` (a deprecated string), the `languages` collection (with `isLearningTarget` flag), the `ui_translation_files` collection (LLM-generated UI translations), and the `word_translation_cache` collection (hover-translate word lookup cache). There's also a fallback mechanism between `worlds.targetLanguage` and `languages.isLearningTarget` that causes confusion and log warnings.

This refactor consolidates all language-related data into the `languages` collection entry, making it the single source of truth for the world's target language configuration, cached translations, and word lookups.

## Goals

- Eliminate `ui_translation_files` and `word_translation_cache` as separate collections
- Move UI translations and word cache into the `languages` document as embedded fields
- Make `languages.isLearningTarget` the authoritative source — remove fallback to `worlds.targetLanguage`
- Ensure `worlds.targetLanguage` is always derived from/synced with the languages entry
- Reduce the number of collections and simplify queries

## User Stories

### US-001: Add uiTranslations field to WorldLanguage schema
**Description:** As a developer, I need the languages collection to store UI translation data so we can remove the separate ui_translation_files collection.

**Acceptance Criteria:**
- [ ] Add `uiTranslations` field (Mixed/JSON type, default null) to WorldLanguageSchema in mongo-storage.ts
- [ ] Add `uiTranslationsVersion` (Number, default 0) and `uiTranslationsGeneratedAt` (Date, default null) fields
- [ ] Update `getUITranslationFile(worldId, languageCode)` to read from the language document's `uiTranslations` field instead of the UITranslationFileModel
- [ ] Update `upsertUITranslationFile(worldId, languageCode, targetLanguage, translations)` to write to the language document instead
- [ ] Typecheck passes

### US-002: Add wordTranslationCache field to WorldLanguage schema
**Description:** As a developer, I need the languages collection to store word translation lookups so we can remove the separate word_translation_cache collection.

**Acceptance Criteria:**
- [ ] Add `wordTranslationCache` field (Mixed/JSON type, default {}) to WorldLanguageSchema — stored as Record<sourceWord, { translation, partOfSpeech, context, lookupCount, createdAt }>
- [ ] Update `getCachedTranslation(worldId, sourceWord, targetLanguage)` to read from the language document's cache
- [ ] Update `setCachedTranslation(...)` to write to the language document's cache
- [ ] Update `bulkSetCachedTranslations(...)` similarly
- [ ] Update `getTranslationCacheStats(worldId)` to read from the embedded cache
- [ ] Typecheck passes

### US-003: Migrate existing data from separate collections
**Description:** As a developer, I need to migrate existing ui_translation_files and word_translation_cache data into the languages collection.

**Acceptance Criteria:**
- [ ] Write a migration script that reads all `ui_translation_files` documents and embeds their `translations` into the corresponding `languages` document (matched by worldId + languageCode/realCode)
- [ ] Write a migration script that reads all `word_translation_cache` documents and embeds them into the corresponding `languages` document (matched by worldId + targetLanguage)
- [ ] After migration, verify data integrity (counts match, no data lost)
- [ ] Migration is idempotent (safe to run multiple times)
- [ ] Typecheck passes

### US-004: Remove targetLanguage fallback — make isLearningTarget authoritative
**Description:** As a developer, I want to remove the fallback between worlds.targetLanguage and languages.isLearningTarget so there's one source of truth.

**Acceptance Criteria:**
- [ ] In context-manager.ts `buildContext()`, remove the fallback logic that checks `world.targetLanguage` when `isLearningTarget` is not found
- [ ] Remove the warning log `[Context] No isLearningTarget in languages, falling back to world.targetLanguage`
- [ ] Ensure world creation always creates a languages entry with `isLearningTarget: true` when `targetLanguage` is set
- [ ] `getTargetLanguage()` in OnboardingLauncher.ts reads from the languages collection, not `worldData.targetLanguage`
- [ ] All other places that read `world.targetLanguage` are updated to read from the languages entry instead (or at minimum, the languages entry is ensured to exist)
- [ ] Typecheck passes

### US-005: Remove deprecated collections
**Description:** As a developer, I want to remove the UITranslationFileModel and WordTranslationCacheModel since data now lives in the languages collection.

**Acceptance Criteria:**
- [ ] Remove UITranslationFileSchema and UITranslationFileModel from mongo-storage.ts
- [ ] Remove WordTranslationCacheSchema and WordTranslationCacheModel from mongo-storage.ts
- [ ] Remove any direct references to these models in routes or services
- [ ] The old collections can remain in MongoDB for historical data but are no longer queried
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The `languages` document with `isLearningTarget: true` is the single source of truth for target language configuration
- FR-2: UI translations stored as `languages.uiTranslations` (JSON object, same shape as locale files)
- FR-3: Word translation cache stored as `languages.wordTranslationCache` (Record<word, {translation, partOfSpeech, lookupCount}>)
- FR-4: All translation read/write operations go through the languages document
- FR-5: World creation ensures a languages entry exists with `isLearningTarget: true` when targetLanguage is set
- FR-6: No fallback logic between `worlds.targetLanguage` and `languages.isLearningTarget`

## Non-Goals

- Not changing the worldSnapshot structure in save files (it can still include targetLanguage for backward compat)
- Not removing the `worlds.targetLanguage` column from the schema (kept for backward compat, but always synced from languages)
- Not changing how language-learning detection works in the game client (it reads from the languages entry already)
- Not changing the translation generation logic (LLM calls remain the same, just storage location changes)

## Technical Considerations

- **Document size:** The word translation cache could grow large (thousands of entries). MongoDB documents have a 16MB limit. A cache of 10,000 words at ~200 bytes each is ~2MB — well within limits. Consider adding a cap (e.g., 20,000 entries) with LRU eviction.
- **Migration:** Run migration before deploying code changes. The new code should check both locations during a transition period (read from languages first, fall back to old collections).
- **Indexes:** The old collections had indexes on `(worldId, sourceWord, targetLanguage)`. The embedded cache uses the word as a key in a Record, so lookups are O(1) within the document.

## Success Metrics

- Zero queries to `ui_translation_files` and `word_translation_cache` collections after migration
- All translation lookups and UI translation loads read from the languages document
- No `[Context] No isLearningTarget` warnings in server logs
- No regression in translation lookup performance

## Open Questions

- Should we cap the word translation cache size per language entry? If so, what's the eviction strategy?
- Should `worlds.targetLanguage` be auto-synced from the languages entry on every world load, or only on creation?
