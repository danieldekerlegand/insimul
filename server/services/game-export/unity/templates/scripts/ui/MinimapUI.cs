using UnityEngine;
using UnityEngine.UI;
using Insimul.Core;
using Insimul.Characters;

namespace Insimul.UI
{
    public class MinimapUI : MonoBehaviour
    {
        private const float MapSize = 150f;
        private const float Margin = 10f;
        private const float NpcUpdateInterval = 0.5f;

        private RectTransform _mapContent;
        private RectTransform _playerMarker;
        private InsimulPlayerController _player;
        private bool _visible = true;
        private GameObject _container;

        private Transform[] _npcTransforms;
        private RectTransform[] _npcMarkers;
        private float _npcUpdateTimer;
        private float _scale;

        private void Start()
        {
            var worldData = InsimulGameManager.Instance?.WorldData;
            float terrainSize = worldData?.terrainSize ?? 500f;
            _scale = MapSize / terrainSize;

            _player = FindFirstObjectByType<InsimulPlayerController>();

            Canvas canvas = FindFirstObjectByType<Canvas>();
            if (canvas == null)
            {
                var canvasGo = new GameObject("MinimapCanvas");
                canvas = canvasGo.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvas.sortingOrder = 50;
                canvasGo.AddComponent<CanvasScaler>();
                canvasGo.AddComponent<GraphicRaycaster>();
            }

            BuildUI(canvas.transform);
            PopulateMarkers(worldData);
            InitNpcTracking();
        }

        private void BuildUI(Transform canvasRoot)
        {
            _container = new GameObject("MinimapContainer");
            _container.transform.SetParent(canvasRoot, false);
            var containerRect = _container.AddComponent<RectTransform>();
            containerRect.anchorMin = new Vector2(1, 1);
            containerRect.anchorMax = new Vector2(1, 1);
            containerRect.pivot = new Vector2(1, 1);
            containerRect.anchoredPosition = new Vector2(-Margin, -Margin);
            containerRect.sizeDelta = new Vector2(MapSize, MapSize);

            // Background
            var bg = _container.AddComponent<Image>();
            bg.color = new Color(0.1f, 0.1f, 0.15f, 0.85f);

            // Header label
            var headerGo = new GameObject("MapLabel");
            headerGo.transform.SetParent(_container.transform, false);
            var headerRect = headerGo.AddComponent<RectTransform>();
            headerRect.anchorMin = new Vector2(0, 1);
            headerRect.anchorMax = new Vector2(1, 1);
            headerRect.pivot = new Vector2(0.5f, 1);
            headerRect.anchoredPosition = Vector2.zero;
            headerRect.sizeDelta = new Vector2(0, 16);
            var headerText = headerGo.AddComponent<Text>();
            headerText.text = "Map";
            headerText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            headerText.fontSize = 11;
            headerText.alignment = TextAnchor.MiddleCenter;
            headerText.color = new Color(0.8f, 0.8f, 0.8f);

            // Mask area
            var maskGo = new GameObject("MapMask");
            maskGo.transform.SetParent(_container.transform, false);
            var maskRect = maskGo.AddComponent<RectTransform>();
            maskRect.anchorMin = Vector2.zero;
            maskRect.anchorMax = Vector2.one;
            maskRect.offsetMin = new Vector2(0, 0);
            maskRect.offsetMax = new Vector2(0, -16);
            var maskImg = maskGo.AddComponent<Image>();
            maskImg.color = Color.white;
            maskGo.AddComponent<Mask>().showMaskGraphic = false;

            // Map content (moves to keep player centered)
            var contentGo = new GameObject("MapContent");
            contentGo.transform.SetParent(maskGo.transform, false);
            _mapContent = contentGo.AddComponent<RectTransform>();
            _mapContent.anchorMin = new Vector2(0.5f, 0.5f);
            _mapContent.anchorMax = new Vector2(0.5f, 0.5f);
            _mapContent.pivot = new Vector2(0.5f, 0.5f);
            _mapContent.sizeDelta = Vector2.zero;

            // Player marker (diamond = 45deg rotated square)
            _playerMarker = CreateMarker(_mapContent, "Player", new Color(0f, 0.9f, 0.9f), 8);
            _playerMarker.localRotation = Quaternion.Euler(0, 0, 45);
        }

        private void PopulateMarkers(dynamic worldData)
        {
            if (worldData == null) return;

            if (worldData.buildings != null)
            {
                foreach (var b in worldData.buildings)
                {
                    var m = CreateMarker(_mapContent, "Bld", new Color(0.5f, 0.5f, 0.5f), 4);
                    m.anchoredPosition = WorldToMinimap(b.x, b.z);
                }
            }

            if (worldData.waterFeatures != null)
            {
                foreach (var w in worldData.waterFeatures)
                {
                    var m = CreateMarker(_mapContent, "Water", new Color(0.2f, 0.4f, 0.8f), 4);
                    m.anchoredPosition = WorldToMinimap(w.x, w.z);
                }
            }

            if (worldData.questObjectives != null)
            {
                foreach (var q in worldData.questObjectives)
                {
                    var m = CreateMarker(_mapContent, "Quest", new Color(0.9f, 0.2f, 0.8f), 6);
                    m.anchoredPosition = WorldToMinimap(q.x, q.z);
                }
            }
        }

        private void InitNpcTracking()
        {
            var npcObjects = GameObject.FindGameObjectsWithTag("NPC");
            _npcTransforms = new Transform[npcObjects.Length];
            _npcMarkers = new RectTransform[npcObjects.Length];

            for (int i = 0; i < npcObjects.Length; i++)
            {
                _npcTransforms[i] = npcObjects[i].transform;
                _npcMarkers[i] = CreateMarker(_mapContent, "NPC", new Color(0.9f, 0.8f, 0.2f), 5);
            }

            UpdateNpcPositions();
        }

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.M))
            {
                _visible = !_visible;
                _container.SetActive(_visible);
            }

            if (!_visible || _player == null) return;

            Vector3 pos = _player.transform.position;
            float yRot = _player.transform.eulerAngles.y;

            _mapContent.anchoredPosition = -WorldToMinimap(pos.x, pos.z);
            _playerMarker.anchoredPosition = WorldToMinimap(pos.x, pos.z);
            _playerMarker.localRotation = Quaternion.Euler(0, 0, -yRot + 45);

            _npcUpdateTimer += Time.deltaTime;
            if (_npcUpdateTimer >= NpcUpdateInterval)
            {
                _npcUpdateTimer = 0f;
                UpdateNpcPositions();
            }
        }

        private void UpdateNpcPositions()
        {
            if (_npcTransforms == null) return;
            for (int i = 0; i < _npcTransforms.Length; i++)
            {
                if (_npcTransforms[i] == null) continue;
                Vector3 p = _npcTransforms[i].position;
                _npcMarkers[i].anchoredPosition = WorldToMinimap(p.x, p.z);
            }
        }

        private Vector2 WorldToMinimap(float worldX, float worldZ)
        {
            return new Vector2(worldX * _scale, worldZ * _scale);
        }

        private RectTransform CreateMarker(RectTransform parent, string label, Color color, int size)
        {
            var go = new GameObject(label + "Marker");
            go.transform.SetParent(parent, false);
            var rect = go.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(size, size);
            var img = go.AddComponent<Image>();
            img.color = color;
            return rect;
        }
    }
}
