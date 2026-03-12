using System.Collections;
using UnityEngine;

namespace Insimul
{
    /// <summary>
    /// Attach to any GameObject to enable Insimul conversation.
    /// Requires an InsimulManager in the scene.
    /// </summary>
    public class InsimulNPC : MonoBehaviour
    {
        [Header("Character")]
        [Tooltip("Insimul character ID for this NPC")]
        public string characterId = "";

        [Tooltip("Override language code (leave empty to use InsimulManager default)")]
        public string languageCodeOverride = "";

        [Header("Events")]
        public InsimulTextChunkEvent onTextReceived = new InsimulTextChunkEvent();
        public InsimulAudioChunkEvent onAudioReceived = new InsimulAudioChunkEvent();
        public InsimulFacialDataEvent onFacialDataReceived = new InsimulFacialDataEvent();
        public InsimulActionTriggerEvent onActionTriggered = new InsimulActionTriggerEvent();
        public InsimulTranscriptEvent onTranscriptReceived = new InsimulTranscriptEvent();
        public InsimulStateChangeEvent onConversationStarted = new InsimulStateChangeEvent();
        public InsimulStateChangeEvent onConversationEnded = new InsimulStateChangeEvent();
        public InsimulErrorEvent onError = new InsimulErrorEvent();

        private string _sessionId;
        private InsimulHttpClient _httpClient;
        private InsimulConversationState _state = InsimulConversationState.Unspecified;
        private Coroutine _activeCoroutine;

        /// <summary>Current session ID (null if no active conversation).</summary>
        public string SessionId => _sessionId;

        /// <summary>Current conversation state.</summary>
        public InsimulConversationState State => _state;

        /// <summary>Whether a conversation is currently active.</summary>
        public bool IsConversationActive =>
            _state == InsimulConversationState.Started ||
            _state == InsimulConversationState.Active;

        private string EffectiveLanguageCode =>
            !string.IsNullOrEmpty(languageCodeOverride) ? languageCodeOverride : null;

        /// <summary>
        /// Start a new conversation with this NPC.
        /// </summary>
        public void StartConversation()
        {
            if (IsConversationActive)
            {
                Debug.LogWarning($"[Insimul] Conversation already active for {characterId}");
                return;
            }

            var manager = InsimulManager.Instance;
            if (manager == null) return;

            _httpClient = new InsimulHttpClient(manager.Config);
            BindHttpEvents();

            _sessionId = InsimulManager.GenerateSessionId();
            SetState(InsimulConversationState.Started);
            onConversationStarted?.Invoke(InsimulConversationState.Started);
        }

        /// <summary>
        /// Send a text message to the NPC.
        /// </summary>
        public void SendText(string text)
        {
            if (!EnsureActive()) return;

            SetState(InsimulConversationState.Active);
            StopActiveCoroutine();
            _activeCoroutine = StartCoroutine(SendTextCoroutine(text));
        }

        /// <summary>
        /// Send audio data to the NPC (from microphone capture).
        /// </summary>
        public void SendAudio(byte[] audioData)
        {
            if (!EnsureActive()) return;

            SetState(InsimulConversationState.Active);
            StopActiveCoroutine();
            _activeCoroutine = StartCoroutine(SendAudioCoroutine(audioData));
        }

        /// <summary>
        /// End the current conversation.
        /// </summary>
        public void EndConversation()
        {
            if (_httpClient == null || string.IsNullOrEmpty(_sessionId)) return;

            StopActiveCoroutine();
            _httpClient.CancelActiveRequest();
            StartCoroutine(EndConversationCoroutine());
        }

        private IEnumerator SendTextCoroutine(string text)
        {
            yield return _httpClient.SendText(_sessionId, characterId, text, EffectiveLanguageCode);
            _activeCoroutine = null;
        }

        private IEnumerator SendAudioCoroutine(byte[] audioData)
        {
            yield return _httpClient.SendAudio(_sessionId, characterId, audioData, EffectiveLanguageCode);
            _activeCoroutine = null;
        }

        private IEnumerator EndConversationCoroutine()
        {
            yield return _httpClient.EndSession(_sessionId);
            SetState(InsimulConversationState.Ended);
            onConversationEnded?.Invoke(InsimulConversationState.Ended);
            UnbindHttpEvents();
            _httpClient = null;
            _sessionId = null;
        }

        private void BindHttpEvents()
        {
            _httpClient.OnTextChunk += HandleTextChunk;
            _httpClient.OnAudioChunk += HandleAudioChunk;
            _httpClient.OnFacialData += HandleFacialData;
            _httpClient.OnActionTrigger += HandleActionTrigger;
            _httpClient.OnTranscript += HandleTranscript;
            _httpClient.OnError += HandleError;
        }

        private void UnbindHttpEvents()
        {
            if (_httpClient == null) return;
            _httpClient.OnTextChunk -= HandleTextChunk;
            _httpClient.OnAudioChunk -= HandleAudioChunk;
            _httpClient.OnFacialData -= HandleFacialData;
            _httpClient.OnActionTrigger -= HandleActionTrigger;
            _httpClient.OnTranscript -= HandleTranscript;
            _httpClient.OnError -= HandleError;
        }

        private void HandleTextChunk(InsimulTextChunk chunk) => onTextReceived?.Invoke(chunk);
        private void HandleAudioChunk(InsimulAudioChunk chunk) => onAudioReceived?.Invoke(chunk);
        private void HandleFacialData(InsimulFacialData data) => onFacialDataReceived?.Invoke(data);
        private void HandleActionTrigger(InsimulActionTrigger trigger) => onActionTriggered?.Invoke(trigger);
        private void HandleTranscript(string text) => onTranscriptReceived?.Invoke(text);
        private void HandleError(string error) => onError?.Invoke(error);

        private void SetState(InsimulConversationState state)
        {
            _state = state;
        }

        private bool EnsureActive()
        {
            if (!IsConversationActive)
            {
                Debug.LogWarning($"[Insimul] No active conversation for {characterId}. Call StartConversation() first.");
                return false;
            }
            return true;
        }

        private void StopActiveCoroutine()
        {
            if (_activeCoroutine != null)
            {
                StopCoroutine(_activeCoroutine);
                _activeCoroutine = null;
            }
        }

        private void OnDisable()
        {
            if (IsConversationActive)
            {
                EndConversation();
            }
        }

        private void OnDestroy()
        {
            StopActiveCoroutine();
            UnbindHttpEvents();
            _httpClient?.CancelActiveRequest();
        }
    }
}
