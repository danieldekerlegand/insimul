/**
 * Unity C# Generator
 *
 * Generates C# scripts for the Unity project:
 * - Data classes (serializable structs for JSON loading)
 * - Core classes (GameManager, DataLoader)
 * - Character classes (PlayerController, NPCController)
 * - Game systems (Action, Combat, Quest, Inventory, Crafting, Resource, Survival, Dialogue, Rule)
 * - World generators (Building, Nature, Road, Dungeon, WorldScale)
 * - UI scripts (HUD, Minimap, Inventory, QuestTracker, Dialogue, GameMenu)
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unity-project-generator';

// ─────────────────────────────────────────────
// Data Classes
// ─────────────────────────────────────────────

function genDataClasses(): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Scripts/Data';

  files.push({ path: `${base}/InsimulCharacterData.cs`, content: `using System;
using System.Collections.Generic;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulCharacterData
    {
        public string id;
        public string firstName;
        public string lastName;
        public string gender;
        public bool isAlive = true;
        public string occupation;
        public string currentLocation;
        public string status;
        public int birthYear;
        public PersonalityData personality;
        public string[] coworkerIds;
        public string[] friendIds;
        public string spouseId;
    }

    [Serializable]
    public class PersonalityData
    {
        public float openness;
        public float conscientiousness;
        public float extroversion;
        public float agreeableness;
        public float neuroticism;
    }
}
` });

  files.push({ path: `${base}/InsimulNPCData.cs`, content: `using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulNPCData
    {
        public string characterId;
        public string role;
        public Vec3Data homePosition;
        public float patrolRadius = 20f;
        public float disposition = 50f;
        public string settlementId;
        public string[] questIds;
    }

    [Serializable]
    public class Vec3Data
    {
        public float x;
        public float y;
        public float z;

        public Vector3 ToVector3() => new Vector3(x, y, z);
    }
}
` });

  files.push({ path: `${base}/InsimulActionData.cs`, content: `using System;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulActionData
    {
        public string id;
        public string name;
        public string description;
        public string actionType;
        public string category;
        public float duration = 1f;
        public float difficulty = 0.5f;
        public int energyCost = 1;
        public bool requiresTarget;
        public float range;
        public float cooldown;
        public bool isActive = true;
        public string[] tags;
    }
}
` });

  files.push({ path: `${base}/InsimulRuleData.cs`, content: `using System;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulRuleData
    {
        public string id;
        public string name;
        public string description;
        public string content;
        public string ruleType;
        public string category;
        public int priority = 5;
        public float likelihood = 1f;
        public bool isBase;
        public bool isActive = true;
        public string[] tags;
    }
}
` });

  files.push({ path: `${base}/InsimulQuestData.cs`, content: `using System;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulQuestData
    {
        public string id;
        public string title;
        public string description;
        public string questType;
        public string difficulty;
        public int experienceReward;
        public string assignedByCharacterId;
        public string status;
        public string[] tags;
        public string[] prerequisiteQuestIds;
        public InsimulQuestObjective[] objectives;
    }

    [Serializable]
    public class InsimulQuestObjective
    {
        public string id;
        public string description;
        public string objectiveType;
        public bool isOptional;
        public int currentProgress;
        public int targetProgress = 1;
    }
}
` });

  files.push({ path: `${base}/InsimulSettlementData.cs`, content: `using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulSettlementData
    {
        public string id;
        public string name;
        public string description;
        public string settlementType;
        public int population = 100;
        public Vec3Data position;
        public float radius = 20f;
        public string countryId;
        public string stateId;
        public string mayorId;
    }
}
` });

  files.push({ path: `${base}/InsimulBuildingData.cs`, content: `using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulBuildingData
    {
        public string id;
        public string settlementId;
        public Vec3Data position;
        public float rotation;
        public string buildingRole;
        public int floors = 2;
        public float width = 10f;
        public float depth = 10f;
        public bool hasChimney;
        public bool hasBalcony;
        public string modelAssetKey;
        public string businessId;
    }
}
` });

  files.push({ path: `${base}/InsimulWorldIR.cs`, content: `using System;

namespace Insimul.Data
{
    /// <summary>
    /// Root container matching the WorldIR JSON structure.
    /// Use JsonUtility.FromJson<InsimulWorldIR>(json) to deserialize.
    /// </summary>
    [Serializable]
    public class InsimulWorldIR
    {
        public MetaData meta;
        public GeographyData geography;
        public EntitiesData entities;
        public SystemsData systems;
        public ThemeData theme;
        public PlayerData player;
        public UIData ui;
        public CombatData combat;
        public SurvivalData survival;
        public ResourcesData resources;
    }

    [Serializable] public class MetaData
    {
        public string insimulVersion;
        public string worldId;
        public string worldName;
        public string worldType;
        public string seed;
        public int terrainSize;
    }

    [Serializable] public class GeographyData
    {
        public int terrainSize;
        public InsimulSettlementData[] settlements;
    }

    [Serializable] public class EntitiesData
    {
        public InsimulCharacterData[] characters;
        public InsimulNPCData[] npcs;
        public InsimulBuildingData[] buildings;
    }

    [Serializable] public class SystemsData
    {
        public InsimulRuleData[] rules;
        public InsimulRuleData[] baseRules;
        public InsimulActionData[] actions;
        public InsimulActionData[] baseActions;
        public InsimulQuestData[] quests;
    }

    [Serializable] public class ColorData { public float r, g, b; }

    [Serializable] public class ThemeData
    {
        public VisualThemeData visualTheme;
    }

    [Serializable] public class VisualThemeData
    {
        public ColorData groundColor;
        public ColorData skyColor;
        public ColorData roadColor;
        public float roadRadius;
        public ColorData settlementBaseColor;
        public ColorData settlementRoofColor;
    }

    [Serializable] public class PlayerData
    {
        public Vec3Data startPosition;
        public float initialHealth = 100f;
        public float initialEnergy = 100f;
        public int initialGold;
        public float speed = 5f;
        public float jumpHeight = 1.2f;
        public float gravity = 1f;
    }

    [Serializable] public class UIData
    {
        public bool showMinimap;
        public bool showHealthBar;
        public bool showStaminaBar;
        public bool showAmmoCounter;
        public bool showCompass;
    }

    [Serializable] public class CombatData
    {
        public string style;
        public CombatSettingsData settings;
    }

    [Serializable] public class CombatSettingsData
    {
        public float baseDamage;
        public float criticalChance;
        public float criticalMultiplier;
        public float blockReduction;
        public float dodgeChance;
        public float attackCooldown;
    }

    [Serializable] public class SurvivalData
    {
        public SurvivalNeedData[] needs;
    }

    [Serializable] public class SurvivalNeedData
    {
        public string id;
        public string name;
        public float maxValue;
        public float startValue;
        public float decayRate;
        public float criticalThreshold;
        public float damageRate;
    }

    [Serializable] public class ResourcesData
    {
        public ResourceDefData[] definitions;
    }

    [Serializable] public class ResourceDefData
    {
        public string id;
        public string name;
        public float maxStack;
        public float gatherTime;
        public float respawnTime;
    }
}
` });

  return files;
}

// ─────────────────────────────────────────────
// Core Classes
// ─────────────────────────────────────────────

function genCoreClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Scripts/Core';

  files.push({ path: `${base}/InsimulGameManager.cs`, content: `using UnityEngine;
using Insimul.Data;

namespace Insimul.Core
{
    /// <summary>
    /// Central game manager — singleton that orchestrates all systems.
    /// Attach to an empty GameObject in the scene.
    /// </summary>
    public class InsimulGameManager : MonoBehaviour
    {
        public static InsimulGameManager Instance { get; private set; }

        [Header("World Data")]
        public InsimulWorldIR WorldData { get; private set; }
        public bool IsDataLoaded { get; private set; }

        [Header("Settings")]
        public string worldIRPath = "Data/WorldIR";

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadWorldData();
        }

        private void Start()
        {
            if (IsDataLoaded) SpawnWorld();
        }

        public void LoadWorldData()
        {
            var json = Resources.Load<TextAsset>(worldIRPath);
            if (json == null)
            {
                Debug.LogError("[Insimul] Failed to load WorldIR from Resources/" + worldIRPath);
                return;
            }
            WorldData = JsonUtility.FromJson<InsimulWorldIR>(json.text);
            IsDataLoaded = true;
            Debug.Log($"[Insimul] Loaded world: {WorldData.meta.worldName} (type: {WorldData.meta.worldType})");
        }

        private void SpawnWorld()
        {
            Debug.Log("[Insimul] Spawning world entities...");
            // Terrain
            var wsm = FindObjectOfType<Insimul.World.WorldScaleManager>();
            if (wsm != null) wsm.Initialize(WorldData);

            // Buildings
            var bg = FindObjectOfType<Insimul.World.ProceduralBuildingGenerator>();
            if (bg != null) bg.GenerateFromData(WorldData);

            // Roads
            var rg = FindObjectOfType<Insimul.World.RoadGenerator>();
            if (rg != null) rg.GenerateFromData(WorldData);

            // NPCs
            var npcMgr = FindObjectOfType<Insimul.Characters.NPCManager>();
            if (npcMgr != null) npcMgr.SpawnNPCs(WorldData);

            // Systems
            var actionSys = FindObjectOfType<Insimul.Systems.ActionSystem>();
            if (actionSys != null) actionSys.LoadFromData(WorldData);

            var questSys = FindObjectOfType<Insimul.Systems.QuestSystem>();
            if (questSys != null) questSys.LoadFromData(WorldData);

            var combatSys = FindObjectOfType<Insimul.Systems.CombatSystem>();
            if (combatSys != null) combatSys.LoadFromData(WorldData);

            var ruleSys = FindObjectOfType<Insimul.Systems.RuleEnforcer>();
            if (ruleSys != null) ruleSys.LoadFromData(WorldData);

            Debug.Log("[Insimul] World spawning complete.");
        }
    }
}
` });

  files.push({ path: `${base}/InsimulDataLoader.cs`, content: `using UnityEngine;
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
            string wrapped = "{\\"items\\":" + json.text + "}";
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
` });

  return files;
}

// ─────────────────────────────────────────────
// Character Classes
// ─────────────────────────────────────────────

function genCharacterClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Scripts/Characters';

  files.push({ path: `${base}/InsimulPlayerController.cs`, content: `using UnityEngine;
using UnityEngine.InputSystem;

namespace Insimul.Characters
{
    /// <summary>
    /// Third-person player controller with New Input System support.
    /// Attach to the Player GameObject with a CharacterController component.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class InsimulPlayerController : MonoBehaviour
    {
        [Header("Movement")]
        public float moveSpeed = ${ir.player.speed}f;
        public float jumpHeight = ${ir.player.jumpHeight}f;
        public float gravity = -9.81f * ${ir.player.gravity}f;
        public float rotationSpeed = 10f;

        [Header("Camera")]
        public Transform cameraTransform;

        [Header("Stats")]
        public float health = ${ir.player.initialHealth}f;
        public float maxHealth = ${ir.player.initialHealth}f;
        public float energy = ${ir.player.initialEnergy}f;
        public int gold = ${ir.player.initialGold};

        private CharacterController _controller;
        private Vector3 _velocity;
        private Vector2 _moveInput;
        private bool _jumpPressed;

        private void Awake()
        {
            _controller = GetComponent<CharacterController>();
            if (cameraTransform == null && Camera.main != null)
                cameraTransform = Camera.main.transform;
        }

        private void Update()
        {
            Move();
            ApplyGravity();
        }

        public void OnMove(InputValue value) => _moveInput = value.Get<Vector2>();
        public void OnJump(InputValue value) => _jumpPressed = value.isPressed;

        public void OnAttack()
        {
            // TODO: Trigger combat system
            Debug.Log("[Insimul] Player Attack");
        }

        public void OnInteract()
        {
            // TODO: Raycast for interactable objects
            Debug.Log("[Insimul] Player Interact");
        }

        private void Move()
        {
            if (_moveInput.sqrMagnitude < 0.01f) return;

            Vector3 forward = cameraTransform != null ? cameraTransform.forward : transform.forward;
            Vector3 right = cameraTransform != null ? cameraTransform.right : transform.right;
            forward.y = 0f; forward.Normalize();
            right.y = 0f; right.Normalize();

            Vector3 moveDir = forward * _moveInput.y + right * _moveInput.x;
            _controller.Move(moveDir * moveSpeed * Time.deltaTime);

            if (moveDir.sqrMagnitude > 0.01f)
            {
                Quaternion targetRot = Quaternion.LookRotation(moveDir);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, rotationSpeed * Time.deltaTime);
            }
        }

        private void ApplyGravity()
        {
            if (_controller.isGrounded)
            {
                _velocity.y = -2f;
                if (_jumpPressed)
                {
                    _velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
                    _jumpPressed = false;
                }
            }
            else
            {
                _velocity.y += gravity * Time.deltaTime;
            }
            _controller.Move(_velocity * Time.deltaTime);
        }
    }
}
` });

  files.push({ path: `${base}/NPCController.cs`, content: `using UnityEngine;
using UnityEngine.AI;
using Insimul.Data;

namespace Insimul.Characters
{
    public enum NPCState { Idle, Patrol, Talking, Fleeing, Pursuing, Alert }

    /// <summary>
    /// NPC controller using Unity NavMesh for pathfinding.
    /// </summary>
    [RequireComponent(typeof(NavMeshAgent))]
    public class NPCController : MonoBehaviour
    {
        [Header("NPC Data")]
        public string characterId;
        public string role;
        public Vector3 homePosition;
        public float patrolRadius = 20f;
        public float disposition = 50f;
        public string settlementId;
        public string[] questIds;

        [Header("State")]
        public NPCState currentState = NPCState.Idle;

        private NavMeshAgent _agent;
        private float _patrolTimer;
        private float _patrolInterval = 5f;

        private void Awake()
        {
            _agent = GetComponent<NavMeshAgent>();
            _agent.speed = 2f;
        }

        public void InitFromData(InsimulNPCData data)
        {
            characterId = data.characterId;
            role = data.role;
            homePosition = data.homePosition.ToVector3();
            patrolRadius = data.patrolRadius;
            disposition = data.disposition;
            settlementId = data.settlementId;
            questIds = data.questIds ?? new string[0];

            transform.position = homePosition;
            Debug.Log($"[Insimul] NPC {characterId} initialized at {homePosition} (role: {role})");
        }

        private void Update()
        {
            switch (currentState)
            {
                case NPCState.Idle:
                    UpdateIdle();
                    break;
                case NPCState.Patrol:
                    UpdatePatrol();
                    break;
                case NPCState.Talking:
                    break;
                case NPCState.Fleeing:
                    break;
                case NPCState.Pursuing:
                    break;
                case NPCState.Alert:
                    break;
            }
        }

        private void UpdateIdle()
        {
            _patrolTimer += Time.deltaTime;
            if (_patrolTimer >= _patrolInterval)
            {
                _patrolTimer = 0f;
                currentState = NPCState.Patrol;
                Vector3 randomPoint = homePosition + Random.insideUnitSphere * patrolRadius;
                randomPoint.y = homePosition.y;
                if (NavMesh.SamplePosition(randomPoint, out NavMeshHit hit, patrolRadius, NavMesh.AllAreas))
                {
                    _agent.SetDestination(hit.position);
                }
            }
        }

        private void UpdatePatrol()
        {
            if (!_agent.pathPending && _agent.remainingDistance < 0.5f)
            {
                currentState = NPCState.Idle;
            }
        }

        public void StartDialogue(GameObject initiator)
        {
            currentState = NPCState.Talking;
            _agent.ResetPath();
            transform.LookAt(initiator.transform);
            Debug.Log($"[Insimul] NPC {characterId} starting dialogue");
        }

        public void EndDialogue()
        {
            currentState = NPCState.Idle;
        }
    }
}
` });

  files.push({ path: `${base}/NPCManager.cs`, content: `using UnityEngine;
using Insimul.Data;

namespace Insimul.Characters
{
    /// <summary>
    /// Spawns and manages all NPCs from IR data.
    /// </summary>
    public class NPCManager : MonoBehaviour
    {
        [Header("NPC Prefab")]
        public GameObject npcPrefab;

        public void SpawnNPCs(InsimulWorldIR worldData)
        {
            if (worldData?.entities?.npcs == null) return;

            foreach (var npcData in worldData.entities.npcs)
            {
                GameObject npcObj;
                if (npcPrefab != null)
                    npcObj = Instantiate(npcPrefab, npcData.homePosition.ToVector3(), Quaternion.identity, transform);
                else
                {
                    npcObj = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                    npcObj.transform.position = npcData.homePosition.ToVector3();
                    npcObj.transform.SetParent(transform);
                }

                npcObj.name = $"NPC_{npcData.characterId}";
                npcObj.tag = "NPC";

                var controller = npcObj.GetComponent<NPCController>();
                if (controller == null) controller = npcObj.AddComponent<NPCController>();
                controller.InitFromData(npcData);
            }

            Debug.Log($"[Insimul] Spawned {worldData.entities.npcs.Length} NPCs");
        }
    }
}
` });

  return files;
}

// ─────────────────────────────────────────────
// Game Systems
// ─────────────────────────────────────────────

function genSystemClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Scripts/Systems';
  const genre = ir.meta.genreConfig;
  const cs = ir.combat.settings;

  files.push({ path: `${base}/ActionSystem.cs`, content: `using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class ActionSystem : MonoBehaviour
    {
        private List<InsimulActionData> _actions = new();

        public int ActionCount => _actions.Count;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.systems?.actions != null)
                _actions.AddRange(worldData.systems.actions);
            if (worldData?.systems?.baseActions != null)
                _actions.AddRange(worldData.systems.baseActions);
            Debug.Log($"[Insimul] ActionSystem loaded {_actions.Count} actions");
        }

        public InsimulActionData GetAction(string id)
        {
            return _actions.Find(a => a.id == id);
        }

        public bool ExecuteAction(string actionId, GameObject source, GameObject target = null)
        {
            var action = GetAction(actionId);
            if (action == null || !action.isActive) return false;
            // TODO: Check prerequisites, apply effects
            Debug.Log($"[Insimul] Executing action: {action.name}");
            return true;
        }
    }
}
` });

  files.push({ path: `${base}/RuleEnforcer.cs`, content: `using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class RuleEnforcer : MonoBehaviour
    {
        private List<InsimulRuleData> _rules = new();

        public int RuleCount => _rules.Count;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.systems?.rules != null)
                _rules.AddRange(worldData.systems.rules);
            if (worldData?.systems?.baseRules != null)
                _rules.AddRange(worldData.systems.baseRules);
            Debug.Log($"[Insimul] RuleEnforcer loaded {_rules.Count} rules");
        }

        public List<InsimulRuleData> EvaluateRules(string context)
        {
            var applicable = new List<InsimulRuleData>();
            foreach (var rule in _rules)
            {
                if (!rule.isActive) continue;
                // TODO: Evaluate rule conditions against context
                applicable.Add(rule);
            }
            return applicable;
        }
    }
}
` });

  files.push({ path: `${base}/CombatSystem.cs`, content: `using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class CombatSystem : MonoBehaviour
    {
        [Header("Combat Settings")]
        public string combatStyle = "${ir.combat.style}";
        public float baseDamage = ${cs.baseDamage}f;
        public float criticalChance = ${cs.criticalChance}f;
        public float criticalMultiplier = ${cs.criticalMultiplier}f;
        public float blockReduction = ${cs.blockReduction}f;
        public float dodgeChance = ${cs.dodgeChance}f;
        public float attackCooldown = ${cs.attackCooldown / 1000}f;

        private float _lastAttackTime;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.combat == null) return;
            combatStyle = worldData.combat.style;
            if (worldData.combat.settings != null)
            {
                baseDamage = worldData.combat.settings.baseDamage;
                criticalChance = worldData.combat.settings.criticalChance;
                criticalMultiplier = worldData.combat.settings.criticalMultiplier;
                blockReduction = worldData.combat.settings.blockReduction;
                dodgeChance = worldData.combat.settings.dodgeChance;
                attackCooldown = worldData.combat.settings.attackCooldown / 1000f;
            }
            Debug.Log($"[Insimul] CombatSystem loaded — style: {combatStyle}, baseDamage: {baseDamage}");
        }

        public float CalculateDamage(float base_dmg, bool isCritical)
        {
            float dmg = base_dmg;
            if (isCritical) dmg *= criticalMultiplier;
            float variance = Random.Range(-baseDamage * 0.2f, baseDamage * 0.2f);
            return Mathf.Max(1f, dmg + variance);
        }

        public bool CanAttack()
        {
            return Time.time - _lastAttackTime >= attackCooldown;
        }

        public void RegisterAttack()
        {
            _lastAttackTime = Time.time;
        }
    }
}
` });

  files.push({ path: `${base}/QuestSystem.cs`, content: `using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class QuestSystem : MonoBehaviour
    {
        private List<InsimulQuestData> _allQuests = new();
        private List<string> _activeQuestIds = new();
        private HashSet<string> _completedQuestIds = new();

        public int QuestCount => _allQuests.Count;
        public int ActiveCount => _activeQuestIds.Count;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.systems?.quests == null) return;
            _allQuests.AddRange(worldData.systems.quests);
            Debug.Log($"[Insimul] QuestSystem loaded {_allQuests.Count} quests");
        }

        public bool AcceptQuest(string questId)
        {
            var quest = _allQuests.Find(q => q.id == questId);
            if (quest == null || _activeQuestIds.Contains(questId)) return false;
            _activeQuestIds.Add(questId);
            Debug.Log($"[Insimul] Quest accepted: {quest.title}");
            return true;
        }

        public bool CompleteQuest(string questId)
        {
            if (!_activeQuestIds.Contains(questId)) return false;
            _activeQuestIds.Remove(questId);
            _completedQuestIds.Add(questId);
            Debug.Log($"[Insimul] Quest completed: {questId}");
            return true;
        }

        public InsimulQuestData GetQuest(string id) => _allQuests.Find(q => q.id == id);
        public List<InsimulQuestData> GetActiveQuests() =>
            _allQuests.FindAll(q => _activeQuestIds.Contains(q.id));
    }
}
` });

  files.push({ path: `${base}/InventorySystem.cs`, content: `using System.Collections.Generic;
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
` });

  files.push({ path: `${base}/DialogueSystem.cs`, content: `using UnityEngine;

namespace Insimul.Systems
{
    public class DialogueSystem : MonoBehaviour
    {
        public bool IsInDialogue { get; private set; }
        public string CurrentNPCId { get; private set; }

        public System.Action<string> OnDialogueStarted;
        public System.Action OnDialogueEnded;

        public void StartDialogue(string npcCharacterId)
        {
            IsInDialogue = true;
            CurrentNPCId = npcCharacterId;
            OnDialogueStarted?.Invoke(npcCharacterId);
            Debug.Log($"[Insimul] Dialogue started with NPC: {npcCharacterId}");
        }

        public void EndDialogue()
        {
            var npcId = CurrentNPCId;
            IsInDialogue = false;
            CurrentNPCId = null;
            OnDialogueEnded?.Invoke();
            Debug.Log($"[Insimul] Dialogue ended with NPC: {npcId}");
        }
    }
}
` });

  // Conditional systems
  if (genre.features.crafting) {
    files.push({ path: `${base}/CraftingSystem.cs`, content: `using System.Collections.Generic;
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
` });
  }

  if (genre.features.resources) {
    files.push({ path: `${base}/ResourceSystem.cs`, content: `using System.Collections.Generic;
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
` });
  }

  if (ir.survival != null) {
    files.push({ path: `${base}/SurvivalSystem.cs`, content: `using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    [System.Serializable]
    public class NeedState
    {
        public string id;
        public string name;
        public float value;
        public float maxValue;
        public float decayRate;
        public float criticalThreshold;
        public float damageRate;
    }

    public class SurvivalSystem : MonoBehaviour
    {
        private List<NeedState> _needs = new();

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.survival?.needs == null) return;
            foreach (var need in worldData.survival.needs)
            {
                _needs.Add(new NeedState
                {
                    id = need.id, name = need.name,
                    value = need.startValue, maxValue = need.maxValue,
                    decayRate = need.decayRate, criticalThreshold = need.criticalThreshold,
                    damageRate = need.damageRate
                });
            }
            Debug.Log($"[Insimul] SurvivalSystem loaded {_needs.Count} needs");
        }

        private void Update()
        {
            foreach (var need in _needs)
            {
                if (need.decayRate > 0)
                {
                    need.value -= need.decayRate * Time.deltaTime;
                    need.value = Mathf.Clamp(need.value, 0f, need.maxValue);
                }
            }
        }

        public float GetNeedValue(string needId)
        {
            var need = _needs.Find(n => n.id == needId);
            return need?.value ?? 0f;
        }

        public void ModifyNeed(string needId, float delta)
        {
            var need = _needs.Find(n => n.id == needId);
            if (need != null)
                need.value = Mathf.Clamp(need.value + delta, 0f, need.maxValue);
        }
    }
}
` });
  }

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldGenerators(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Scripts/World';
  const theme = ir.theme.visualTheme;

  files.push({ path: `${base}/WorldScaleManager.cs`, content: `using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    public class WorldScaleManager : MonoBehaviour
    {
        [Header("World")]
        public int terrainSize = ${ir.geography.terrainSize};
        public Color groundColor = new Color(${theme.groundColor.r}f, ${theme.groundColor.g}f, ${theme.groundColor.b}f);
        public Color skyColor = new Color(${theme.skyColor.r}f, ${theme.skyColor.g}f, ${theme.skyColor.b}f);
        public Color roadColor = new Color(${theme.roadColor.r}f, ${theme.roadColor.g}f, ${theme.roadColor.b}f);

        public void Initialize(InsimulWorldIR worldData)
        {
            terrainSize = worldData.geography.terrainSize;
            Debug.Log($"[Insimul] WorldScaleManager initialized (terrain: {terrainSize})");

            // Set skybox color
            RenderSettings.ambientSkyColor = skyColor;
            Camera.main.backgroundColor = skyColor;

            // Generate flat terrain
            GenerateTerrain();
        }

        private void GenerateTerrain()
        {
            var plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
            plane.name = "Terrain";
            plane.transform.localScale = new Vector3(terrainSize / 10f, 1f, terrainSize / 10f);
            plane.transform.position = Vector3.zero;

            var renderer = plane.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material = new Material(Shader.Find("Standard"));
                renderer.material.color = groundColor;
            }
        }

        public static float GetSettlementRadius(int population)
        {
            if (population <= 50) return 20f;
            if (population <= 200) return 35f;
            if (population <= 1000) return 55f;
            if (population <= 5000) return 80f;
            return 120f;
        }
    }
}
` });

  files.push({ path: `${base}/ProceduralBuildingGenerator.cs`, content: `using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    public class ProceduralBuildingGenerator : MonoBehaviour
    {
        public Color baseColor = new Color(${theme.settlementBaseColor.r}f, ${theme.settlementBaseColor.g}f, ${theme.settlementBaseColor.b}f);
        public Color roofColor = new Color(${theme.settlementRoofColor.r}f, ${theme.settlementRoofColor.g}f, ${theme.settlementRoofColor.b}f);

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            if (worldData?.entities?.buildings == null) return;

            foreach (var bld in worldData.entities.buildings)
            {
                GenerateBuilding(
                    bld.position.ToVector3(),
                    bld.rotation,
                    bld.floors,
                    bld.width,
                    bld.depth,
                    bld.buildingRole
                );
            }
            Debug.Log($"[Insimul] Generated {worldData.entities.buildings.Length} buildings");
        }

        public void GenerateBuilding(Vector3 position, float rotation, int floors,
            float width, float depth, string role)
        {
            float floorHeight = 3f;
            float totalHeight = floors * floorHeight;

            // Base
            var building = GameObject.CreatePrimitive(PrimitiveType.Cube);
            building.name = $"Building_{role}";
            building.tag = "Building";
            building.transform.position = position + Vector3.up * totalHeight / 2f;
            building.transform.localScale = new Vector3(width, totalHeight, depth);
            building.transform.rotation = Quaternion.Euler(0, rotation, 0);
            building.transform.SetParent(transform);

            var renderer = building.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material = new Material(Shader.Find("Standard"));
                renderer.material.color = baseColor;
            }

            // Roof
            var roof = GameObject.CreatePrimitive(PrimitiveType.Cube);
            roof.name = "Roof";
            roof.transform.position = position + Vector3.up * (totalHeight + 0.5f);
            roof.transform.localScale = new Vector3(width + 1f, 1f, depth + 1f);
            roof.transform.rotation = Quaternion.Euler(0, rotation, 0);
            roof.transform.SetParent(building.transform);

            var roofRenderer = roof.GetComponent<Renderer>();
            if (roofRenderer != null)
            {
                roofRenderer.material = new Material(Shader.Find("Standard"));
                roofRenderer.material.color = roofColor;
            }
        }
    }
}
` });

  files.push({ path: `${base}/RoadGenerator.cs`, content: `using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    public class RoadGenerator : MonoBehaviour
    {
        public Color roadColor = new Color(${theme.roadColor.r}f, ${theme.roadColor.g}f, ${theme.roadColor.b}f);
        public float roadWidth = ${theme.roadRadius * 2}f;

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            // TODO: Generate LineRenderer or mesh-based roads from WorldIR road data
            Debug.Log("[Insimul] RoadGenerator — stub (implement mesh roads)");
        }

        public void GenerateRoad(Vector3 from, Vector3 to, float width)
        {
            var roadObj = new GameObject("Road");
            roadObj.transform.SetParent(transform);

            var lr = roadObj.AddComponent<LineRenderer>();
            lr.positionCount = 2;
            lr.SetPosition(0, from + Vector3.up * 0.05f);
            lr.SetPosition(1, to + Vector3.up * 0.05f);
            lr.startWidth = width;
            lr.endWidth = width;
            lr.material = new Material(Shader.Find("Unlit/Color"));
            lr.material.color = roadColor;
        }
    }
}
` });

  files.push({ path: `${base}/ProceduralNatureGenerator.cs`, content: `using UnityEngine;

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
` });

  files.push({ path: `${base}/ProceduralDungeonGenerator.cs`, content: `using UnityEngine;

namespace Insimul.World
{
    public class ProceduralDungeonGenerator : MonoBehaviour
    {
        public void GenerateDungeon(string seed, int floorCount, int roomsPerFloor)
        {
            // TODO: Generate dungeon rooms and corridors procedurally
            Debug.Log($"[Insimul] ProceduralDungeonGenerator — {floorCount} floors, {roomsPerFloor} rooms (seed: {seed})");
        }
    }
}
` });

  return files;
}

// ─────────────────────────────────────────────
// UI Scripts
// ─────────────────────────────────────────────

function genUIClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Scripts/UI';

  files.push({ path: `${base}/HUDManager.cs`, content: `using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Insimul.Characters;

namespace Insimul.UI
{
    public class HUDManager : MonoBehaviour
    {
        [Header("Health")]
        public Slider healthBar;
        public TextMeshProUGUI healthText;

        [Header("Energy")]
        public Slider energyBar;

        [Header("Gold")]
        public TextMeshProUGUI goldText;

        [Header("Crosshair")]
        public Image crosshair;

        private InsimulPlayerController _player;

        private void Start()
        {
            _player = FindObjectOfType<InsimulPlayerController>();
        }

        private void Update()
        {
            if (_player == null) return;

            if (healthBar != null)
            {
                healthBar.maxValue = _player.maxHealth;
                healthBar.value = _player.health;
            }
            if (healthText != null)
                healthText.text = $"{Mathf.CeilToInt(_player.health)} / {Mathf.CeilToInt(_player.maxHealth)}";
            if (goldText != null)
                goldText.text = _player.gold.ToString();
        }
    }
}
` });

  files.push({ path: `${base}/QuestTrackerUI.cs`, content: `using System.Collections.Generic;
using UnityEngine;
using TMPro;
using Insimul.Systems;
using Insimul.Data;

namespace Insimul.UI
{
    public class QuestTrackerUI : MonoBehaviour
    {
        public TextMeshProUGUI questListText;
        private QuestSystem _questSystem;

        private void Start()
        {
            _questSystem = FindObjectOfType<QuestSystem>();
        }

        private void Update()
        {
            if (_questSystem == null || questListText == null) return;

            var active = _questSystem.GetActiveQuests();
            if (active.Count == 0)
            {
                questListText.text = "No active quests";
                return;
            }

            var sb = new System.Text.StringBuilder();
            foreach (var q in active)
            {
                sb.AppendLine($"<b>{q.title}</b>");
                sb.AppendLine($"  {q.description}");
            }
            questListText.text = sb.ToString();
        }
    }
}
` });

  files.push({ path: `${base}/GameMenuUI.cs`, content: `using UnityEngine;

namespace Insimul.UI
{
    public class GameMenuUI : MonoBehaviour
    {
        public GameObject menuPanel;
        private bool _isOpen;

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
                ToggleMenu();
        }

        public void ToggleMenu()
        {
            _isOpen = !_isOpen;
            if (menuPanel != null) menuPanel.SetActive(_isOpen);
            Time.timeScale = _isOpen ? 0f : 1f;
            Cursor.lockState = _isOpen ? CursorLockMode.None : CursorLockMode.Locked;
            Cursor.visible = _isOpen;
        }

        public void ResumeGame() => ToggleMenu();
        public void QuitGame() => Application.Quit();
    }
}
` });

  return files;
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateCSharpFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genDataClasses(),
    ...genCoreClasses(ir),
    ...genCharacterClasses(ir),
    ...genSystemClasses(ir),
    ...genWorldGenerators(ir),
    ...genUIClasses(ir),
  ];
}
