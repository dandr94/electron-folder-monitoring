const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("node:path");
const chokidar = require("chokidar");

let mainWindow;
let watcher;
let previewWindow;

const isDev = process.env.NODE_ENV !== "development";

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 500,
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
            ignored: [/[/\\]\./, /\.tmp$/, /\.crdownload$/], // ignore dotfiles
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
        width: 600,
        height: 400,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // Load the preview window HTML file
    previewWindow.loadFile(path.join(__dirname, "renderer/previewWindow.html"));

    // Wait for the preview window to finish loading
    previewWindow.webContents.once("did-finish-load", () => {
        // Generate data for preview
        const subject = generateSubject(fileInfo);
        const recipients = generateRecipients();
        const message = generateMessage(fileInfo);
        console.log(`${subject}-${recipients}-${message}`);
        // Send fileInfo to the renderer process of the preview window
        previewWindow.webContents.send("file-info", {
            subject,
            recipients,
            message,
        });
    });

    // Additional event handling
    previewWindow.once("ready-to-show", () => {
        previewWindow.show();
    });

    // Handle window close event
    previewWindow.on("closed", () => {
        previewWindow = null;
    });
}

function getFileInformation(path, eventType) {
    const name = path.split("\\").pop();
    const dateModified = new Date();
    const type = name.split(".").pop();
    return { name, dateModified, type, eventType };
}

function generateSubject(fileInfo) {
    return `${fileInfo.name} has been ${fileInfo.eventType}. Please check it out.`;
}

function generateRecipients() {
    return [
        "recipient1@example.com",
        "recipient2@example.com",
        "recipient3@example.com",
    ];
}

function generateMessage(fileInfo) {
    return `${fileInfo.name} has been ${fileInfo.eventType}. Please check it out.`;
}

const menu = [
    {
        label: "File",
        submenu: [
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
