using System;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulQuestData
    {
        public string id;
        public string title;
        public string description;
        public string questType;
        public string difficulty;
        public int experienceReward;
        public string assignedByCharacterId;
        public string status;
        public string[] tags;
        public string[] prerequisiteQuestIds;
        public InsimulQuestObjective[] objectives;
    }

    [Serializable]
    public class InsimulQuestObjective
    {
        public string id;
        public string description;
        public string objectiveType;
        public bool isOptional;
        public int currentProgress;
        public int targetProgress = 1;
    }
}
