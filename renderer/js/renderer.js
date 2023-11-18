document.getElementById("browseButton").addEventListener("click", async () => {
    const selectedFolder = await window.api.selectDirs();

    if (selectedFolder) {
        document.querySelector(".text-label").innerText = `${selectedFolder}`;
        document.querySelector(".text-label").title = `${selectedFolder}`;
        document.querySelector(".middle-bar").style.display = "inline-block";
        window.selectedFolder = selectedFolder;
    }
});

document
    .getElementById("startMonitoringButton")
    .addEventListener("click", () => {
        const stopMonitoringButton = document.getElementById(
            "stopMonitoringButton"
        );
        const startMonitoringButton = document.getElementById(
            "startMonitoringButton"
        );

        const monitoringIcon = document.getElementById("monitoringIcon");
        const browseButton = document.getElementById("browseButton");

        monitoringIcon.classList.remove("fa-eye-slash");
        monitoringIcon.classList.add("fa-eye");

        window.api.startMonitoring(window.selectedFolder);

        startMonitoringButton.style.display = "none";
        stopMonitoringButton.style.display = "inline-block";
        browseButton.disabled = true;
        browseButton.style.backgroundColor = "#ccc";
    });

document
    .getElementById("stopMonitoringButton")
    .addEventListener("click", () => {
        const stopMonitoringButton = document.getElementById(
            "stopMonitoringButton"
        );
        const startMonitoringButton = document.getElementById(
            "startMonitoringButton"
        );
        const monitoringIcon = document.getElementById("monitoringIcon");
        const browseButton = document.getElementById("browseButton");

        monitoringIcon.classList.remove("fa-eye");
        monitoringIcon.classList.add("fa-eye-slash");

        window.api.stopMonitoring();

        startMonitoringButton.style.display = "inline-block";
        stopMonitoringButton.style.display = "none";

        browseButton.disabled = false;
        browseButton.style.backgroundColor = "#007bff";
    });

let totalEntries = 0;

function updateFileTable(fileInfo) {
    const fileTableBody = document.getElementById("fileTableBody");
    const row = fileTableBody.insertRow();

    if (totalEntries >= 5) {
        fileTableBody.deleteRow(fileTableBody.rows.length - 1);
    } else {
        totalEntries++;
    }

    const nameCell = row.insertCell(0);
    const dateModifiedCell = row.insertCell(1);
    const typeCell = row.insertCell(2);
    const statusCell = row.insertCell(3);
    const previewCell = row.insertCell(4);

    nameCell.innerText = fileInfo.name;
    nameCell.title = fileInfo.name;

    dateModifiedCell.innerHTML = `<div>${new Date(
        fileInfo.dateModified
    ).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })}</div><div>${new Date(fileInfo.dateModified).toLocaleTimeString(
        "en-GB",
        {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
        }
    )}</div>`;

    typeCell.innerText = fileInfo.type;

    switch (fileInfo.eventType) {
        case "add":
            statusCell.innerText = "Added";
            fileInfo.eventType = "Added";
            break;
        case "change":
            statusCell.innerText = "Modified";
            fileInfo.eventType = "Modified";
            break;
        case "unlink":
            statusCell.innerText = "Deleted";
            fileInfo.eventType = "Deleted";
            break;
        default:
            statusCell.innerText = "Unknown";
            fileInfo.eventType = "Unknown";
    }

    const previewButton = document.createElement("button");
    previewButton.innerHTML =
        '<i id="reply-button"class="fa-solid fa-reply"></i>';
    previewButton.className = "preview-button";
    previewButton.title = "Preview Email";

    previewButton.addEventListener("click", () => {
        console.log(fileInfo);
        window.api.send("open-preview-window", fileInfo);
    });

    previewCell.appendChild(previewButton);

    const rows = Array.from(fileTableBody.rows);
    rows.sort((a, b) => {
        const dateA = new Date(a.cells[1].innerText);
        const dateB = new Date(b.cells[1].innerText);
        return dateB - dateA;
    });

    fileTableBody.innerHTML = "";

    rows.forEach((row) => {
        fileTableBody.appendChild(row);
    });
}

window.api.on("file-added", (fileInfo) => {
    updateFileTable(fileInfo);
});

window.api.on("file-changed", (fileInfo) => {
    updateFileTable(fileInfo);
});

window.api.on("file-removed", (fileInfo) => {
    updateFileTable(fileInfo);
});
