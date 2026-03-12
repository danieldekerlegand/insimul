/**
 * US-6.04 — Godot Telemetry Template
 *
 * Generates a GDScript autoload class that batches telemetry events and sends
 * them to the Insimul endpoint via HTTPRequest.  Supports offline queuing with
 * local file persistence and automatic retry.
 */

// ── Config type ─────────────────────────────────────────────────────────────

export interface GodotTelemetryConfig {
  /** Telemetry ingest endpoint, e.g. "https://insimul.example.com" */
  apiEndpoint: string;
  /** API key for authentication */
  apiKey: string;
  /** Max events per HTTP batch */
  batchSize: number;
  /** How often (ms) the queue is flushed */
  flushIntervalMs: number;
}

// ── Generator ───────────────────────────────────────────────────────────────

/**
 * Returns a complete GDScript file that should be registered as an autoload
 * singleton (e.g. `TelemetryClient`).
 *
 * Features:
 * - Batched HTTP POST via HTTPRequest node
 * - Offline queue persisted to `user://telemetry_queue.json`
 * - Exponential-backoff retry (up to 3 attempts)
 * - _process frame-time tracking (sampled every 5 s)
 * - Scene-change detection via tree signal
 * - `track(event_type, data)` API for custom events
 */
export function generateGodotTelemetryTemplate(
  config: GodotTelemetryConfig,
): string {
  const flushIntervalSec = (config.flushIntervalMs / 1000).toFixed(1);

  return `## Insimul Telemetry Client — Godot Autoload (auto-generated)
##
## Register as an autoload singleton named "TelemetryClient".

extends Node

# ── Configuration ────────────────────────────────────────────────────────────

const ENDPOINT: String = "${config.apiEndpoint}/api/external/telemetry/batch"
const API_KEY: String = "${config.apiKey}"
const BATCH_SIZE: int = ${config.batchSize}
const FLUSH_INTERVAL_SEC: float = ${flushIntervalSec}
const FPS_SAMPLE_INTERVAL_SEC: float = 5.0
const MAX_RETRIES: int = 3
const MAX_QUEUE_SIZE: int = 10000
const PERSISTENCE_PATH: String = "user://telemetry_queue.json"

# ── State ────────────────────────────────────────────────────────────────────

var _queue: Array[Dictionary] = []
var _session_id: String = ""
var _player_id: String = ""
var _world_id: String = ""
var _flush_timer: float = 0.0
var _fps_timer: float = 0.0
var _is_flushing: bool = false
var _http_request: HTTPRequest = null
var _current_scene_name: String = ""
var _session_start_time: int = 0
var _consent_given: bool = false
var _language_progress: Dictionary = {}

## Status indicator: "connected", "queued", "offline"
var status: String = "offline"

# ── Lifecycle ────────────────────────────────────────────────────────────────

func _ready() -> void:
\t_session_id = "sess_%s_%s" % [str(Time.get_unix_time_from_system()).sha256_text().left(8), str(randi())]
\t_player_id = _load_or_create_player_id()
\t_session_start_time = Time.get_ticks_msec()

\t# First-launch consent check
\t_consent_given = _load_consent()
\tif not _consent_given:
\t\treturn  # Do not initialise until consent is granted

\t_initialise_telemetry()


func _initialise_telemetry() -> void:
\t# Create HTTPRequest child
\t_http_request = HTTPRequest.new()
\t_http_request.request_completed.connect(_on_request_completed)
\tadd_child(_http_request)

\t# Load persisted queue
\t_load_queue()
\tstatus = "queued" if _queue.size() > 0 else "connected"

\t# Track session start
\ttrack("session_start", {"os": OS.get_name(), "locale": OS.get_locale()})

\t# Listen for scene changes
\tget_tree().tree_changed.connect(_on_tree_changed)


func _process(delta: float) -> void:
\t# Flush timer
\t_flush_timer += delta
\tif _flush_timer >= FLUSH_INTERVAL_SEC:
\t\t_flush_timer = 0.0
\t\tflush()

\t# FPS sample timer
\t_fps_timer += delta
\tif _fps_timer >= FPS_SAMPLE_INTERVAL_SEC:
\t\t_fps_timer = 0.0
\t\ttrack("fps_sample", {
\t\t\t"fps": Engine.get_frames_per_second(),
\t\t\t"frame_time_ms": delta * 1000.0,
\t\t\t"static_memory_mb": OS.get_static_memory_usage() / 1048576.0,
\t\t})


func _notification(what: int) -> void:
\tif what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_PREDELETE:
\t\ttrack("session_end", {
\t\t\t"session_duration_ms": Time.get_ticks_msec() - _session_start_time,
\t\t})
\t\tflush()
\t\t_save_queue()

# ── Public API ───────────────────────────────────────────────────────────────

## Set the world ID for all subsequent events.
func configure(world_id: String) -> void:
\t_world_id = world_id


## Track a custom telemetry event.
func track(event_type: String, data: Dictionary = {}) -> void:
\tif not _consent_given:
\t\treturn
\tvar event := {
\t\t"eventType": event_type,
\t\t"data": data,
\t\t"timestamp": Time.get_datetime_string_from_system(true),
\t\t"sessionId": _session_id,
\t\t"playerId": _player_id,
\t\t"worldId": _world_id,
\t}
\t_queue.append(event)

\t# Drop oldest if over capacity
\tif _queue.size() > MAX_QUEUE_SIZE:
\t\t_queue = _queue.slice(_queue.size() - MAX_QUEUE_SIZE)


## Force-flush the current queue.
func flush() -> void:
\tif _is_flushing or _queue.is_empty():
\t\treturn
\t_send_batch()

# ── Networking ───────────────────────────────────────────────────────────────

var _pending_batch: Array[Dictionary] = []
var _retry_count: int = 0

func _send_batch() -> void:
\t_is_flushing = true
\t_retry_count = 0
\t_pending_batch = _queue.slice(0, BATCH_SIZE)
\t_queue = _queue.slice(BATCH_SIZE)
\t_do_send()


func _do_send() -> void:
\tvar body := JSON.stringify({"events": _pending_batch})
\tvar headers := [
\t\t"Content-Type: application/json",
\t\t"X-API-Key: %s" % API_KEY,
\t]
\tvar err := _http_request.request(ENDPOINT, headers, HTTPClient.METHOD_POST, body)
\tif err != OK:
\t\t_handle_failure()


func _on_request_completed(result: int, response_code: int, _headers: PackedStringArray, _body: PackedByteArray) -> void:
\tif result == HTTPRequest.RESULT_SUCCESS and response_code >= 200 and response_code < 300:
\t\t# Success — clear pending batch
\t\t_pending_batch.clear()
\t\t_is_flushing = false
\t\tstatus = "connected"
\t\tif _queue.is_empty():
\t\t\t_clear_persisted_queue()
\t\telse:
\t\t\t_save_queue()
\t\treturn

\t# Client error (4xx) — drop the batch
\tif response_code >= 400 and response_code < 500:
\t\tpush_warning("Telemetry batch rejected (%d), dropping events" % response_code)
\t\t_pending_batch.clear()
\t\t_is_flushing = false
\t\tstatus = "connected"
\t\treturn

\t_handle_failure()


func _handle_failure() -> void:
\t_retry_count += 1
\tif _retry_count < MAX_RETRIES:
\t\t# Exponential backoff: 1s, 2s, 4s
\t\tvar delay := pow(2.0, _retry_count - 1)
\t\tawait get_tree().create_timer(delay).timeout
\t\t_do_send()
\telse:
\t\t# Re-enqueue at front and persist
\t\t_queue = _pending_batch + _queue
\t\t_pending_batch.clear()
\t\t_is_flushing = false
\t\tstatus = "offline"
\t\t_save_queue()
\t\tpush_warning("Telemetry flush failed after %d retries, persisted locally" % MAX_RETRIES)

# ── Scene Change Detection ───────────────────────────────────────────────────

func _on_tree_changed() -> void:
\tvar root := get_tree().current_scene
\tif root == null:
\t\treturn
\tvar scene_name := root.scene_file_path
\tif scene_name != _current_scene_name and scene_name != "":
\t\tvar previous := _current_scene_name
\t\t_current_scene_name = scene_name
\t\ttrack("scene_changed", {
\t\t\t"from": previous,
\t\t\t"to": scene_name,
\t\t})

# ── Local Persistence ────────────────────────────────────────────────────────

func _save_queue() -> void:
\tvar file := FileAccess.open(PERSISTENCE_PATH, FileAccess.WRITE)
\tif file == null:
\t\treturn
\tfile.store_string(JSON.stringify(_queue))
\tfile.close()


func _load_queue() -> void:
\tif not FileAccess.file_exists(PERSISTENCE_PATH):
\t\treturn
\tvar file := FileAccess.open(PERSISTENCE_PATH, FileAccess.READ)
\tif file == null:
\t\treturn
\tvar text := file.get_as_text()
\tfile.close()
\tvar parsed = JSON.parse_string(text)
\tif parsed is Array:
\t\tfor item in parsed:
\t\t\tif item is Dictionary:
\t\t\t\t_queue.append(item)


func _clear_persisted_queue() -> void:
\tif FileAccess.file_exists(PERSISTENCE_PATH):
\t\tDirAccess.remove_absolute(PERSISTENCE_PATH)


func _load_or_create_player_id() -> String:
\tvar config_path := "user://telemetry_player.cfg"
\tvar config := ConfigFile.new()
\tif config.load(config_path) == OK:
\t\treturn config.get_value("telemetry", "player_id", "")
\tvar new_id := "player_%s_%s" % [str(Time.get_unix_time_from_system()).left(8), str(randi())]
\tconfig.set_value("telemetry", "player_id", new_id)
\tconfig.save(config_path)
\treturn new_id

# ── Consent ─────────────────────────────────────────────────────────────────

## Grant telemetry consent (call from your consent UI).
func grant_consent() -> void:
\t_consent_given = true
\tvar config := ConfigFile.new()
\tconfig.load("user://telemetry_player.cfg")
\tconfig.set_value("telemetry", "consent_given", true)
\tconfig.save("user://telemetry_player.cfg")
\t_initialise_telemetry()


## Revoke telemetry consent.
func revoke_consent() -> void:
\t_consent_given = false
\tvar config := ConfigFile.new()
\tconfig.load("user://telemetry_player.cfg")
\tconfig.set_value("telemetry", "consent_given", false)
\tconfig.save("user://telemetry_player.cfg")
\tstatus = "offline"


## Check whether consent was previously granted.
func has_consent() -> bool:
\treturn _consent_given


func _load_consent() -> bool:
\tvar config := ConfigFile.new()
\tif config.load("user://telemetry_player.cfg") == OK:
\t\treturn config.get_value("telemetry", "consent_given", false)
\treturn false

# ── Language Progress ────────────────────────────────────────────────────────

## Update language progress and include it in the next telemetry batch.
func update_language_progress(progress_data: Dictionary) -> void:
\t_language_progress = progress_data
\ttrack("language_progress", progress_data)


## Get the current status indicator ("connected", "queued", "offline").
func get_status() -> String:
\treturn status
`;
}
