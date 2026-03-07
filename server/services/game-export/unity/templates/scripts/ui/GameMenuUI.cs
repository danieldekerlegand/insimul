using UnityEngine;

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
