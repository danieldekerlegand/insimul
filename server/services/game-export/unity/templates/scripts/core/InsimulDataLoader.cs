using UnityEngine;
using Insimul.Data;

namespace Insimul.Core
{
    /// <summary>
    /// Static utility for loading individual data files from Resources/Data.
    /// </summary>
    public static class InsimulDataLoader
    {
        public static T[] LoadArray<T>(string resourcePath)
        {
            var json = Resources.Load<TextAsset>(resourcePath);
            if (json == null)
            {
                Debug.LogWarning($"[Insimul] Could not load: Resources/{resourcePath}");
                return new T[0];
            }
            // Unity's JsonUtility doesn't support top-level arrays,
            // so we wrap in a helper
            string wrapped = "{\"items\":" + json.text + "}";
            var wrapper = JsonUtility.FromJson<ArrayWrapper<T>>(wrapped);
            return wrapper.items;
        }

        [System.Serializable]
        private class ArrayWrapper<T>
        {
            public T[] items;
        }
    }
}
