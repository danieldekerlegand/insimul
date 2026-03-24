using UnityEngine;
using UnityEngine.InputSystem;
using Insimul.Systems;

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
        public float moveSpeed = {{PLAYER_SPEED}}f;
        public float jumpHeight = {{PLAYER_JUMP_HEIGHT}}f;
        public float gravity = -9.81f * {{PLAYER_GRAVITY}}f;
        public float rotationSpeed = 10f;

        [Header("Camera")]
        public Transform cameraTransform;

        [Header("Stats")]
        public float health = {{PLAYER_INITIAL_HEALTH}}f;
        public float maxHealth = {{PLAYER_INITIAL_HEALTH}}f;
        public float energy = {{PLAYER_INITIAL_ENERGY}}f;
        public int gold = {{PLAYER_INITIAL_GOLD}};

        [Header("Interaction")]
        public float interactionRadius = 2f;
        public LayerMask interactionLayers = ~0;

        private CharacterController _controller;
        private Vector3 _velocity;
        private Vector2 _moveInput;
        private bool _jumpPressed;

        private IInteractable _nearestInteractable;
        private readonly Collider[] _overlapBuffer = new Collider[16];

        public IInteractable NearestInteractable => _nearestInteractable;

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
            DetectInteractables();
        }

        public void OnMove(InputValue value) => _moveInput = value.Get<Vector2>();
        public void OnJump(InputValue value) => _jumpPressed = value.isPressed;

        public void OnAttack()
        {
            Debug.Log("[Insimul] Player Attack");
        }

        public void OnInteract()
        {
            if (_nearestInteractable != null && _nearestInteractable.CanInteract)
            {
                _nearestInteractable.Interact();
            }
        }

        private void DetectInteractables()
        {
            int count = Physics.OverlapSphereNonAlloc(
                transform.position, interactionRadius, _overlapBuffer, interactionLayers);

            IInteractable closest = null;
            float closestDist = float.MaxValue;

            for (int i = 0; i < count; i++)
            {
                var interactable = _overlapBuffer[i].GetComponent<IInteractable>();
                if (interactable == null || !interactable.CanInteract) continue;

                float dist = Vector3.Distance(transform.position, _overlapBuffer[i].transform.position);
                if (dist < closestDist)
                {
                    closestDist = dist;
                    closest = interactable;
                }
            }

            _nearestInteractable = closest;
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
