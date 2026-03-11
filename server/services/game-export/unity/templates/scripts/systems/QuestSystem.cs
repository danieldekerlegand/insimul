using System;
using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    /// <summary>
    /// Quest objective data mirroring Insimul's QuestObjective interface.
    /// </summary>
    [Serializable]
    public class QuestObjective
    {
        public string id;
        public string questId;
        public string type;
        public string description;
        public bool completed;
        public int requiredCount = 1;
        public int currentCount;

        /// <summary>Time limit in seconds (0 = untimed).</summary>
        public float timeLimitSeconds;

        /// <summary>Game-time when objective was started (-1 = not started).</summary>
        public float startedAt = -1f;

        /// <summary>Number of English hints requested (navigation/directions).</summary>
        public int hintsRequested;

        /// <summary>Whether a GPS-style waypoint is currently shown.</summary>
        public bool showWaypoint;

        /// <summary>Vocabulary category for scavenger hunt rotation.</summary>
        public string vocabularyCategory;
    }

    public class QuestSystem : MonoBehaviour
    {
        public event Action<string, string> OnStoryTTS;

        /// <summary>Scavenger hunt categories for vocabulary rotation.</summary>
        public static readonly string[] SCAVENGER_CATEGORIES = {
            "food", "colors", "animals", "clothing", "household",
            "nature", "body", "professions", "transportation", "weather"
        };

        private List<InsimulQuestData> _allQuests = new();
        private List<string> _activeQuestIds = new();
        private HashSet<string> _completedQuestIds = new();
        private List<QuestObjective> _objectives = new();
        private float _gameTime;

        public int QuestCount => _allQuests.Count;
        public int ActiveCount => _activeQuestIds.Count;

        private void Update()
        {
            _gameTime += Time.deltaTime;
        }

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

        public bool CompleteObjective(string questId, string objectiveId)
        {
            var obj = _objectives.Find(o => o.questId == questId && o.id == objectiveId);
            if (obj == null || obj.completed) return false;
            obj.completed = true;
            Debug.Log($"[Insimul] Objective completed: {questId}/{objectiveId}");
            return true;
        }

        /// <summary>Check timed objectives and return descriptions of expired ones.</summary>
        public List<string> CheckTimedObjectives()
        {
            var expired = new List<string>();
            foreach (var obj in _objectives)
            {
                if (obj.completed) continue;
                if (obj.timeLimitSeconds <= 0f || obj.startedAt < 0f) continue;

                float elapsed = _gameTime - obj.startedAt;
                if (elapsed > obj.timeLimitSeconds)
                {
                    obj.completed = true;
                    expired.Add($"Time expired: {obj.description}");
                    Debug.Log($"[Insimul] Timed objective expired: {obj.id}");
                }
            }
            return expired;
        }

        /// <summary>Get remaining seconds for a timed objective, or -1 if untimed.</summary>
        public float GetObjectiveTimeRemaining(string objectiveId)
        {
            var obj = _objectives.Find(o => o.id == objectiveId);
            if (obj != null && obj.timeLimitSeconds > 0f && obj.startedAt >= 0f)
            {
                float elapsed = _gameTime - obj.startedAt;
                return Mathf.Max(0f, obj.timeLimitSeconds - elapsed);
            }
            return -1f;
        }

        /// <summary>Request a GPS-style waypoint hint. Returns English hint or null.</summary>
        public string RequestNavigationHint(string questId = null)
        {
            foreach (var obj in _objectives)
            {
                if (obj.completed) continue;
                if (!string.IsNullOrEmpty(questId) && obj.questId != questId) continue;
                if (obj.type != "navigate_language" && obj.type != "follow_directions") continue;

                obj.hintsRequested++;
                obj.showWaypoint = true;
                Debug.Log($"[Insimul] Navigation hint #{obj.hintsRequested} for {obj.id}");
                return obj.description;
            }
            return null;
        }

        /// <summary>Get next scavenger hunt category (round-robin).</summary>
        public static string GetNextScavengerCategory(int lastCategoryIndex)
        {
            int next = (lastCategoryIndex + 1) % SCAVENGER_CATEGORIES.Length;
            return SCAVENGER_CATEGORIES[next];
        }

        public InsimulQuestData GetQuest(string id) => _allQuests.Find(q => q.id == id);
        public List<InsimulQuestData> GetActiveQuests() =>
            _allQuests.FindAll(q => _activeQuestIds.Contains(q.id));
    }
}
