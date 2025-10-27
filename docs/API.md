# Convai API Endpoints Specification

This document describes the Convai API endpoints used in this plugin, including their purpose, inputs, outputs, and relevant HTTP codes.

---

## Authentication
Most endpoints require an API key in the header:
- `CONVAI-API-KEY: <your_api_key>`

Some may also use:
- `API-AUTH-TOKEN: <auth_token>`

All requests use `application/json` content type unless otherwise specified.

---

## Endpoints

### 1. `POST /character/getResponse`
- **Purpose:** Get a chatbot response for a given query (text or audio).
- **Inputs:**
  - `userQuery` (string, optional): The user's text query.
  - `voiceResponse` (bool): Whether to return a voice response.
  - `charID` (string): Character ID.
  - `sessionID` (string, optional): Session identifier.
  - `classification` (bool, optional): Enable classification.
  - `classLabels` (array, optional): Classification labels.
  - For audio: binary payload of audio data.
- **Outputs:**
  - JSON with chatbot response, optionally audio data.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request
  - 401: Unauthorized
  - 500: Server error

---

### 2. `POST /character/create`
- **Purpose:** Create a new Convai character.
- **Inputs:**
  - `charName` (string): Name of the character.
  - `backstory` (string): Character backstory.
  - `voiceType` (string): Voice type.
- **Outputs:**
  - JSON: `{ "charID": "<id>" }` on success.
- **HTTP Codes:**
  - 200: Success
  - 400: Validation error
  - 401: Unauthorized

---

### 3. `POST /character/update`
- **Purpose:** Update an existing character's details.
- **Inputs:**
  - `charID` (string): Character ID.
  - `voiceType` (string, optional): New voice type.
  - `backstory` (string, optional): New backstory.
  - `charName` (string, optional): New name.
  - `languageCode` (string, optional): Language code.
- **Outputs:**
  - JSON: `{ "STATUS": "SUCCESS" }` on success.
- **HTTP Codes:**
  - 200: Success
  - 400: Validation error
  - 401: Unauthorized

---

### 4. `POST /character/get`
- **Purpose:** Get details for a specific character.
- **Inputs:**
  - `charID` (string): Character ID.
- **Outputs:**
  - JSON with character details.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request
  - 401: Unauthorized

---

### 5. `POST /character/list`
- **Purpose:** List all characters for the account.
- **Inputs:**
  - None (API key required).
- **Outputs:**
  - JSON array of character objects.
- **HTTP Codes:**
  - 200: Success
  - 401: Unauthorized

---

### 6. `POST /character/getActions`
- **Purpose:** Get available actions for a character based on context and query.
- **Inputs:**
  - `textQuery` (string): Query text.
  - `context` (object): Action context.
- **Outputs:**
  - JSON with available actions.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request
  - 401: Unauthorized

---

### 7. `POST /character/getActionResponse`
- **Purpose:** Get action response for a character (text or audio input).
- **Inputs:**
  - `textQuery` (string, optional): Query text.
  - `context` (object): Action context.
  - `voiceResponse` (bool): Whether to return a voice response.
  - `charID` (string): Character ID.
  - `sessionID` (string, optional): Session identifier.
  - For audio: binary payload of audio data.
- **Outputs:**
  - JSON with action response.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request
  - 401: Unauthorized

---

### 8. `POST /character/narrative/list-sections`
- **Purpose:** List narrative sections for a character.
- **Inputs:**
  - `character_id` (string): Character ID.
- **Outputs:**
  - JSON array of narrative sections.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request
  - 401: Unauthorized

---

### 9. `POST /character/narrative/list-triggers`
- **Purpose:** List narrative triggers for a character.
- **Inputs:**
  - `character_id` (string): Character ID.
- **Outputs:**
  - JSON array of narrative triggers.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request
  - 401: Unauthorized

---

### 10. `POST /tts`
- **Purpose:** Convert text to speech.
- **Inputs:**
  - `transcript` (string): Text to convert.
  - `voice` (string): Voice type.
- **Outputs:**
  - Binary audio data or JSON with audio URL.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request

---

### 11. `GET /tts/get_available_voices`
- **Purpose:** List available TTS voices.
- **Inputs:**
  - Optional filters: `voiceType`, `languageType`, `gender`.
- **Outputs:**
  - JSON array of available voices.
- **HTTP Codes:**
  - 200: Success
  - 401: Unauthorized

---

### 12. `POST /stt/`
- **Purpose:** Convert speech (audio) to text.
- **Inputs:**
  - Binary audio data.
- **Outputs:**
  - JSON with transcript.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request

---

### 13. `POST /xp/experiences/update`
- **Purpose:** Update experience data (details not shown in code).
- **Inputs:**
  - Experience update payload (see API docs).
- **Outputs:**
  - JSON with update status.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request

---

### 14. `POST /xp/sessions/detail`
- **Purpose:** Get details for an experience session.
- **Inputs:**
  - Session detail payload (see API docs).
- **Outputs:**
  - JSON with session details.
- **HTTP Codes:**
  - 200: Success
  - 400: Bad request

---

## Notes
- All endpoints require valid authentication headers.
- Error responses typically include a message and code.
- For binary audio, use multipart/form-data or raw binary as required by the endpoint.

---

For more details, refer to the official Convai API documentation or contact Convai support.
