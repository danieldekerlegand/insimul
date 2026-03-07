using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class QuestSystem : MonoBehaviour
    {
        private List<InsimulQuestData> _allQuests = new();
        private List<string> _activeQuestIds = new();
        private HashSet<string> _completedQuestIds = new();

        public int QuestCount => _allQuests.Count;
        public int ActiveCount => _activeQuestIds.Count;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.systems?.quests == null) return;
            _allQuests.AddRange(worldData.systems.quests);
            Debug.Log($"[Insimul] QuestSystem loaded {_allQuests.Count} quests");
        }

        public bool AcceptQuest(string questId)
        {
            var quest = _allQuests.Find(q => q.id == questId);
            if (quest == null || _activeQuestIds.Contains(questId)) return false;
            _activeQuestIds.Add(questId);
            Debug.Log($"[Insimul] Quest accepted: {quest.title}");
            return true;
        }

        public bool CompleteQuest(string questId)
        {
            if (!_activeQuestIds.Contains(questId)) return false;
            _activeQuestIds.Remove(questId);
            _completedQuestIds.Add(questId);
            Debug.Log($"[Insimul] Quest completed: {questId}");
            return true;
        }

        public InsimulQuestData GetQuest(string id) => _allQuests.Find(q => q.id == id);
        public List<InsimulQuestData> GetActiveQuests() =>
            _allQuests.FindAll(q => _activeQuestIds.Contains(q.id));
    }
}
