using System;
using System.Collections;
using UnityEngine;

namespace Insimul
{
    /// <summary>
    /// Singleton MonoBehaviour that manages the Insimul conversation service connection.
    /// Add to a persistent GameObject in your scene (or use DontDestroyOnLoad).
    /// </summary>
    public class InsimulManager : MonoBehaviour
    {
        private static InsimulManager _instance;
        public static InsimulManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<InsimulManager>();
                    if (_instance == null)
                    {
                        Debug.LogError("[Insimul] No InsimulManager found in scene. Add one to a GameObject.");
                    }
                }
                return _instance;
            }
        }

        [Header("Server Configuration")]
        [Tooltip("URL of the Insimul conversation server (e.g. http://localhost:3000)")]
        public string serverUrl = "http://localhost:3000";

        [Tooltip("API key for authenticating with the Insimul service")]
        public string apiKey = "";

        [Tooltip("World ID to use for conversations")]
        public string worldId = "";

        [Tooltip("Default language code (e.g. en-US, fr-FR)")]
        public string languageCode = "en-US";

        [Header("Options")]
        [Tooltip("Persist this manager across scene loads")]
        public bool persistAcrossScenes = true;

        private InsimulHttpClient _httpClient;

        /// <summary>
        /// The shared HTTP client used by all InsimulNPC components.
        /// </summary>
        public InsimulHttpClient HttpClient => _httpClient;

        /// <summary>
        /// Current configuration derived from Inspector fields.
        /// </summary>
        public InsimulConfig Config => new InsimulConfig
        {
            serverUrl = serverUrl,
            apiKey = apiKey,
            worldId = worldId,
            languageCode = languageCode
        };

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Debug.LogWarning("[Insimul] Duplicate InsimulManager detected. Destroying this instance.");
                Destroy(gameObject);
                return;
            }

            _instance = this;

            if (persistAcrossScenes)
            {
                DontDestroyOnLoad(gameObject);
            }

            _httpClient = new InsimulHttpClient(Config);
        }

        private void OnValidate()
        {
            if (_httpClient != null)
            {
                _httpClient.UpdateConfig(Config);
            }
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _httpClient?.CancelActiveRequest();
                _instance = null;
            }
        }

        /// <summary>
        /// Generate a unique session ID for a new conversation.
        /// </summary>
        public static string GenerateSessionId()
        {
            return "unity_" + Guid.NewGuid().ToString("N").Substring(0, 16);
        }

        /// <summary>
        /// Check if the Insimul server is reachable.
        /// </summary>
        public void CheckHealth(Action<bool> callback)
        {
            StartCoroutine(_httpClient.HealthCheck(callback));
        }
    }
}
