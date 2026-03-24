using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    /// <summary>
    /// Generates road meshes from IR data. Builds procedural ribbon meshes
    /// along waypoints for both street segments and inter-settlement roads.
    /// Each road gets a MeshFilter, MeshRenderer, and MeshCollider.
    /// </summary>
    public class RoadGenerator : MonoBehaviour
    {
        public Color roadColor = new Color({{ROAD_COLOR_R}}f, {{ROAD_COLOR_G}}f, {{ROAD_COLOR_B}}f);
        public float roadWidth = {{ROAD_WIDTH}}f;

        [Tooltip("Height offset above terrain to prevent z-fighting")]
        public float roadElevation = 0.05f;

        private Material _roadMaterial;

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            int streetCount = 0;
            int roadCount = 0;

            _roadMaterial = new Material(Shader.Find("Unlit/Color"));
            _roadMaterial.color = roadColor;

            // Generate named streets from settlement street networks
            if (worldData?.geography?.settlements != null)
            {
                foreach (var settlement in worldData.geography.settlements)
                {
                    if (settlement.streetNetwork?.segments == null) continue;
                    foreach (var segment in settlement.streetNetwork.segments)
                    {
                        if (segment.waypoints == null || segment.waypoints.Length < 2) continue;
                        float w = segment.width > 0 ? segment.width : roadWidth;
                        var points = Vec3ArrayToPositions(segment.waypoints);
                        CreateRoadMesh($"Street_{segment.name}_{segment.id}", points, w);
                        streetCount++;
                    }
                }
            }

            // Generate inter-settlement roads
            if (worldData?.entities?.buildings != null)
            {
                var irJson = Resources.Load<TextAsset>("Data/roads");
                if (irJson != null)
                {
                    var roads = JsonUtility.FromJson<RoadArray>("{\"items\":" + irJson.text + "}");
                    if (roads?.items != null)
                    {
                        foreach (var road in roads.items)
                        {
                            if (road.waypoints != null && road.waypoints.Length >= 2)
                            {
                                float w = road.width > 0 ? road.width : roadWidth;
                                var points = Vec3ArrayToPositions(road.waypoints);
                                CreateRoadMesh($"Road_{roadCount}", points, w);
                                roadCount++;
                            }
                        }
                    }
                }
            }

            Debug.Log($"[Insimul] Roads: {streetCount} street segments, {roadCount} inter-settlement roads");
        }

        public void GenerateRoad(Vector3 from, Vector3 to, float width)
        {
            if (_roadMaterial == null)
            {
                _roadMaterial = new Material(Shader.Find("Unlit/Color"));
                _roadMaterial.color = roadColor;
            }
            var points = new Vector3[] { from + Vector3.up * roadElevation, to + Vector3.up * roadElevation };
            CreateRoadMesh("Road", points, width);
        }

        private Vector3[] Vec3ArrayToPositions(Vec3Data[] data)
        {
            var positions = new Vector3[data.Length];
            for (int i = 0; i < data.Length; i++)
            {
                positions[i] = data[i].ToVector3() + Vector3.up * roadElevation;
            }
            return positions;
        }

        private void CreateRoadMesh(string name, Vector3[] waypoints, float width)
        {
            var roadObj = new GameObject(name);
            roadObj.transform.SetParent(transform);

            var mesh = BuildRibbonMesh(waypoints, width);

            var mf = roadObj.AddComponent<MeshFilter>();
            mf.mesh = mesh;

            var mr = roadObj.AddComponent<MeshRenderer>();
            mr.sharedMaterial = _roadMaterial;
            mr.receiveShadows = true;
            mr.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;

            var mc = roadObj.AddComponent<MeshCollider>();
            mc.sharedMesh = mesh;
        }

        /// <summary>
        /// Builds a flat ribbon mesh along a polyline path. For each waypoint,
        /// two vertices are placed perpendicular to the path direction at +/- width/2.
        /// Triangles connect consecutive pairs to form quads.
        /// </summary>
        public static Mesh BuildRibbonMesh(Vector3[] waypoints, float width)
        {
            int n = waypoints.Length;
            var vertices = new Vector3[n * 2];
            var uvs = new Vector2[n * 2];
            var normals = new Vector3[n * 2];

            float halfWidth = width * 0.5f;
            float cumulativeLength = 0f;

            for (int i = 0; i < n; i++)
            {
                // Compute the tangent direction at this waypoint
                Vector3 forward;
                if (i == 0)
                    forward = (waypoints[1] - waypoints[0]).normalized;
                else if (i == n - 1)
                    forward = (waypoints[n - 1] - waypoints[n - 2]).normalized;
                else
                    forward = (waypoints[i + 1] - waypoints[i - 1]).normalized;

                // If forward is zero (duplicate points), use a fallback
                if (forward.sqrMagnitude < 0.0001f)
                    forward = Vector3.forward;

                // Perpendicular in the XZ plane (roads are flat ribbons)
                Vector3 right = new Vector3(forward.z, 0f, -forward.x).normalized;

                // If right is degenerate (vertical path), fall back
                if (right.sqrMagnitude < 0.0001f)
                    right = Vector3.right;

                vertices[i * 2]     = waypoints[i] - right * halfWidth;
                vertices[i * 2 + 1] = waypoints[i] + right * halfWidth;

                normals[i * 2]     = Vector3.up;
                normals[i * 2 + 1] = Vector3.up;

                // Accumulate length for UV mapping
                if (i > 0)
                    cumulativeLength += Vector3.Distance(waypoints[i], waypoints[i - 1]);

                float v = cumulativeLength / width; // tile UVs proportionally
                uvs[i * 2]     = new Vector2(0f, v);
                uvs[i * 2 + 1] = new Vector2(1f, v);
            }

            // Build triangle indices: two triangles per segment
            int segmentCount = n - 1;
            var triangles = new int[segmentCount * 6];
            for (int i = 0; i < segmentCount; i++)
            {
                int bl = i * 2;
                int br = i * 2 + 1;
                int tl = (i + 1) * 2;
                int tr = (i + 1) * 2 + 1;

                triangles[i * 6]     = bl;
                triangles[i * 6 + 1] = tl;
                triangles[i * 6 + 2] = br;
                triangles[i * 6 + 3] = br;
                triangles[i * 6 + 4] = tl;
                triangles[i * 6 + 5] = tr;
            }

            var mesh = new Mesh();
            mesh.name = "RoadMesh";
            mesh.vertices = vertices;
            mesh.triangles = triangles;
            mesh.uv = uvs;
            mesh.normals = normals;
            mesh.RecalculateBounds();

            return mesh;
        }

        [System.Serializable]
        private class RoadArray { public RoadEntry[] items; }

        [System.Serializable]
        private class RoadEntry
        {
            public string fromId;
            public string toId;
            public float width;
            public Vec3Data[] waypoints;
        }
    }
}
