using UnityEngine;
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

        private CharacterController _controller;
        private CharacterAnimationController _animController;
        private Vector3 _velocity;
        private Vector2 _moveInput;
        private bool _jumpPressed;

        private void Awake()
        {
            _controller = GetComponent<CharacterController>();
            _animController = GetComponent<CharacterAnimationController>();
            if (cameraTransform == null && Camera.main != null)
                cameraTransform = Camera.main.transform;
        }

        private void Update()
        {
            Move();
            ApplyGravity();
            UpdateAnimations();
        }

        public void OnMove(InputValue value) => _moveInput = value.Get<Vector2>();
        public void OnJump(InputValue value) => _jumpPressed = value.isPressed;

        public void OnAttack()
        {
            if (_animController != null) _animController.TriggerAttack();
            Debug.Log("[Insimul] Player Attack");
        }

        public void OnInteract()
        {
            if (_animController != null) _animController.TriggerInteract();
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

        private void UpdateAnimations()
        {
            if (_animController == null) return;
            Vector3 horizontalVelocity = _controller.velocity;
            horizontalVelocity.y = 0f;
            _animController.SetSpeed(horizontalVelocity.magnitude);
            _animController.SetGrounded(_controller.isGrounded);
        }
    }
}
