const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Read a file relative to dist/ — used by FileDataSource in production builds
  // where fetch() is blocked on the file:// protocol.
  readFile: (relativePath) => ipcRenderer.invoke('read-file', relativePath),
});
