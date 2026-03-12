class_name InsimulTypes
extends RefCounted
## Shared type definitions for the Insimul conversation service.
## Mirrors the SSE event protocol used by all Insimul SDKs.


# ── Enums ────────────────────────────────────────────────────────────────────

enum AudioEncoding {
	UNSPECIFIED = 0,
	PCM = 1,
	OPUS = 2,
	MP3 = 3,
}

enum ConversationState {
	UNSPECIFIED = 0,
	STARTED = 1,
	ACTIVE = 2,
	PAUSED = 3,
	ENDED = 4,
}


# ── Data Classes ─────────────────────────────────────────────────────────────

class TextChunk:
	var text: String = ""
	var is_final: bool = false
	var language_code: String = ""
	var session_id: String = ""


class AudioChunk:
	var data: PackedByteArray = PackedByteArray()
	var encoding: int = AudioEncoding.UNSPECIFIED
	var sample_rate: int = 16000
	var duration_ms: int = 0


class Viseme:
	var phoneme: String = ""
	var weight: float = 0.0
	var duration_ms: int = 0


class FacialData:
	var visemes: Array[Viseme] = []


class ActionTrigger:
	var action_type: String = ""
	var target_id: String = ""
	var parameters: Dictionary = {}


class HealthCheckResponse:
	var healthy: bool = false
	var version: String = ""
	var services: Dictionary = {}
