using UnityEngine;
using Insimul.Data;
using Insimul.Services;
using Insimul.UI;

namespace Insimul.Systems
{
    public class DialogueSystem : MonoBehaviour
    {
        public bool IsInDialogue { get; private set; }
        public string CurrentNPCId { get; private set; }

        public System.Action<string> OnDialogueStarted;
        public System.Action OnDialogueEnded;

        private ChatPanel _chatPanel;
        private InsimulAIConfig _aiConfig;
        private InsimulDialogueContext[] _contexts;

        private void Start()
        {
            LoadDialogueData();

            _chatPanel = FindObjectOfType<ChatPanel>();
            if (_chatPanel == null)
            {
                var panelObj = new GameObject("InsimulChatPanel");
                _chatPanel = panelObj.AddComponent<ChatPanel>();
            }

            if (InsimulAIService.Instance == null)
            {
                var serviceObj = new GameObject("InsimulAIService");
                serviceObj.AddComponent<InsimulAIService>();
            }

            if (_aiConfig != null)
            {
                InsimulAIService.Instance.Initialize(_aiConfig, _contexts);
            }
        }

        private void LoadDialogueData()
        {
            var configAsset = Resources.Load<TextAsset>("Data/AIConfig");
            if (configAsset != null)
            {
                _aiConfig = JsonUtility.FromJson<InsimulAIConfig>(configAsset.text);
                Debug.Log($"[Insimul] AI config loaded: mode={_aiConfig.apiMode}");
            }
            else
            {
                _aiConfig = new InsimulAIConfig();
                Debug.LogWarning("[Insimul] AIConfig.json not found, using defaults");
            }

            var contextAsset = Resources.Load<TextAsset>("Data/DialogueContexts");
            if (contextAsset != null)
            {
                string wrappedJson = "{\"items\":" + contextAsset.text + "}";
                var list = JsonUtility.FromJson<InsimulDialogueContextList>(wrappedJson);
                _contexts = list?.items ?? new InsimulDialogueContext[0];
                Debug.Log($"[Insimul] Loaded {_contexts.Length} dialogue contexts");
            }
            else
            {
                _contexts = new InsimulDialogueContext[0];
                Debug.LogWarning("[Insimul] DialogueContexts.json not found");
            }
        }

        public void StartDialogue(string npcCharacterId)
        {
            if (IsInDialogue) EndDialogue();

            IsInDialogue = true;
            CurrentNPCId = npcCharacterId;
            OnDialogueStarted?.Invoke(npcCharacterId);

            _chatPanel?.Open(npcCharacterId);
            Debug.Log($"[Insimul] Dialogue started with NPC: {npcCharacterId}");
        }

        public void EndDialogue()
        {
            var npcId = CurrentNPCId;
            IsInDialogue = false;
            CurrentNPCId = null;
            OnDialogueEnded?.Invoke();

            _chatPanel?.Close();
            Debug.Log($"[Insimul] Dialogue ended with NPC: {npcId}");
        }
    }
}
