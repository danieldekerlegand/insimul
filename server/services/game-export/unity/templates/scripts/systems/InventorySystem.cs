using System;
using System.Collections.Generic;
using UnityEngine;

namespace Insimul.Systems
{
    /// <summary>
    /// Item types matching Insimul's shared ItemType enum.
    /// </summary>
    public enum InsimulItemType
    {
        Quest, Collectible, Key, Consumable,
        Weapon, Armor, Food, Drink, Material, Tool
    }

    /// <summary>
    /// A single inventory item with value/trade metadata.
    /// </summary>
    [System.Serializable]
    public class InventorySlot
    {
        public string itemId;
        public string name;
        public string description;
        public InsimulItemType type = InsimulItemType.Collectible;
        public int count;
        public int value;
        public int sellValue;
        public float weight;
        public bool tradeable = true;
        public string questId;
    }

    /// <summary>
    /// Player inventory with item stacks, gold, and mercantile support.
    /// Ported from Insimul's Babylon.js InventorySystem.
    /// </summary>
    public class InventorySystem : MonoBehaviour
    {
        public int maxSlots = 20;
        public int playerGold = 100;

        public event Action<string, int> OnItemAdded;
        public event Action<string, int> OnItemRemoved;
        public event Action<InventorySlot> OnItemDropped;
        public event Action<InventorySlot> OnItemUsed;
        public event Action<int> OnGoldChanged;

        private List<InventorySlot> _slots = new();

        // --- Item Management ---

        public bool AddItem(InventorySlot item)
        {
            var existing = _slots.Find(s => s.itemId == item.itemId);
            if (existing != null)
            {
                existing.count += item.count;
            }
            else
            {
                if (_slots.Count >= maxSlots) return false;
                _slots.Add(item);
            }
            OnItemAdded?.Invoke(item.itemId, item.count);
            return true;
        }

        public bool AddItem(string itemId, int count = 1)
        {
            return AddItem(new InventorySlot { itemId = itemId, name = itemId, count = count });
        }

        public bool RemoveItem(string itemId, int count = 1)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            if (slot == null || slot.count < count) return false;
            slot.count -= count;
            if (slot.count <= 0) _slots.Remove(slot);
            OnItemRemoved?.Invoke(itemId, count);
            return true;
        }

        public bool DropItem(string itemId)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            if (slot == null) return false;
            if (slot.type == InsimulItemType.Quest) return false; // Cannot drop quest items
            var copy = slot;
            RemoveItem(itemId, 1);
            OnItemDropped?.Invoke(copy);
            return true;
        }

        public bool UseItem(string itemId)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            if (slot == null) return false;
            if (slot.type != InsimulItemType.Consumable) return false;
            var copy = slot;
            RemoveItem(itemId, 1);
            OnItemUsed?.Invoke(copy);
            return true;
        }

        public int GetItemCount(string itemId)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            return slot?.count ?? 0;
        }

        public bool HasItem(string itemId) => _slots.Exists(s => s.itemId == itemId);

        public List<InventorySlot> GetAllItems() => new(_slots);

        // --- Gold Management ---

        public int GetGold() => playerGold;

        public void SetGold(int amount)
        {
            playerGold = Mathf.Max(0, amount);
            OnGoldChanged?.Invoke(playerGold);
        }

        public void AddGold(int amount)
        {
            playerGold += amount;
            OnGoldChanged?.Invoke(playerGold);
        }

        public bool RemoveGold(int amount)
        {
            if (playerGold < amount) return false;
            playerGold -= amount;
            OnGoldChanged?.Invoke(playerGold);
            return true;
        }
    }
}
