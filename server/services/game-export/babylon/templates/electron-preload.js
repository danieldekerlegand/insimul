const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Read a file relative to dist/ — used by FileDataSource in production builds
  // where fetch() is blocked on the file:// protocol.
  readFile: (relativePath) => ipcRenderer.invoke('read-file', relativePath),

  // AI: Text-to-speech via Piper (returns ArrayBuffer or null)
  aiTTS: (text, voice, speed, languageCode) =>
    ipcRenderer.invoke('ai:tts', { text, voice, speed, languageCode }),

  // AI: Query service status
  aiStatus: () => ipcRenderer.invoke('ai:status'),
});
