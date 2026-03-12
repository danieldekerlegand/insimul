/**
 * US-6.05 — Unity Telemetry Template
 *
 * Generates a C# MonoBehaviour that acts as a singleton telemetry manager for
 * Unity exports.  Batches events, flushes via UnityWebRequest coroutine,
 * persists the offline queue in PlayerPrefs, and auto-tracks FPS / scene loads.
 */

// ── Config type ─────────────────────────────────────────────────────────────

export interface UnityTelemetryConfig {
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
 * Returns a complete C# file implementing `TelemetryManager`.
 *
 * Features:
 * - Singleton with DontDestroyOnLoad
 * - UnityWebRequest POST with JSON batching
 * - PlayerPrefs offline queue persistence
 * - Coroutine-based flush with exponential-backoff retry
 * - Auto-tracks FPS (sampled every 5 s), scene loads, session start/end
 * - `Track(eventType, data)` public API for custom events
 */
export function generateUnityTelemetryTemplate(
  config: UnityTelemetryConfig,
): string {
  const flushIntervalSec = (config.flushIntervalMs / 1000).toFixed(1);

  return `// Insimul Telemetry Manager — Unity (auto-generated)
//
// Attach this MonoBehaviour to an empty GameObject in your first scene.
// It will persist across scene loads via DontDestroyOnLoad.

using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;

namespace Insimul.Telemetry
{
    [Serializable]
    public class TelemetryEvent
    {
        public string eventType;
        public string data; // JSON string of the data dictionary
        public string timestamp;
        public string sessionId;
        public string playerId;
        public string worldId;
    }

    [Serializable]
    public class TelemetryBatch
    {
        public List<TelemetryEvent> events;
    }

    [Serializable]
    public class TelemetryQueue
    {
        public List<TelemetryEvent> items = new List<TelemetryEvent>();
    }

    public class TelemetryManager : MonoBehaviour
    {
        // ── Configuration ───────────────────────────────────────────────────

        private const string Endpoint = "${config.apiEndpoint}/api/external/telemetry/batch";
        private const string ApiKey = "${config.apiKey}";
        private const int BatchSize = ${config.batchSize};
        private const float FlushIntervalSec = ${flushIntervalSec}f;
        private const float FpsSampleIntervalSec = 5.0f;
        private const int MaxRetries = 3;
        private const int MaxQueueSize = 10000;
        private const string QueuePlayerPrefsKey = "InsimulTelemetryQueue";
        private const string PlayerIdPrefsKey = "InsimulPlayerId";

        // ── Singleton ───────────────────────────────────────────────────────

        public static TelemetryManager Instance { get; private set; }

        private const string ConsentPrefsKey = "InsimulTelemetryConsent";

        /// <summary>Current connection status: Connected, Queued, or Offline.</summary>
        public enum TelemetryStatus { Connected, Queued, Offline }

        public TelemetryStatus Status { get; private set; } = TelemetryStatus.Offline;

        private readonly List<TelemetryEvent> _queue = new List<TelemetryEvent>();
        private string _sessionId;
        private string _playerId;
        private string _worldId = "";
        private bool _isFlushing;
        private bool _consentGiven;
        private float _flushTimer;
        private float _fpsTimer;
        private float _sessionStartTime;
        private int _frameCount;
        private float _fpsAccumulator;

        // ── Lifecycle ───────────────────────────────────────────────────────

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            // First-launch consent check via PlayerPrefs
            _consentGiven = PlayerPrefs.GetInt(ConsentPrefsKey, 0) == 1;
            if (!_consentGiven)
            {
                Status = TelemetryStatus.Offline;
                return;
            }

            InitializeTelemetry();
        }

        private void InitializeTelemetry()
        {
            _sessionId = "sess_" + DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString("x")
                         + "_" + UnityEngine.Random.Range(0, 999999).ToString("x6");
            _playerId = LoadOrCreatePlayerId();
            _sessionStartTime = Time.realtimeSinceStartup;

            LoadPersistedQueue();
            Status = _queue.Count > 0 ? TelemetryStatus.Queued : TelemetryStatus.Connected;

            Track("session_start", new Dictionary<string, object>
            {
                { "platform", Application.platform.ToString() },
                { "systemLanguage", Application.systemLanguage.ToString() },
                { "screenWidth", Screen.width },
                { "screenHeight", Screen.height },
                { "targetFrameRate", Application.targetFrameRate },
            });

            SceneManager.sceneLoaded += OnSceneLoaded;
        }

        private void OnDestroy()
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;
        }

        private void Update()
        {
            // FPS accumulator
            _frameCount++;
            _fpsAccumulator += Time.unscaledDeltaTime;

            // FPS sample
            _fpsTimer += Time.unscaledDeltaTime;
            if (_fpsTimer >= FpsSampleIntervalSec)
            {
                float avgFps = _frameCount / _fpsAccumulator;
                Track("fps_sample", new Dictionary<string, object>
                {
                    { "fps", Mathf.RoundToInt(avgFps) },
                    { "deltaTimeMs", Time.deltaTime * 1000f },
                    { "targetFrameRate", Application.targetFrameRate },
                });
                _frameCount = 0;
                _fpsAccumulator = 0f;
                _fpsTimer = 0f;
            }

            // Flush timer
            _flushTimer += Time.unscaledDeltaTime;
            if (_flushTimer >= FlushIntervalSec)
            {
                _flushTimer = 0f;
                Flush();
            }
        }

        private void OnApplicationPause(bool paused)
        {
            if (paused)
            {
                Track("session_paused", new Dictionary<string, object>());
                PersistQueue();
            }
            else
            {
                Track("session_resumed", new Dictionary<string, object>());
            }
        }

        private void OnApplicationQuit()
        {
            Track("session_end", new Dictionary<string, object>
            {
                { "sessionDurationMs", Mathf.RoundToInt((Time.realtimeSinceStartup - _sessionStartTime) * 1000f) },
            });
            PersistQueue();
        }

        // ── Public API ──────────────────────────────────────────────────────

        /// <summary>Set the world ID for all subsequent events.</summary>
        public void Configure(string worldId)
        {
            _worldId = worldId;
        }

        /// <summary>Grant telemetry consent. Call from your consent UI.</summary>
        public void GrantConsent()
        {
            _consentGiven = true;
            PlayerPrefs.SetInt(ConsentPrefsKey, 1);
            PlayerPrefs.Save();
            if (_sessionId == null) InitializeTelemetry();
        }

        /// <summary>Revoke telemetry consent.</summary>
        public void RevokeConsent()
        {
            _consentGiven = false;
            PlayerPrefs.SetInt(ConsentPrefsKey, 0);
            PlayerPrefs.Save();
            Status = TelemetryStatus.Offline;
        }

        /// <summary>Whether the user has granted telemetry consent.</summary>
        public bool HasConsent => _consentGiven;

        /// <summary>Track language learning progress.</summary>
        public void TrackLanguageProgress(Dictionary<string, object> progressData)
        {
            Track("language_progress", progressData);
        }

        /// <summary>Track a telemetry event with a data dictionary.</summary>
        public void Track(string eventType, Dictionary<string, object> data)
        {
            if (!_consentGiven) return;

            var ev = new TelemetryEvent
            {
                eventType = eventType,
                data = DictToJson(data),
                timestamp = DateTime.UtcNow.ToString("o"),
                sessionId = _sessionId,
                playerId = _playerId,
                worldId = _worldId,
            };
            _queue.Add(ev);

            if (_queue.Count > MaxQueueSize)
            {
                _queue.RemoveRange(0, _queue.Count - MaxQueueSize);
            }
        }

        /// <summary>Force-flush the current queue.</summary>
        public void Flush()
        {
            if (!_isFlushing && _queue.Count > 0)
            {
                StartCoroutine(FlushCoroutine());
            }
        }

        /// <summary>Current number of events waiting to be sent.</summary>
        public int QueueSize => _queue.Count;

        // ── Scene Tracking ──────────────────────────────────────────────────

        private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            Track("scene_loaded", new Dictionary<string, object>
            {
                { "sceneName", scene.name },
                { "sceneBuildIndex", scene.buildIndex },
                { "loadMode", mode.ToString() },
            });
        }

        // ── Networking ──────────────────────────────────────────────────────

        private IEnumerator FlushCoroutine()
        {
            _isFlushing = true;

            int count = Mathf.Min(BatchSize, _queue.Count);
            var batch = _queue.GetRange(0, count);
            _queue.RemoveRange(0, count);

            bool success = false;

            for (int attempt = 0; attempt < MaxRetries; attempt++)
            {
                var wrapper = new TelemetryBatch { events = batch };
                string json = JsonUtility.ToJson(wrapper);

                using (var request = new UnityWebRequest(Endpoint, "POST"))
                {
                    byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
                    request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                    request.downloadHandler = new DownloadHandlerBuffer();
                    request.SetRequestHeader("Content-Type", "application/json");
                    request.SetRequestHeader("X-API-Key", ApiKey);

                    yield return request.SendWebRequest();

                    if (request.result == UnityWebRequest.Result.Success)
                    {
                        success = true;
                        break;
                    }

                    // Don't retry client errors
                    if (request.responseCode >= 400 && request.responseCode < 500)
                    {
                        Debug.LogWarning($"Telemetry batch rejected ({request.responseCode}): {request.downloadHandler.text}");
                        success = true; // drop the batch
                        break;
                    }
                }

                // Exponential backoff
                if (attempt < MaxRetries - 1)
                {
                    yield return new WaitForSecondsRealtime(Mathf.Pow(2f, attempt));
                }
            }

            if (!success)
            {
                // Re-enqueue and persist
                _queue.InsertRange(0, batch);
                PersistQueue();
                Status = TelemetryStatus.Offline;
                Debug.LogWarning($"Telemetry flush failed after {MaxRetries} retries, persisted locally");
            }
            else if (_queue.Count == 0)
            {
                ClearPersistedQueue();
                Status = TelemetryStatus.Connected;
            }
            else
            {
                PersistQueue();
                Status = TelemetryStatus.Queued;
            }

            _isFlushing = false;
        }

        // ── Persistence ─────────────────────────────────────────────────────

        private void PersistQueue()
        {
            try
            {
                var wrapper = new TelemetryQueue { items = _queue };
                string json = JsonUtility.ToJson(wrapper);
                PlayerPrefs.SetString(QueuePlayerPrefsKey, json);
                PlayerPrefs.Save();
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"Failed to persist telemetry queue: {ex.Message}");
            }
        }

        private void LoadPersistedQueue()
        {
            try
            {
                string json = PlayerPrefs.GetString(QueuePlayerPrefsKey, "");
                if (!string.IsNullOrEmpty(json))
                {
                    var wrapper = JsonUtility.FromJson<TelemetryQueue>(json);
                    if (wrapper?.items != null)
                    {
                        _queue.InsertRange(0, wrapper.items);
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"Failed to load persisted telemetry queue: {ex.Message}");
            }
        }

        private void ClearPersistedQueue()
        {
            PlayerPrefs.DeleteKey(QueuePlayerPrefsKey);
            PlayerPrefs.Save();
        }

        private string LoadOrCreatePlayerId()
        {
            string id = PlayerPrefs.GetString(PlayerIdPrefsKey, "");
            if (string.IsNullOrEmpty(id))
            {
                id = "player_" + DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString("x")
                     + "_" + UnityEngine.Random.Range(0, 999999).ToString("x6");
                PlayerPrefs.SetString(PlayerIdPrefsKey, id);
                PlayerPrefs.Save();
            }
            return id;
        }

        // ── Helpers ─────────────────────────────────────────────────────────

        private static string DictToJson(Dictionary<string, object> dict)
        {
            if (dict == null || dict.Count == 0) return "{}";

            var sb = new StringBuilder();
            sb.Append('{');
            bool first = true;
            foreach (var kvp in dict)
            {
                if (!first) sb.Append(',');
                first = false;
                sb.Append('"').Append(EscapeJson(kvp.Key)).Append('"').Append(':');
                AppendJsonValue(sb, kvp.Value);
            }
            sb.Append('}');
            return sb.ToString();
        }

        private static void AppendJsonValue(StringBuilder sb, object value)
        {
            switch (value)
            {
                case null:
                    sb.Append("null");
                    break;
                case bool b:
                    sb.Append(b ? "true" : "false");
                    break;
                case int i:
                    sb.Append(i);
                    break;
                case float f:
                    sb.Append(f.ToString("G"));
                    break;
                case double d:
                    sb.Append(d.ToString("G"));
                    break;
                case string s:
                    sb.Append('"').Append(EscapeJson(s)).Append('"');
                    break;
                default:
                    sb.Append('"').Append(EscapeJson(value.ToString())).Append('"');
                    break;
            }
        }

        private static string EscapeJson(string s)
        {
            return s.Replace("\\\\", "\\\\\\\\").Replace("\\"", "\\\\\\"")
                    .Replace("\\n", "\\\\n").Replace("\\r", "\\\\r")
                    .Replace("\\t", "\\\\t");
        }
    }
}
`;
}
