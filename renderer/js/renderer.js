// renderer.js

document.getElementById("browseButton").addEventListener("click", async () => {
    const selectedFolder = await window.api.selectDirs();

    if (selectedFolder) {
        document.querySelector(".text-label").innerText = `${selectedFolder}`;
        document.querySelector(".monitoring").style.display = "inline-block";
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

        monitoringIcon.classList.remove("fa-eye-slash");
        monitoringIcon.classList.add("fa-eye");

        window.api.startMonitoring(window.selectedFolder);

        startMonitoringButton.style.display = "none";
        stopMonitoringButton.style.display = "inline-block";
        document.getElementById("browseButton").disabled = "true";
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

        monitoringIcon.classList.remove("fa-eye");
        monitoringIcon.classList.add("fa-eye-slash");

        window.api.stopMonitoring();

        startMonitoringButton.style.display = "inline-block";
        stopMonitoringButton.style.display = "none";
        document.getElementById("browseButton").disabled = "false";
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
    dateModifiedCell.innerText = new Date(fileInfo.dateModified).toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
        }
    );
    typeCell.innerText = fileInfo.type;

    switch (fileInfo.eventType) {
        case "add":
            statusCell.innerText = "Added";
            break;
        case "change":
            statusCell.innerText = "Modified";
            break;
        case "unlink":
            statusCell.innerText = "Deleted";
            break;
        default:
            statusCell.innerText = "Unknown";
    }

    const previewButton = document.createElement("button");
    previewButton.innerHTML =
        '<i id="reply-button"class="fa-solid fa-reply"></i>';
    previewButton.className = "preview-button";
    previewButton.title = "Preview Email";
    previewButton.addEventListener("click", () => {
        // Use IPC to send the 'open-preview-window' event to the main process
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

// Event listener for the "file-added" event
window.api.on("file-added", (fileInfo) => {
    updateFileTable(fileInfo);
});

// Event listener for the "file-changed" event
window.api.on("file-changed", (fileInfo) => {
    updateFileTable(fileInfo);
});

// Event listener for the "file-removed" event
window.api.on("file-removed", (fileInfo) => {
    updateFileTable(fileInfo);
});

// Event listener for the "file-info" event in the preview window
window.api.on("file-info", (fileInfo) => {
    console.log(`Received file-info in renderer.js:`, fileInfo);
    // Update HTML with fileInfo data
    document.getElementById("subject").value = fileInfo.subject;
    document.getElementById("recipients").value =
        fileInfo.recipients.join(", ");
    document.getElementById("message").value = fileInfo.message;
});
