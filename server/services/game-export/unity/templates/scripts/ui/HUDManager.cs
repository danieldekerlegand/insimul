using UnityEngine;
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
