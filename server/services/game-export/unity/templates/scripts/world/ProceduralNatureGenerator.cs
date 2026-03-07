using UnityEngine;

namespace Insimul.World
{
    public class ProceduralNatureGenerator : MonoBehaviour
    {
        public void GenerateNature(int terrainSize, string seed)
        {
            // TODO: Scatter vegetation using random positions + instancing
            Debug.Log($"[Insimul] ProceduralNatureGenerator — terrain: {terrainSize}, seed: {seed}");
        }
    }
}
