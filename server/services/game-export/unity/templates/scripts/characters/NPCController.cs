using UnityEngine;
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
        private CharacterAnimationController _animController;
        private float _patrolTimer;
        private float _patrolInterval = 5f;

        private void Awake()
        {
            _agent = GetComponent<NavMeshAgent>();
            _animController = GetComponent<CharacterAnimationController>();
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
            UpdateAnimations();
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
            if (_animController != null) _animController.SetTalking(true);
            Debug.Log($"[Insimul] NPC {characterId} starting dialogue");
        }

        public void EndDialogue()
        {
            currentState = NPCState.Idle;
            if (_animController != null) _animController.SetTalking(false);
        }

        private void UpdateAnimations()
        {
            if (_animController == null) return;
            _animController.SetSpeed(_agent.velocity.magnitude);
            _animController.SetGrounded(true);
        }
    }
}
