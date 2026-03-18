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

        /// <summary>Target words for vocabulary objectives (empty = any word counts).</summary>
        public List<string> targetWords = new();

        /// <summary>Words already used (for deduplication).</summary>
        public List<string> wordsUsed = new();
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

        /// <summary>Track vocabulary usage for use_vocabulary / collect_vocabulary objectives.</summary>
        public void TrackVocabularyUsage(string word, string questId = null)
        {
            string lowerWord = word.ToLower();

            foreach (var obj in _objectives)
            {
                if (obj.completed) continue;
                if (!string.IsNullOrEmpty(questId) && obj.questId != questId) continue;
                if (obj.type != "use_vocabulary" && obj.type != "collect_vocabulary") continue;

                // If targetWords specified, only count matching words
                if (obj.targetWords.Count > 0 && !obj.targetWords.Contains(lowerWord)) continue;

                // Don't double-count the same word
                if (obj.wordsUsed.Contains(lowerWord)) continue;

                obj.wordsUsed.Add(lowerWord);
                obj.currentCount++;

                if (obj.currentCount >= (obj.requiredCount > 0 ? obj.requiredCount : 10))
                {
                    CompleteObjective(obj.questId, obj.id);
                }
            }
        }

        /// <summary>Track a conversation turn for complete_conversation objectives.</summary>
        public void TrackConversationTurn(string[] keywords = null, string questId = null)
        {
            foreach (var obj in _objectives)
            {
                if (obj.completed) continue;
                if (!string.IsNullOrEmpty(questId) && obj.questId != questId) continue;
                if (obj.type != "complete_conversation") continue;

                // Every conversation turn counts as progress
                obj.currentCount++;

                if (obj.currentCount >= (obj.requiredCount > 0 ? obj.requiredCount : 5))
                {
                    CompleteObjective(obj.questId, obj.id);
                }
            }
        }

        /// <summary>Track a pronunciation attempt for pronunciation_check objectives.</summary>
        /// <param name="score">Pronunciation accuracy score (0-100)</param>
        public void TrackPronunciationAttempt(bool passed, float score = 0f, string questId = null)
        {
            if (!passed) return;

            foreach (var obj in _objectives)
            {
                if (obj.completed) continue;
                if (!string.IsNullOrEmpty(questId) && obj.questId != questId) continue;
                if (obj.type != "pronunciation_check") continue;

                obj.currentCount++;

                if (obj.currentCount >= (obj.requiredCount > 0 ? obj.requiredCount : 3))
                {
                    CompleteObjective(obj.questId, obj.id);
                }
            }
        }

        /// <summary>
        /// Register a building-check callback so spawned items avoid building interiors.
        /// The callback receives world-space (x, z) and returns true if inside a building.
        /// </summary>
        public void SetPointInBuildingCheck(Func<float, float, bool> check)
        {
            _pointInBuildingCheck = check;
        }

        /// <summary>Generate spread-out item positions that avoid building interiors.</summary>
        public List<Vector3> GenerateItemPositions(int count)
        {
            var positions = new List<Vector3>();
            float radius = 30f;

            for (int i = 0; i < count; i++)
            {
                float x = 0f, z = 0f;
                for (int attempt = 0; attempt < 8; attempt++)
                {
                    float angle = (Mathf.PI * 2f * i) / count + UnityEngine.Random.Range(0f, 0.5f);
                    float dist = 10f + UnityEngine.Random.Range(0f, radius);
                    x = Mathf.Cos(angle) * dist;
                    z = Mathf.Sin(angle) * dist;
                    if (_pointInBuildingCheck == null || !_pointInBuildingCheck(x, z))
                        break;
                }
                positions.Add(new Vector3(x, 0.5f, z));
            }
            return positions;
        }

        /// <summary>Generate a single location position that avoids building interiors.</summary>
        public Vector3 GenerateLocationPosition()
        {
            for (int attempt = 0; attempt < 8; attempt++)
            {
                float angle = UnityEngine.Random.Range(0f, Mathf.PI * 2f);
                float dist = 20f + UnityEngine.Random.Range(0f, 20f);
                float x = Mathf.Cos(angle) * dist;
                float z = Mathf.Sin(angle) * dist;
                if (_pointInBuildingCheck == null || !_pointInBuildingCheck(x, z))
                    return new Vector3(x, 0f, z);
            }
            // Fallback — push farther out
            float fallbackAngle = UnityEngine.Random.Range(0f, Mathf.PI * 2f);
            float fallbackDist = 40f + UnityEngine.Random.Range(0f, 10f);
            return new Vector3(Mathf.Cos(fallbackAngle) * fallbackDist, 0f, Mathf.Sin(fallbackAngle) * fallbackDist);
        }

        public InsimulQuestData GetQuest(string id) => _allQuests.Find(q => q.id == id);
        public List<InsimulQuestData> GetActiveQuests() =>
            _allQuests.FindAll(q => _activeQuestIds.Contains(q.id));

        private Func<float, float, bool> _pointInBuildingCheck;
    }
}
