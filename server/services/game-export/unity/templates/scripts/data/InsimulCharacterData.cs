using System;
using System.Collections.Generic;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulCharacterData
    {
        public string id;
        public string firstName;
        public string middleName;
        public string lastName;
        public string suffix;
        public string gender;
        public bool isAlive = true;
        public string occupation;
        public string currentLocation;
        public string status;
        public int birthYear;
        public PersonalityData personality;
        public string[] coworkerIds;
        public string[] friendIds;
        public string spouseId;
    }

    [Serializable]
    public class PersonalityData
    {
        public float openness;
        public float conscientiousness;
        public float extroversion;
        public float agreeableness;
        public float neuroticism;
    }
}
