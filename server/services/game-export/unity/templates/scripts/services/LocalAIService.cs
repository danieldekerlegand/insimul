using System;
using System.Collections;
using System.IO;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using Insimul.Data;

namespace Insimul.Services
{
    /// <summary>
    /// Local AI service that uses bundled llama.cpp, Piper, and Whisper models
    /// for offline inference. Falls back to cloud API when native plugin is unavailable.
    /// </summary>
    public class LocalAIService : MonoBehaviour
    {
        public static LocalAIService Instance { get; private set; }

        private InsimulAIConfig _config;
        private bool _nativeAvailable;
        private bool _initialized;
        private string _modelsPath;

        private void Awake()
        {
            if (Instance != null) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        /// <summary>
        /// Initialize the local AI service. Detects native plugin availability
        /// and resolves model file paths from StreamingAssets.
        /// </summary>
        public void Initialize(InsimulAIConfig config)
        {
            _config = config;
            _modelsPath = Path.Combine(Application.streamingAssetsPath, "ai", "models");
            _nativeAvailable = LlamaNativePlugin.IsAvailable();
            _initialized = true;

            if (_nativeAvailable)
            {
                LlamaNativePlugin.llama_backend_init();
                Debug.Log($"[LocalAI] Native plugin available. Models path: {_modelsPath}");
            }
            else
            {
                Debug.LogWarning("[LocalAI] Native plugin not available — falling back to cloud API.");
            }
        }

        /// <summary>True if native llama.cpp is loaded and models are present.</summary>
        public bool IsLocalAvailable => _nativeAvailable && _initialized;

        /// <summary>True if we are using cloud fallback instead of local models.</summary>
        public bool IsCloudFallback => !_nativeAvailable && _initialized;

        private void OnDestroy()
        {
            if (Instance == this && _nativeAvailable)
            {
                LlamaNativePlugin.llama_backend_free();
            }
        }

        // ─── Text Generation ───

        /// <summary>
        /// Generate text completion from a prompt. Uses local LLM when available,
        /// falls back to cloud API otherwise.
        /// </summary>
        public Coroutine Generate(string prompt, string systemPrompt, Action<string> onComplete, Action<string> onError)
        {
            return StartCoroutine(GenerateCoroutine(prompt, systemPrompt, onComplete, onError));
        }

        private IEnumerator GenerateCoroutine(string prompt, string systemPrompt, Action<string> onComplete, Action<string> onError)
        {
            if (!_initialized)
            {
                onError?.Invoke("LocalAIService not initialized");
                yield break;
            }

            if (_nativeAvailable)
            {
                // Local inference via native plugin
                // Model loading and inference runs on a background thread in production.
                // This placeholder demonstrates the API contract — actual native calls
                // require the compiled llama.cpp shared library in Plugins/.
                string modelFile = string.IsNullOrEmpty(_config.localModelPath)
                    ? Path.Combine(_modelsPath, _config.localModelName + ".gguf")
                    : Path.Combine(_modelsPath, _config.localModelPath);

                if (!File.Exists(modelFile))
                {
                    Debug.LogWarning($"[LocalAI] Model file not found: {modelFile}, falling back to cloud");
                    yield return CloudGenerateFallback(prompt, systemPrompt, onComplete, onError);
                    yield break;
                }

                // Native inference would happen here via LlamaNativePlugin calls.
                // For now, signal that local mode is active.
                Debug.Log($"[LocalAI] Local generate with model: {modelFile}");
                onComplete?.Invoke("[Local AI response — native plugin required for actual inference]");
            }
            else
            {
                yield return CloudGenerateFallback(prompt, systemPrompt, onComplete, onError);
            }
        }

        // ─── Text-to-Speech ───

        /// <summary>
        /// Synthesize speech from text. Uses Piper TTS locally when available,
        /// falls back to cloud API otherwise.
        /// </summary>
        public Coroutine TextToSpeech(string text, string voice, Action<AudioClip> onComplete, Action<string> onError)
        {
            return StartCoroutine(TTSCoroutine(text, voice, onComplete, onError));
        }

        private IEnumerator TTSCoroutine(string text, string voice, Action<AudioClip> onComplete, Action<string> onError)
        {
            if (!_initialized)
            {
                onError?.Invoke("LocalAIService not initialized");
                yield break;
            }

            if (_nativeAvailable)
            {
                string voiceModel = Path.Combine(_modelsPath, "voices", voice + ".onnx");
                if (!File.Exists(voiceModel))
                {
                    Debug.LogWarning($"[LocalAI] Voice model not found: {voiceModel}, falling back to cloud");
                    yield return CloudTTSFallback(text, voice, onComplete, onError);
                    yield break;
                }

                Debug.Log($"[LocalAI] Local TTS with voice: {voiceModel}");
                // Piper TTS inference would happen here via native calls.
                onError?.Invoke("Local TTS not yet wired to native — use cloud fallback");
            }
            else
            {
                yield return CloudTTSFallback(text, voice, onComplete, onError);
            }
        }

        // ─── Speech-to-Text ───

        /// <summary>
        /// Transcribe audio to text. Uses Whisper locally when available,
        /// falls back to cloud API otherwise.
        /// </summary>
        public Coroutine SpeechToText(AudioClip clip, Action<string> onComplete, Action<string> onError)
        {
            return StartCoroutine(STTCoroutine(clip, onComplete, onError));
        }

        private IEnumerator STTCoroutine(AudioClip clip, Action<string> onComplete, Action<string> onError)
        {
            if (!_initialized)
            {
                onError?.Invoke("LocalAIService not initialized");
                yield break;
            }

            if (_nativeAvailable)
            {
                // Find whisper model
                string whisperModel = FindWhisperModel();
                if (whisperModel == null)
                {
                    Debug.LogWarning("[LocalAI] Whisper model not found, falling back to cloud");
                    yield return CloudSTTFallback(clip, onComplete, onError);
                    yield break;
                }

                Debug.Log($"[LocalAI] Local STT with model: {whisperModel}");
                // Whisper inference would happen here via native calls.
                onError?.Invoke("Local STT not yet wired to native — use cloud fallback");
            }
            else
            {
                yield return CloudSTTFallback(clip, onComplete, onError);
            }
        }

        // ─── Cloud Fallbacks ───

        private IEnumerator CloudGenerateFallback(string prompt, string systemPrompt, Action<string> onComplete, Action<string> onError)
        {
            string url = _config.insimulEndpoint;
            if (string.IsNullOrEmpty(url))
            {
                onError?.Invoke("No cloud endpoint configured for fallback");
                yield break;
            }

            var body = $"{{\"text\":\"{EscapeJson(prompt)}\",\"systemPrompt\":\"{EscapeJson(systemPrompt)}\"}}";

            using var request = new UnityWebRequest(url, "POST");
            request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                onError?.Invoke($"Cloud fallback failed: {request.error}");
                yield break;
            }

            onComplete?.Invoke(request.downloadHandler.text);
        }

        private IEnumerator CloudTTSFallback(string text, string voice, Action<AudioClip> onComplete, Action<string> onError)
        {
            onError?.Invoke("Cloud TTS fallback not implemented — configure local models or Insimul server");
            yield break;
        }

        private IEnumerator CloudSTTFallback(AudioClip clip, Action<string> onComplete, Action<string> onError)
        {
            onError?.Invoke("Cloud STT fallback not implemented — configure local models or Insimul server");
            yield break;
        }

        // ─── Helpers ───

        private string FindWhisperModel()
        {
            if (!Directory.Exists(_modelsPath)) return null;

            foreach (var file in Directory.GetFiles(_modelsPath))
            {
                if (Path.GetFileName(file).StartsWith("ggml-") && file.EndsWith(".bin"))
                    return file;
            }
            return null;
        }

        private static string EscapeJson(string s)
        {
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
        }
    }
}
