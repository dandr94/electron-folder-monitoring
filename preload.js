const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("api", {
    selectDirs: async () => {
        const result = await ipcRenderer.invoke("select-dirs");
        return result;
    },
    startMonitoring: (folderPath) => {
        ipcRenderer.invoke("start-monitoring", folderPath);
    },
    stopMonitoring: () => {
        ipcRenderer.invoke("stop-monitoring");
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => {
            func(...args);
        });
    },
});

contextBridge.exposeInMainWorld("config", {
    loadConfig: () => ipcRenderer.invoke("load-config"),
    saveConfig: (config) => ipcRenderer.send("save-config", config),
    generateSubject: (fileInfo) =>
        ipcRenderer.invoke("generate-subject", fileInfo),
    generateRecipients: () => ipcRenderer.invoke("generate-recipients"),
    generateMessage: (fileInfo) =>
        ipcRenderer.invoke("generate-message", fileInfo),
});
