function getUpdatedValues() {
    const updatedUsername = document.getElementById("username").value;
    const updatedPassword = document.getElementById("password").value;
    const updatedApiKey = document.getElementById("apikey").value;

    return {
        username: updatedUsername,
        password: updatedPassword,
        apiKey: updatedApiKey,
    };
}

function showSuccessMessage(message) {
    const successMessage = document.createElement("div");
    successMessage.classList.add("success-message");
    successMessage.textContent = message;

    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

function showErrorMessage(message) {
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.textContent = message;

    document.body.appendChild(errorMessage);

    setTimeout(() => {
        errorMessage.remove();
    }, 3000);
}

function saveData() {
    const updatedValues = getUpdatedValues();

    window.config.saveConfig(updatedValues);
}

window.api.on("send-config", (configData) => {
    document.getElementById("username").value = configData.username;
    document.getElementById("password").value = configData.password;
    document.getElementById("apikey").value = configData.apiKey;

    const saveButton = document.getElementById("save-button");

    saveButton.addEventListener("click", () => {
        saveData();
    });
});
