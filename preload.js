const { contextBridge, ipcRenderer } = require("electron");

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
            console.log(`Received ${channel} event in preload.js`);
            func(...args);
        });
    },
});
