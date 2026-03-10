using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulNPCData
    {
        public string characterId;
        public string role;
        public Vec3Data homePosition;
        public float patrolRadius = 20f;
        public float disposition = 50f;
        public string settlementId;
        public string[] questIds;
        public string greeting;
    }

    [Serializable]
    public class Vec3Data
    {
        public float x;
        public float y;
        public float z;

        public Vector3 ToVector3() => new Vector3(x, y, z);
    }
}
