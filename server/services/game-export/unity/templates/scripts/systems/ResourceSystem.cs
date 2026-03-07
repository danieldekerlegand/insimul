using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class ResourceSystem : MonoBehaviour
    {
        private List<ResourceDefData> _definitions = new();

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.resources?.definitions == null) return;
            _definitions.AddRange(worldData.resources.definitions);
            Debug.Log($"[Insimul] ResourceSystem loaded {_definitions.Count} resource types");
        }

        public bool GatherResource(string resourceId)
        {
            var def = _definitions.Find(d => d.id == resourceId);
            if (def == null) return false;
            var inv = FindObjectOfType<InventorySystem>();
            if (inv == null) return false;
            inv.AddItem(resourceId, 1);
            Debug.Log($"[Insimul] Gathered: {def.name}");
            return true;
        }
    }
}
