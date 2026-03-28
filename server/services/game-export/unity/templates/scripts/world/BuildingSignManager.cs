using System.Globalization;
using UnityEngine;
using TMPro;
using Insimul.Data;

namespace Insimul.World
{
    public class BuildingSignManager : MonoBehaviour
    {
        public void GenerateSigns(InsimulWorldIR worldData)
        {
            if (worldData?.entities?.buildings == null) return;

            foreach (var building in worldData.entities.buildings)
            {
                if (string.IsNullOrEmpty(building.buildingRole)) continue;

                GameObject parent = GameObject.Find($"Building_{building.id}");
                if (parent == null) continue;

                string displayName = FormatRoleName(building.buildingRole);
                float height = building.floors * 3f + 3f;

                var signObj = new GameObject($"Sign_{building.id}");
                signObj.transform.SetParent(parent.transform, false);
                signObj.transform.localPosition = new Vector3(0f, height + 1.5f, 0f);
                signObj.transform.localScale = new Vector3(0.5f, 0.5f, 0.5f);

                var tmp = signObj.AddComponent<TextMeshPro>();
                tmp.text = displayName;
                tmp.fontSize = 6;
                tmp.alignment = TextAlignmentOptions.Center;
                tmp.color = new Color(0.95f, 0.9f, 0.8f);

                signObj.AddComponent<BillboardText>();
            }

            Debug.Log($"[Insimul] BuildingSignManager: generated {worldData.entities.buildings.Length} sign checks");
        }

        private static string FormatRoleName(string role)
        {
            if (string.IsNullOrEmpty(role)) return role;
            string spaced = role.Replace('_', ' ');
            return CultureInfo.InvariantCulture.TextInfo.ToTitleCase(spaced);
        }

        public class BillboardText : MonoBehaviour
        {
            private void LateUpdate()
            {
                if (Camera.main != null)
                    transform.rotation = Quaternion.LookRotation(transform.position - Camera.main.transform.position);
            }
        }
    }
}
