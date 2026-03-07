using System.Collections.Generic;
using UnityEngine;

namespace Insimul.Systems
{
    [System.Serializable]
    public class InventorySlot
    {
        public string itemId;
        public int count;
    }

    public class InventorySystem : MonoBehaviour
    {
        public int maxSlots = 20;
        private List<InventorySlot> _slots = new();

        public bool AddItem(string itemId, int count = 1)
        {
            var existing = _slots.Find(s => s.itemId == itemId);
            if (existing != null)
            {
                existing.count += count;
                return true;
            }
            if (_slots.Count >= maxSlots) return false;
            _slots.Add(new InventorySlot { itemId = itemId, count = count });
            return true;
        }

        public bool RemoveItem(string itemId, int count = 1)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            if (slot == null || slot.count < count) return false;
            slot.count -= count;
            if (slot.count <= 0) _slots.Remove(slot);
            return true;
        }

        public int GetItemCount(string itemId)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            return slot?.count ?? 0;
        }

        public List<InventorySlot> GetAllItems() => new(_slots);
    }
}
