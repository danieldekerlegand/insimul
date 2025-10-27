# Contextual Name Generation

Insimul now uses LLM-powered contextual name generation to create settlements and characters that fit the world's theme and culture.

## Features

### Settlement Name Generation
When generating new settlements, the system considers:
- **World Name & Description**: The overall theme and setting
- **Country Name & Description**: The nation's culture and style
- **Country Government**: The political system (monarchy, republic, etc.)
- **Country Economy**: The economic system (feudal, mercantile, etc.)
- **State/Province Name**: Regional context
- **Settlement Type**: City, town, or village
- **Terrain**: Geographic features (plains, mountains, coast, etc.)

**Example**: In the "Medieval Kingdom" world with the "Kingdom of Valoria" (feudal monarchy), instead of generating "City 1761309465928", the system generates contextual names like "Goldspire", "Ironhaven", or "Thornbridge".

### Character Name Generation
When generating characters, the system considers:
- **World & Country Context**: Cultural naming conventions
- **Settlement**: Local naming patterns
- **Gender**: Appropriate gendered names
- **Generation**: Reflects time period and family lineage
- **Founder Status**: Founding families may have more prestigious names

**Example**: Characters in the Kingdom of Valoria get names like "Aldric Stormborn" or "Elara Thornwell" instead of generic names like "John Smith".

## Configuration

### Using Google Gemini API (Recommended)

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Add to your `.env` file:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
# Or use GEMINI_FREE_API_KEY=your_gemini_api_key_here
```

3. Restart the server

The system will automatically:
- ✅ Use LLM for contextual name generation
- ✅ Fall back to random names if API fails
- ✅ Cache contexts to minimize API calls

### Without API Key (Fallback)

If no API key is configured, the system falls back to:
- Random settlement names from preset patterns
- Generic character names from preset pools

⚠️ **Note**: Fallback names are less contextual but still functional.

## Technical Details

### Architecture

**Service**: `/server/services/name-generator.ts`
- Singleton service initialized at startup
- Uses Gemini 1.5 Flash model (fast and cost-effective)
- Intelligent prompt construction with world context
- Automatic fallback on errors

**Integration Points**:
1. **Settlement Generation** (`/server/routes.ts` line ~1049)
   - Fetches world/country/state context
   - Generates contextual name before creating settlement

2. **Character Generation** (`/server/generators/genealogy-generator.ts`)
   - Loads context once at generation start
   - Generates names with generation and founder context
   - Async name generation throughout family tree creation

### Performance

- **Caching**: World/country/settlement context loaded once per generation batch
- **Batch Requests**: Can generate multiple names in one API call
- **Fast Model**: Gemini 1.5 Flash averages 0.5-1s per request
- **Graceful Fallback**: Never blocks generation, falls back immediately on errors

### Cost Considerations

Google Gemini API Free Tier (as of 2024):
- **60 requests per minute**
- **1500 requests per day**

Typical usage per world generation:
- 1-5 API calls for settlements
- 10-50 API calls for character names (depending on family size)

**Recommendation**: Free tier is sufficient for most development and testing.

## Customization

### Adjusting Prompts

Edit `/server/services/name-generator.ts`:
- `buildSettlementPrompt()` - Customize settlement name generation
- `buildCharacterPrompt()` - Customize character name generation

### Using Different Models

Change the model in the NameGenerator constructor:
```typescript
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' // More capable but slower
});
```

Available models:
- `gemini-1.5-flash` - Fast, cost-effective (recommended)
- `gemini-1.5-pro` - More capable, slower, more expensive
- `gemini-1.0-pro` - Legacy model

### Using Other LLM Providers

The service can be adapted to use:
- **OpenAI GPT** - Replace with OpenAI SDK
- **Anthropic Claude** - Replace with Anthropic SDK
- **Local LLMs** - Use Ollama or llama.cpp

Edit the constructor and model initialization in `name-generator.ts`.

## Troubleshooting

### Names aren't contextual
- ✓ Check that `GEMINI_API_KEY` is set in `.env`
- ✓ Restart the server after adding the key
- ✓ Check console for "✅ LLM Name Generator initialized"

### Getting "fallback" names
- ✓ Check API key is valid
- ✓ Check internet connection
- ✓ Check Gemini API quotas/limits
- ✓ Look for error messages in server console

### API errors or rate limits
- ✓ Wait a few minutes for rate limits to reset
- ✓ Reduce the number of families/generations being generated
- ✓ Check [Google AI Studio quota page](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)

## Examples

### Settlement Names by Context

**Medieval Fantasy**:
- Cities: "Silverpeak", "Stormhaven", "Dragonspire"
- Towns: "Millbrook", "Thornfield", "Oakvale"
- Villages: "Whisperwind", "Mosswood", "Brookshire"

**Sci-Fi Setting**:
- Cities: "Neo Tokyo", "Helios Prime", "Nexus Station"
- Towns: "Colony Seven", "Outpost Zeta", "Haven's End"
- Villages: "Settlement 42", "Terraform Base", "Pioneer's Rest"

### Character Names by Culture

**Medieval Kingdom (Valoria)**:
- Male: "Aldric Stormborn", "Cedric Ironforge", "Theron Blackwood"
- Female: "Elara Moonwhisper", "Isadora Silverleaf", "Rowena Thornheart"

**Eastern Empire**:
- Male: "Kenji Yamamoto", "Hiroshi Tanaka", "Ryuu Watanabe"
- Female: "Akiko Sato", "Yuki Nakamura", "Mei Kobayashi"

## Future Enhancements

Potential improvements:
- [ ] Name variation by time period
- [ ] Cultural/ethnic name pools per region
- [ ] Surname inheritance patterns
- [ ] Noble vs. common naming conventions
- [ ] Historical figure name generation
- [ ] Multi-language name support
