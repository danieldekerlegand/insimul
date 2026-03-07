using System.Collections.Generic;
using UnityEngine;

namespace Insimul.Systems
{
    [System.Serializable]
    public class CraftingRecipe
    {
        public string id;
        public string name;
        public string[] inputItemIds;
        public int[] inputCounts;
        public string outputItemId;
        public int outputCount = 1;
    }

    public class CraftingSystem : MonoBehaviour
    {
        private List<CraftingRecipe> _recipes = new();

        public bool CanCraft(string recipeId)
        {
            var recipe = _recipes.Find(r => r.id == recipeId);
            if (recipe == null) return false;
            var inv = FindObjectOfType<InventorySystem>();
            if (inv == null) return false;
            for (int i = 0; i < recipe.inputItemIds.Length; i++)
            {
                if (inv.GetItemCount(recipe.inputItemIds[i]) < recipe.inputCounts[i])
                    return false;
            }
            return true;
        }

        public bool Craft(string recipeId)
        {
            if (!CanCraft(recipeId)) return false;
            var recipe = _recipes.Find(r => r.id == recipeId);
            var inv = FindObjectOfType<InventorySystem>();
            for (int i = 0; i < recipe.inputItemIds.Length; i++)
                inv.RemoveItem(recipe.inputItemIds[i], recipe.inputCounts[i]);
            inv.AddItem(recipe.outputItemId, recipe.outputCount);
            Debug.Log($"[Insimul] Crafted: {recipe.name}");
            return true;
        }
    }
}
