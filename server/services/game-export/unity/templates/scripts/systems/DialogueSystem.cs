using UnityEngine;

namespace Insimul.Systems
{
    public class DialogueSystem : MonoBehaviour
    {
        public bool IsInDialogue { get; private set; }
        public string CurrentNPCId { get; private set; }

        public System.Action<string> OnDialogueStarted;
        public System.Action OnDialogueEnded;

        public void StartDialogue(string npcCharacterId)
        {
            IsInDialogue = true;
            CurrentNPCId = npcCharacterId;
            OnDialogueStarted?.Invoke(npcCharacterId);
            Debug.Log($"[Insimul] Dialogue started with NPC: {npcCharacterId}");
        }

        public void EndDialogue()
        {
            var npcId = CurrentNPCId;
            IsInDialogue = false;
            CurrentNPCId = null;
            OnDialogueEnded?.Invoke();
            Debug.Log($"[Insimul] Dialogue ended with NPC: {npcId}");
        }
    }
}
