extends Node
## InsimulClient — Autoloaded singleton managing the Insimul conversation service connection.
##
## Registered as autoload "InsimulClient" by the plugin. Provides a single
## point of access for starting/ending conversations and checking health.

# ── Signals ──────────────────────────────────────────────────────────────────

## Emitted for each streaming text token from the NPC.
signal text_received(chunk: InsimulTypes.TextChunk)
## Emitted for each TTS audio chunk.
signal audio_chunk_received(chunk: InsimulTypes.AudioChunk)
## Emitted when viseme/facial data arrives for lip sync.
signal facial_data_received(data: InsimulTypes.FacialData)
## Emitted when the server triggers a game action.
signal action_trigger_received(action: InsimulTypes.ActionTrigger)
## Emitted when a conversation starts.
signal conversation_started(session_id: String)
## Emitted when a conversation ends.
signal conversation_ended(session_id: String)
## Emitted on any error.
signal error_occurred(message: String)

# ── Export Variables (Inspector) ─────────────────────────────────────────────

## Base URL of the Insimul server (e.g. "https://api.insimul.com").
@export var server_url: String = "http://localhost:5000"
## API key for authentication (optional).
@export var api_key: String = ""
## World ID to scope all conversations.
@export var world_id: String = ""
## Default language code for conversations.
@export var language_code: String = "en"

# ── State ────────────────────────────────────────────────────────────────────

var _http_client: InsimulHttpClient = null
var _session_id: String = ""
var _state: int = InsimulTypes.ConversationState.UNSPECIFIED
var _session_counter: int = 0


func _ready() -> void:
	_http_client = InsimulHttpClient.new(server_url, api_key)
	_http_client.setup(self)
	_http_client.text_chunk_received.connect(_on_text_chunk)
	_http_client.audio_chunk_received.connect(_on_audio_chunk)
	_http_client.facial_data_received.connect(_on_facial_data)
	_http_client.action_trigger_received.connect(_on_action_trigger)
	_http_client.error_received.connect(_on_error)
	_http_client.stream_completed.connect(_on_stream_completed)


# ── Public API ───────────────────────────────────────────────────────────────

## Start a new conversation. Returns the session ID.
func start_conversation(character_id: String, session_id: String = "") -> String:
	if _session_id != "":
		await end_conversation()
	if session_id == "":
		_session_counter += 1
		session_id = "godot_%s_%d" % [_generate_id(), _session_counter]
	_session_id = session_id
	_state = InsimulTypes.ConversationState.STARTED
	conversation_started.emit(_session_id)
	return _session_id


## Send a text message to the NPC. Responses arrive via signals.
func send_text(text: String, character_id: String, override_language: String = "") -> void:
	if _session_id == "":
		error_occurred.emit("No active conversation. Call start_conversation() first.")
		return
	_state = InsimulTypes.ConversationState.ACTIVE
	var lang := override_language if override_language != "" else language_code
	_http_client.send_text(_session_id, character_id, world_id, text, lang)


## Send recorded audio to the NPC. Responses arrive via signals.
func send_audio(audio_data: PackedByteArray, character_id: String,
		override_language: String = "") -> void:
	if _session_id == "":
		error_occurred.emit("No active conversation. Call start_conversation() first.")
		return
	_state = InsimulTypes.ConversationState.ACTIVE
	var lang := override_language if override_language != "" else language_code
	_http_client.send_audio(_session_id, character_id, world_id, audio_data, lang)


## End the current conversation and clean up the session.
func end_conversation() -> void:
	if _session_id == "":
		return
	_http_client.end_session(_session_id)
	var old_session := _session_id
	_session_id = ""
	_state = InsimulTypes.ConversationState.ENDED
	conversation_ended.emit(old_session)


## Get the current session ID (empty if no active conversation).
func get_session_id() -> String:
	return _session_id


## Get the current conversation state.
func get_conversation_state() -> int:
	return _state


## Check if the server is healthy.
func health_check(callback: Callable) -> void:
	_http_client.health_check(callback)


# ── Internal ─────────────────────────────────────────────────────────────────

func _generate_id() -> String:
	var chars := "abcdefghijklmnopqrstuvwxyz0123456789"
	var id := ""
	for i in range(12):
		id += chars[randi() % chars.length()]
	return id


func _on_text_chunk(chunk: InsimulTypes.TextChunk) -> void:
	text_received.emit(chunk)


func _on_audio_chunk(chunk: InsimulTypes.AudioChunk) -> void:
	audio_chunk_received.emit(chunk)


func _on_facial_data(data: InsimulTypes.FacialData) -> void:
	facial_data_received.emit(data)


func _on_action_trigger(action: InsimulTypes.ActionTrigger) -> void:
	action_trigger_received.emit(action)


func _on_error(message: String) -> void:
	error_occurred.emit(message)


func _on_stream_completed() -> void:
	pass  # Stream done; state remains ACTIVE until end_conversation()
