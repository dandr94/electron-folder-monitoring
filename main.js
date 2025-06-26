const {app, BrowserWindow, ipcMain, dialog, Menu} = require("electron");
const path = require("node:path");
const chokidar = require("chokidar");
const config = require("./config");

let mainWindow;
let watcher;
let previewWindow;
let settingsWindow;

const isDev = process.env.NODE_ENV !== "development";

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));

    ipcMain.handle("select-dirs", async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"],
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const selectedFolder = result.filePaths[0];
            return selectedFolder;
        }

        return null;
    });

    ipcMain.handle("start-monitoring", (event, folderPath) => {
        if (watcher) {
            watcher.close();
        }

        // Start a new watcher
        watcher = chokidar.watch(folderPath, {
            ignored: [/[/\\]\./, /\.tmp$/, /\.crdownload$/],
            persistent: true,
        });

        let initialScan = true;

        watcher
            .on("add", (path) => {
                if (!initialScan) {
                    const fileInfo = getFileInformation(path, "add");
                    mainWindow.webContents.send("file-added", fileInfo);
                }
            })
            .on("change", (path) => {
                if (!initialScan) {
                    const fileInfo = getFileInformation(path, "change");
                    mainWindow.webContents.send("file-changed", fileInfo);
                }
            })
            .on("unlink", (path) => {
                if (!initialScan) {
                    const fileInfo = getFileInformation(path, "unlink");
                    mainWindow.webContents.send("file-removed", fileInfo);
                }
            })
            .on("ready", () => {
                initialScan = false;
            });
    });

    ipcMain.handle("stop-monitoring", () => {
        if (watcher) {
            watcher.close();
        }
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

ipcMain.on("open-preview-window", (event, fileInfo) => {
    openPreviewWindow(fileInfo);
});

function openPreviewWindow(fileInfo) {
    previewWindow = new BrowserWindow({
        width: 800,
        height: 650,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    previewWindow.loadFile(path.join(__dirname, "renderer/previewWindow.html"));

    previewWindow.webContents.openDevTools();

    previewWindow.webContents.once("did-finish-load", () => {
        const subject = config.generateSubject(fileInfo);
        const recipients = config.generateRecipients();
        const message = config.generateMessage(fileInfo);

        previewWindow.webContents.send("file-info", {
            subject,
            recipients,
            message,
        });
    });

    previewWindow.on("closed", () => {
        previewWindow = null;
    });
}

function getFileInformation(path, eventType) {
    const name = path.split("\\").pop();
    const dateModified = new Date();
    const type = name.split(".").pop();
    return {name, dateModified, type, eventType};
}

function openSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 800,
        height: 650,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    settingsWindow.loadFile(
        path.join(__dirname, "renderer/settingsWindow.html")
    );

    settingsWindow.webContents.once("did-finish-load", () => {
        const username = config.generateUsername();
        const password = config.generatePassword();
        const apiKey = config.generateApiKey();

        settingsWindow.webContents.send("send-config", {
            username,
            password,
            apiKey,
        });
    });

    settingsWindow.webContents.openDevTools();

    settingsWindow.on("closed", () => {
        settingsWindow = null;
    });
}

ipcMain.on("save-config", (event, config) => {
    config.saveConfig(config);
});

const menu = [
    {
        label: "File",
        submenu: [
            {
                label: "Settings",
                click: () => openSettingsWindow(),
            },
            {
                label: "Quit",
                click: () => app.quit(),
                accelerator: "CmdOrCtrl+W",
            },
        ],
    },
];

app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("active", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        app.quit();
    }
});
