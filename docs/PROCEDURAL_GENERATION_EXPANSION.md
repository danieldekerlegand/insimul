# Procedural Generation System Expansion

## Overview

Expanded the procedural generation capabilities from society-only to include **Rules, Actions, and Quests**. Users can now generate all major content types using AI-powered prompts and configurable parameters.

## What Was Added

### 1. Updated Navigation (ModernNavbar.tsx)

The "Generate" dropdown now includes four types of generation:
- **Generate Societies** - Procedural world/geography generation (existing)
- **Generate Rules** ✨ NEW - AI-powered rule generation
- **Generate Actions** ✨ NEW - Action system generation
- **Generate Quests** ✨ NEW - Quest chain generation

### 2. New Generation Tabs

#### GenerateRulesTab.tsx
**AI-powered rule generation with:**
- Text prompt input describing desired rules
- System type selection (Insimul, Ensemble, Kismet, Talk of the Town)
- Rule type selection (Trigger, Volition, Genealogy, Trait)
- Bulk generation (1-20 rules at once)
- Priority settings (1-10)
- Tag management
- Example prompts for inspiration

**Example Use Cases:**
- "Create rules for noble succession where the eldest child inherits"
- "Generate social interaction rules for characters meeting at locations"
- "Create genealogy rules for tracking family relationships"

#### GenerateActionsTab.tsx
**Action system generation with:**
- Text prompt describing action domain
- Category selection (Social, Work, Leisure, Combat, Trade, Travel, Magic, Crafting)
- Bulk generation (1-20 actions)
- Duration settings (0.5-10 time units)
- Difficulty settings (0-1)
- Automatic verb conjugation
- Example prompts

**Example Use Cases:**
- "Create social actions for making friends and forming alliances"
- "Generate work actions for blacksmith, merchant, farmer professions"
- "Create magic actions for casting spells and rituals"

#### GenerateQuestsTab.tsx
**Quest generation with:**
- Text prompt describing quest narrative
- Quest type selection (Main Story, Side Quest, Daily, Faction, Personal, Event)
- Bulk generation (1-10 quests)
- Steps/objectives per quest (1-10)
- Difficulty settings (1-10)
- Automatic reward calculation
- Repeatable quest settings
- Example prompts

**Example Use Cases:**
- "Create a quest to investigate mysterious disappearances"
- "Generate quest chain about rising through merchant guild ranks"
- "Create daily quests for gathering resources"

### 3. Updated Routes

Modified `pages/modern.tsx` to handle new tab IDs:
- `generate-society` → ProceduralGenerateTab
- `generate-rules` → GenerateRulesTab
- `generate-actions` → GenerateActionsTab
- `generate-quests` → GenerateQuestsTab

## Features

### Common Across All Generators

1. **AI-Powered Prompts**: Natural language descriptions converted to structured content
2. **Bulk Generation**: Create multiple related items in one operation
3. **Example Prompts**: Quick-start templates for common scenarios
4. **Parameter Configuration**: Fine-tune output with sliders and settings
5. **Immediate Feedback**: Toast notifications with success/error details

### Integration with Existing Systems

- **Rules**: Generated rules are immediately available in HierarchicalRulesTab
- **Actions**: Integrated with HierarchicalActionsTab and action execution system
- **Quests**: Available in QuestsTab with full quest management
- **AI Service**: Uses existing `/api/generate-rule` endpoint for rule generation

## Technical Implementation

### Rule Generation
Uses the fixed AI generation system (`server/gemini-ai.ts`) that now correctly generates rules in the target format (Ensemble JSON, Kismet Prolog, Talk of the Town JSON, or Insimul).

### Action Generation
Currently creates placeholder actions with:
- Configurable category, duration, difficulty
- Default verb conjugations
- Extensible for future AI enhancement

### Quest Generation
Creates structured quests with:
- Multiple objectives/steps
- Reward calculation based on difficulty
- Prerequisite system
- Repeatable quest mechanics

## Usage Guide

### Generating Rules

1. Navigate to **Generate → Generate Rules**
2. Enter a text description of desired rules
3. Select system type (Insimul, Ensemble, etc.)
4. Choose rule type (Trigger, Volition, etc.)
5. Enable bulk generation and set count if desired
6. Set priority and tags
7. Click "Generate with AI"

### Generating Actions

1. Navigate to **Generate → Generate Actions**
2. Describe the actions you want
3. Select category (Social, Combat, etc.)
4. Configure duration and difficulty
5. Enable bulk generation if creating multiple
6. Click "Generate"

### Generating Quests

1. Navigate to **Generate → Generate Quests**
2. Describe the quest narrative
3. Select quest type (Main, Side, Daily, etc.)
4. Set number of steps per quest
5. Configure difficulty level
6. Enable bulk for quest chains
7. Click "Generate"

## Files Modified

### New Files
- `client/src/components/GenerateRulesTab.tsx` - Rule generation UI
- `client/src/components/GenerateActionsTab.tsx` - Action generation UI
- `client/src/components/GenerateQuestsTab.tsx` - Quest generation UI

### Modified Files
- `client/src/components/ModernNavbar.tsx` - Updated generate dropdown
- `client/src/pages/modern.tsx` - Added new tab routing

### Related Files
- `server/gemini-ai.ts` - AI rule generation (already fixed)
- `client/src/lib/unified-syntax.ts` - Rule parsing/compilation
- `client/src/lib/rule-exporter.ts` - Rule format export

## Benefits

1. **Faster Content Creation**: Generate dozens of rules/actions/quests in seconds
2. **Consistency**: AI ensures coherent formatting and structure
3. **Exploration**: Example prompts help users discover possibilities
4. **Flexibility**: All parameters are configurable
5. **Integration**: Generated content immediately usable in simulations

## Future Enhancements

### Potential Improvements

1. **Enhanced AI Action Generation**: Use Gemini AI to generate more sophisticated action definitions
2. **Quest Narrative Generation**: Use AI to create quest dialogues and storylines
3. **Cross-System Dependencies**: Generate rules, actions, and quests that reference each other
4. **Template System**: Save and reuse generation configurations
5. **Preview Mode**: See generated content before committing
6. **Batch Export**: Export all generated content as a bundle
7. **Version Control**: Track generations and rollback if needed

### API Endpoints to Add

```typescript
// For enhanced action generation
POST /api/generate-actions
{
  prompt: string,
  category: string,
  count: number,
  useAI: boolean
}

// For quest narrative generation
POST /api/generate-quests
{
  prompt: string,
  questType: string,
  numObjectives: number,
  useAI: boolean
}
```

## Testing

To test the new generation features:

1. **Start the application** and select a world
2. **Try Rules Generation**:
   - Click Generate → Generate Rules
   - Use an example prompt or write your own
   - Select Ensemble format and bulk generation
   - Verify rules appear in Rules tab

3. **Try Actions Generation**:
   - Click Generate → Generate Actions
   - Select "Social" category
   - Generate 5 actions
   - Verify in Actions tab

4. **Try Quests Generation**:
   - Click Generate → Generate Quests
   - Select "Main Story" type
   - Set 3 objectives per quest
   - Generate a quest chain
   - Verify in Quests tab

## Notes

- **AI Rule Generation** uses the fixed Gemini AI prompts with correct format examples
- **Actions and Quests** currently use structured generation; AI enhancement can be added later
- **All generated content** is immediately saved to the database
- **Bulk generation** is recommended for creating diverse, related content sets
- **Tags and categories** help organize generated content for later use

## Conclusion

The procedural generation system now supports comprehensive content creation across all major Insimul systems. Users can rapidly prototype worlds with rules, actions, and quests using natural language prompts and intuitive parameter controls.
