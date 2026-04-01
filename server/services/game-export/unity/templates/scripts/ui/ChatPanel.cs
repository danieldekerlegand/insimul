using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Insimul.Services;

namespace Insimul.UI
{
    /// <summary>
    /// Interface for bridging conversation metadata to quest objective evaluation.
    /// Mirrors ConversationQuestBridge from the shared game engine.
    /// </summary>
    public interface IConversationQuestBridge
    {
        /// <summary>Get active quest objectives to include in metadata requests.</summary>
        object[] GetObjectivesForEvaluation(string currentNpcId);

        /// <summary>Process goal evaluations from metadata response.</summary>
        void ProcessEvaluations(object[] goalEvaluations, string npcId, string playerMessage);
    }

    /// <summary>
    /// Metadata response from InsimulClient SDK.
    /// </summary>
    public class ConversationMetadata
    {
        public object[] goalEvaluations;
        public object grammarFeedback;
    }

    public class ChatPanel : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GameObject _panel;
        [SerializeField] private TMP_Text _headerText;
        [SerializeField] private ScrollRect _scrollRect;
        [SerializeField] private RectTransform _messageContainer;
        [SerializeField] private TMP_InputField _inputField;
        [SerializeField] private Button _sendButton;
        [SerializeField] private Button _closeButton;

        [Header("Message Prefabs")]
        [SerializeField] private GameObject _userMessagePrefab;
        [SerializeField] private GameObject _npcMessagePrefab;

        [Header("Gesture Panel")]
        [SerializeField] private GameObject _gesturePanel;
        [SerializeField] private Button[] _gestureButtons;

        [Header("Voice")]
        [SerializeField] private Button _voiceButton;

        private string _currentCharacterId;
        private TMP_Text _streamingMessageText;
        private bool _isStreaming;
        private bool _isRecording;
        private bool _isListeningMode;
        private string _targetLanguage;
        private string _aiProvider = "server";
        private string _playthroughId;
        private List<GameObject> _messageObjects = new();

        // Callbacks — mirrors BabylonChatPanel.ts event surface
        public event System.Action<string> OnGesturePerformed;
        public event System.Action OnClose;
        public event System.Action<string, object> OnQuestAssigned;
        public event System.Action<string, string, string> OnQuestBranched;
        public event System.Action<string> OnActionSelect;
        public event System.Action<string> OnVocabularyUsed;
        public event System.Action<string[]> OnConversationTurn;
        public event System.Action<string> OnNPCConversationStarted;
        public event System.Action<string> OnNPCSpeechUpdate;
        public event System.Action<string, object> OnQuestTurnedIn;
        public event System.Action<float, float> OnFluencyGain;
        public event System.Action<object> OnConversationSummary;
        public event System.Action<int, int> OnDialogueRating;
        public event System.Action<string, string, string> OnChatExchange;
        public event System.Action OnTalkRequested;
        public event System.Action<string, string> OnNpcConversationTurn;
        public event System.Action<string, int> OnWritingSubmitted;
        public event System.Action<object> OnListenAndRepeat;
        public event System.Action<object[], object> OnConversationalAction;
        public event System.Action<object> OnNewWordLearned;
        public event System.Action<object> OnWordMastered;
        public event System.Action<object> OnGrammarFeedbackExternal;

        // Quest bridge for conversation goal evaluation
        private IConversationQuestBridge _questBridge;

        // Inventory context for NPC dialogue
        private object[] _inventoryItems;
        private int _playerGold;

        public bool IsOpen => _panel != null && _panel.activeSelf;
        public bool IsRecording => _isRecording;
        public bool IsListeningMode => _isListeningMode;

        private void Awake()
        {
            if (_panel == null) CreateUI();
            _panel.SetActive(false);

            _sendButton.onClick.AddListener(OnSendClicked);
            _closeButton.onClick.AddListener(Close);
            _inputField.onSubmit.AddListener(_ => OnSendClicked());
        }

        public void Open(string characterId)
        {
            _currentCharacterId = characterId;
            var ctx = InsimulAIService.Instance?.GetContext(characterId);
            string name = ctx?.characterName ?? characterId;
            _headerText.text = name;

            ClearMessages();
            _panel.SetActive(true);
            _inputField.text = "";
            _inputField.ActivateInputField();
            ShowGesturePanel();

            // Show greeting
            if (ctx != null && !string.IsNullOrEmpty(ctx.greeting))
            {
                AddNPCMessage(ctx.greeting);
            }
        }

        public void Close(bool userInitiated = false)
        {
            _panel.SetActive(false);
            _currentCharacterId = null;
            _isStreaming = false;
            _isListeningMode = false;
            HideGesturePanel();
            OnClose?.Invoke();
        }

        /// <summary>
        /// Perform a non-verbal gesture during conversation.
        /// </summary>
        public void PerformGesture(string gestureId)
        {
            OnGesturePerformed?.Invoke(gestureId);
        }

        /// <summary>Set the quest bridge for conversation goal evaluation.</summary>
        public void SetQuestBridge(IConversationQuestBridge bridge) { _questBridge = bridge; }

        /// <summary>Set the AI provider for dialogue (e.g. "server", "local").</summary>
        public void SetAIProvider(string provider) { _aiProvider = provider; }
        public string GetAIProvider() => _aiProvider;

        /// <summary>Set the playthrough ID for conversation context.</summary>
        public void SetPlaythroughId(string id) { _playthroughId = id; }

        /// <summary>Set the target language for language-learning dialogue.</summary>
        public void SetTargetLanguage(string lang) { _targetLanguage = lang; }

        /// <summary>Set player inventory context for NPC dialogue awareness.</summary>
        public void SetPlayerInventoryContext(object[] items, int gold)
        {
            _inventoryItems = items;
            _playerGold = gold;
        }

        /// <summary>Add a system message to the chat panel.</summary>
        public void AddSystemMessage(string text)
        {
            var obj = CreateMessageBubble(false);
            var tmp = obj.GetComponentInChildren<TMP_Text>();
            tmp.text = $"<i>{text}</i>";
            tmp.color = new Color(0.7f, 0.7f, 0.8f);
            ScrollToBottom();
        }

        /// <summary>Add an NPC message to the chat panel (public API).</summary>
        public void AddNPCMessagePublic(string text)
        {
            AddNPCMessage(text);
        }

        /// <summary>Enter listening mode for voice-based conversation.</summary>
        public void EnterListeningMode()
        {
            _isListeningMode = true;
        }

        /// <summary>Exit listening mode.</summary>
        public void ExitListeningMode()
        {
            _isListeningMode = false;
        }

        /// <summary>Start push-to-talk voice recording.</summary>
        public void StartPushToTalk()
        {
            _isRecording = true;
        }

        /// <summary>Stop push-to-talk voice recording.</summary>
        public void StopPushToTalk()
        {
            _isRecording = false;
        }

        /// <summary>Set eavesdrop mode (observe NPC conversations without participating).</summary>
        public void SetEavesdropMode(bool enabled) { }

        /// <summary>Set quest topics for contextual dialogue.</summary>
        public void SetQuestTopics(System.Collections.Generic.List<object> topics) { }

        /// <summary>Set dialogue actions available to the player.</summary>
        public void SetDialogueActions(object[] actions, float playerEnergy) { }

        /// <summary>Update dialogue actions with current player energy.</summary>
        public void UpdateDialogueActions(float playerEnergy) { }

        /// <summary>Set quest offering context for NPC dialogue.</summary>
        public void SetQuestOfferingContext(object context) { }

        /// <summary>Set active quest context from this NPC.</summary>
        public void SetActiveQuestFromNPC(object context) { }

        /// <summary>Set quest guidance prompt for directed conversation.</summary>
        public void SetQuestGuidancePrompt(string prompt) { }

        /// <summary>Trigger quest guidance greeting from NPC.</summary>
        public void TriggerQuestGuidanceGreeting() { }

        /// <summary>Clean up resources.</summary>
        public void Dispose()
        {
            ClearMessages();
            if (_panel != null) Destroy(_panel);
        }

        private void ShowGesturePanel()
        {
            if (_gesturePanel != null) _gesturePanel.SetActive(true);
        }

        private void HideGesturePanel()
        {
            if (_gesturePanel != null) _gesturePanel.SetActive(false);
        }

        private void OnSendClicked()
        {
            if (_isStreaming) return;
            string text = _inputField.text.Trim();
            if (string.IsNullOrEmpty(text)) return;

            _inputField.text = "";
            AddUserMessage(text);

            // Start streaming response
            _isStreaming = true;
            var msgObj = CreateMessageBubble(false);
            _streamingMessageText = msgObj.GetComponentInChildren<TMP_Text>();
            _streamingMessageText.text = "";

            // Route through InsimulClient SDK — no Gemini fallback.
            // Legacy Gemini direct-fetch methods removed; all conversation routing
            // now goes through InsimulClient (WebSocket with SSE fallback handled by SDK).
            string playerMessage = text;
            string fullResponse = "";

            InsimulAIService.Instance?.SendMessage(
                _currentCharacterId,
                text,
                onChunk: chunk =>
                {
                    if (_streamingMessageText != null)
                        _streamingMessageText.text += chunk;
                    fullResponse += chunk;
                    ScrollToBottom();
                },
                onComplete: _ =>
                {
                    _isStreaming = false;
                    _streamingMessageText = null;
                    _inputField.ActivateInputField();

                    // Request metadata via SDK (fire-and-forget) instead of HTTP POST
                    RequestMetadataViaSDK(playerMessage, fullResponse);

                    // Fire conversational action event
                    OnConversationalAction?.Invoke(null, null);
                },
                onError: error =>
                {
                    _isStreaming = false;
                    if (_streamingMessageText != null)
                        _streamingMessageText.text = "Sorry, I cannot respond right now.";
                    _streamingMessageText = null;
                    Debug.LogError($"[ChatPanel] AI error: {error}");
                }
            );
        }

        private void AddUserMessage(string text)
        {
            var obj = CreateMessageBubble(true);
            obj.GetComponentInChildren<TMP_Text>().text = text;
            ScrollToBottom();
        }

        private void AddNPCMessage(string text)
        {
            var obj = CreateMessageBubble(false);
            obj.GetComponentInChildren<TMP_Text>().text = text;
            ScrollToBottom();
        }

        private GameObject CreateMessageBubble(bool isUser)
        {
            GameObject prefab = isUser ? _userMessagePrefab : _npcMessagePrefab;
            GameObject obj;

            if (prefab != null)
            {
                obj = Instantiate(prefab, _messageContainer);
            }
            else
            {
                // Fallback: create programmatic message bubble
                obj = new GameObject(isUser ? "UserMsg" : "NPCMsg");
                obj.transform.SetParent(_messageContainer, false);

                var layout = obj.AddComponent<HorizontalLayoutGroup>();
                layout.childForceExpandWidth = false;
                layout.childForceExpandHeight = false;
                layout.padding = new RectOffset(10, 10, 5, 5);
                layout.childAlignment = isUser ? TextAnchor.MiddleRight : TextAnchor.MiddleLeft;

                var bg = obj.AddComponent<Image>();
                bg.color = isUser ? new Color(0.2f, 0.4f, 0.8f, 0.9f) : new Color(0.25f, 0.25f, 0.3f, 0.9f);

                var textObj = new GameObject("Text");
                textObj.transform.SetParent(obj.transform, false);
                var tmp = textObj.AddComponent<TextMeshProUGUI>();
                tmp.fontSize = 14;
                tmp.color = Color.white;
                tmp.textWrappingMode = TextWrappingModes.Normal;

                var textLayout = textObj.AddComponent<LayoutElement>();
                textLayout.preferredWidth = 300;
                textLayout.flexibleWidth = 0;

                var fitter = obj.AddComponent<ContentSizeFitter>();
                fitter.horizontalFit = ContentSizeFitter.FitMode.PreferredSize;
                fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            }

            _messageObjects.Add(obj);
            return obj;
        }

        private void ClearMessages()
        {
            foreach (var obj in _messageObjects)
            {
                if (obj != null) Destroy(obj);
            }
            _messageObjects.Clear();
        }

        /// <summary>
        /// Request metadata via InsimulClient SDK instead of direct HTTP POST to /api/conversation/metadata.
        /// Processes goal evaluations through the quest bridge when available.
        /// </summary>
        private void RequestMetadataViaSDK(string playerMessage, string npcResponse)
        {
            if (string.IsNullOrEmpty(_targetLanguage)) return;

            // Include active quest objectives for conversation goal evaluation
            object[] activeObjectives = _questBridge?.GetObjectivesForEvaluation(_currentCharacterId);

            InsimulAIService.Instance?.RequestMetadata(
                playerMessage,
                npcResponse,
                _targetLanguage,
                activeObjectives,
                onResult: metadata =>
                {
                    if (metadata == null) return;

                    // Process conversation goal evaluations — complete quest objectives
                    var goalEvaluations = metadata.goalEvaluations;
                    if (goalEvaluations != null && goalEvaluations.Length > 0 && _questBridge != null)
                    {
                        _questBridge.ProcessEvaluations(goalEvaluations, _currentCharacterId, playerMessage);
                    }
                }
            );
        }

        private void ScrollToBottom()
        {
            Canvas.ForceUpdateCanvases();
            _scrollRect.verticalNormalizedPosition = 0f;
        }

        // ─── Programmatic UI Creation ───

        private void CreateUI()
        {
            // Root panel
            _panel = new GameObject("ChatPanel");
            _panel.transform.SetParent(transform, false);

            var canvas = GetComponentInParent<Canvas>();
            if (canvas == null)
            {
                canvas = gameObject.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvas.sortingOrder = 100;
                gameObject.AddComponent<CanvasScaler>();
                gameObject.AddComponent<GraphicRaycaster>();
            }

            var panelRect = _panel.AddComponent<RectTransform>();
            panelRect.anchorMin = new Vector2(0.6f, 0.05f);
            panelRect.anchorMax = new Vector2(0.98f, 0.95f);
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;

            var panelBg = _panel.AddComponent<Image>();
            panelBg.color = new Color(0.1f, 0.1f, 0.15f, 0.95f);

            var panelLayout = _panel.AddComponent<VerticalLayoutGroup>();
            panelLayout.padding = new RectOffset(8, 8, 8, 8);
            panelLayout.spacing = 6;
            panelLayout.childForceExpandWidth = true;
            panelLayout.childForceExpandHeight = false;

            // Header
            var headerObj = new GameObject("Header");
            headerObj.transform.SetParent(_panel.transform, false);
            var headerLayout = headerObj.AddComponent<HorizontalLayoutGroup>();
            headerLayout.childForceExpandWidth = false;
            headerLayout.spacing = 8;

            var headerLE = headerObj.AddComponent<LayoutElement>();
            headerLE.preferredHeight = 30;

            var nameObj = new GameObject("NPCName");
            nameObj.transform.SetParent(headerObj.transform, false);
            _headerText = nameObj.AddComponent<TextMeshProUGUI>();
            _headerText.fontSize = 18;
            _headerText.fontStyle = FontStyles.Bold;
            _headerText.color = Color.white;
            var nameLE = nameObj.AddComponent<LayoutElement>();
            nameLE.flexibleWidth = 1;

            var closeBtnObj = new GameObject("CloseBtn");
            closeBtnObj.transform.SetParent(headerObj.transform, false);
            var closeBg = closeBtnObj.AddComponent<Image>();
            closeBg.color = new Color(0.8f, 0.2f, 0.2f, 0.8f);
            _closeButton = closeBtnObj.AddComponent<Button>();
            var closeBtnLE = closeBtnObj.AddComponent<LayoutElement>();
            closeBtnLE.preferredWidth = 30;
            closeBtnLE.preferredHeight = 30;

            var closeTextObj = new GameObject("X");
            closeTextObj.transform.SetParent(closeBtnObj.transform, false);
            var closeTmp = closeTextObj.AddComponent<TextMeshProUGUI>();
            closeTmp.text = "X";
            closeTmp.fontSize = 16;
            closeTmp.alignment = TextAlignmentOptions.Center;
            closeTmp.color = Color.white;
            var closeTextRect = closeTextObj.GetComponent<RectTransform>();
            closeTextRect.anchorMin = Vector2.zero;
            closeTextRect.anchorMax = Vector2.one;
            closeTextRect.offsetMin = Vector2.zero;
            closeTextRect.offsetMax = Vector2.zero;

            // Scroll area
            var scrollObj = new GameObject("Scroll");
            scrollObj.transform.SetParent(_panel.transform, false);
            _scrollRect = scrollObj.AddComponent<ScrollRect>();
            var scrollLE = scrollObj.AddComponent<LayoutElement>();
            scrollLE.flexibleHeight = 1;
            scrollObj.AddComponent<Image>().color = new Color(0.05f, 0.05f, 0.1f, 0.5f);
            scrollObj.AddComponent<Mask>().showMaskGraphic = true;

            var contentObj = new GameObject("Content");
            contentObj.transform.SetParent(scrollObj.transform, false);
            _messageContainer = contentObj.AddComponent<RectTransform>();
            _messageContainer.anchorMin = new Vector2(0, 1);
            _messageContainer.anchorMax = new Vector2(1, 1);
            _messageContainer.pivot = new Vector2(0.5f, 1);
            _messageContainer.offsetMin = Vector2.zero;
            _messageContainer.offsetMax = Vector2.zero;

            var contentLayout = contentObj.AddComponent<VerticalLayoutGroup>();
            contentLayout.spacing = 4;
            contentLayout.padding = new RectOffset(4, 4, 4, 4);
            contentLayout.childForceExpandWidth = true;
            contentLayout.childForceExpandHeight = false;

            var contentFitter = contentObj.AddComponent<ContentSizeFitter>();
            contentFitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            _scrollRect.content = _messageContainer;
            _scrollRect.vertical = true;
            _scrollRect.horizontal = false;

            // Input area
            var inputArea = new GameObject("InputArea");
            inputArea.transform.SetParent(_panel.transform, false);
            var inputLayout = inputArea.AddComponent<HorizontalLayoutGroup>();
            inputLayout.spacing = 4;
            inputLayout.childForceExpandWidth = false;
            inputLayout.childForceExpandHeight = true;
            var inputLE = inputArea.AddComponent<LayoutElement>();
            inputLE.preferredHeight = 35;

            var inputObj = new GameObject("Input");
            inputObj.transform.SetParent(inputArea.transform, false);
            var inputBg = inputObj.AddComponent<Image>();
            inputBg.color = new Color(0.2f, 0.2f, 0.25f, 1f);
            _inputField = inputObj.AddComponent<TMP_InputField>();
            var inputFieldLE = inputObj.AddComponent<LayoutElement>();
            inputFieldLE.flexibleWidth = 1;

            var inputTextArea = new GameObject("TextArea");
            inputTextArea.transform.SetParent(inputObj.transform, false);
            var textAreaRect = inputTextArea.AddComponent<RectTransform>();
            textAreaRect.anchorMin = Vector2.zero;
            textAreaRect.anchorMax = Vector2.one;
            textAreaRect.offsetMin = new Vector2(5, 0);
            textAreaRect.offsetMax = new Vector2(-5, 0);

            var inputText = new GameObject("Text");
            inputText.transform.SetParent(inputTextArea.transform, false);
            var inputTmp = inputText.AddComponent<TextMeshProUGUI>();
            inputTmp.fontSize = 14;
            inputTmp.color = Color.white;
            var inputTextRect = inputText.GetComponent<RectTransform>();
            inputTextRect.anchorMin = Vector2.zero;
            inputTextRect.anchorMax = Vector2.one;
            inputTextRect.offsetMin = Vector2.zero;
            inputTextRect.offsetMax = Vector2.zero;
            _inputField.textComponent = inputTmp;
            _inputField.textViewport = textAreaRect;

            var sendObj = new GameObject("SendBtn");
            sendObj.transform.SetParent(inputArea.transform, false);
            var sendBg = sendObj.AddComponent<Image>();
            sendBg.color = new Color(0.2f, 0.6f, 0.3f, 1f);
            _sendButton = sendObj.AddComponent<Button>();
            var sendLE = sendObj.AddComponent<LayoutElement>();
            sendLE.preferredWidth = 60;

            var sendTextObj = new GameObject("Text");
            sendTextObj.transform.SetParent(sendObj.transform, false);
            var sendTmp = sendTextObj.AddComponent<TextMeshProUGUI>();
            sendTmp.text = "Send";
            sendTmp.fontSize = 14;
            sendTmp.alignment = TextAlignmentOptions.Center;
            sendTmp.color = Color.white;
            var sendTextRect = sendTextObj.GetComponent<RectTransform>();
            sendTextRect.anchorMin = Vector2.zero;
            sendTextRect.anchorMax = Vector2.one;
            sendTextRect.offsetMin = Vector2.zero;
            sendTextRect.offsetMax = Vector2.zero;
        }
    }
}
