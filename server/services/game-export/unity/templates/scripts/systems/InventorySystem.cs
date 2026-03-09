using System;
using System.Collections.Generic;
using System.Linq;
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
    /// Equipment slot types.
    /// </summary>
    public enum EquipmentSlot
    {
        None, Weapon, Armor, Accessory
    }

    /// <summary>
    /// A single inventory item with value/trade metadata and equipment support.
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
        public bool equipped;
        public EquipmentSlot equipSlot = EquipmentSlot.None;

        /// <summary>Effects map: keys like "attackPower", "defense", "health", "energy"</summary>
        public Dictionary<string, float> effects = new();
    }

    /// <summary>
    /// Player inventory with item stacks, gold, equipment slots, and mercantile support.
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
        public event Action<InventorySlot, EquipmentSlot> OnItemEquipped;
        public event Action<InventorySlot, EquipmentSlot> OnItemUnequipped;
        public event Action<int> OnGoldChanged;

        private List<InventorySlot> _slots = new();
        private Dictionary<EquipmentSlot, string> _equippedSlots = new();

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
            if (slot.equipped) return false; // Cannot drop equipped items
            var copy = slot;
            RemoveItem(itemId, 1);
            OnItemDropped?.Invoke(copy);
            return true;
        }

        public bool UseItem(string itemId)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            if (slot == null) return false;

            // Quest and key items: emit event without consuming
            if (slot.type == InsimulItemType.Quest || slot.type == InsimulItemType.Key)
            {
                OnItemUsed?.Invoke(slot);
                return true;
            }

            // Consumable, food, drink: apply effects and consume
            if (slot.type == InsimulItemType.Consumable ||
                slot.type == InsimulItemType.Food ||
                slot.type == InsimulItemType.Drink)
            {
                var copy = slot;
                RemoveItem(itemId, 1);
                OnItemUsed?.Invoke(copy);
                return true;
            }

            return false;
        }

        public int GetItemCount(string itemId)
        {
            var slot = _slots.Find(s => s.itemId == itemId);
            return slot?.count ?? 0;
        }

        public bool HasItem(string itemId) => _slots.Exists(s => s.itemId == itemId);

        public List<InventorySlot> GetAllItems() => new(_slots);

        // --- Equipment Management ---

        public bool EquipItem(string itemId)
        {
            var item = _slots.Find(s => s.itemId == itemId);
            if (item == null) return false;

            var slot = item.equipSlot != EquipmentSlot.None
                ? item.equipSlot
                : GetSlotForType(item.type);
            if (slot == EquipmentSlot.None) return false;

            // Unequip any existing item in the slot
            UnequipSlot(slot);

            item.equipped = true;
            _equippedSlots[slot] = itemId;
            OnItemEquipped?.Invoke(item, slot);
            return true;
        }

        public bool UnequipSlot(EquipmentSlot slot)
        {
            if (!_equippedSlots.TryGetValue(slot, out var itemId)) return false;

            var item = _slots.Find(s => s.itemId == itemId);
            if (item != null)
            {
                item.equipped = false;
                OnItemUnequipped?.Invoke(item, slot);
            }
            _equippedSlots.Remove(slot);
            return true;
        }

        public InventorySlot GetEquippedItem(EquipmentSlot slot)
        {
            if (_equippedSlots.TryGetValue(slot, out var itemId))
                return _slots.Find(s => s.itemId == itemId);
            return null;
        }

        public bool HasEquippedInSlot(EquipmentSlot slot) => _equippedSlots.ContainsKey(slot);

        private EquipmentSlot GetSlotForType(InsimulItemType type)
        {
            return type switch
            {
                InsimulItemType.Weapon => EquipmentSlot.Weapon,
                InsimulItemType.Armor => EquipmentSlot.Armor,
                InsimulItemType.Tool => EquipmentSlot.Accessory,
                _ => EquipmentSlot.None
            };
        }

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
