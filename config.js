const fs = require("fs");
const path = require("path");

const configFile = path.join(__dirname, "config.json");

function loadConfig() {
    try {
        const configData = fs.readFileSync(configFile, "utf8");
        return JSON.parse(configData);
    } catch (error) {
        console.error("Error loading configuration:", error.message);
        return null;
    }
}

function saveConfig(config) {
    try {
        const configJSON = JSON.stringify(config, null, 2);
        fs.writeFileSync(configFile, configJSON, "utf8");
        console.log("Config saved successfully!");
    } catch (error) {
        console.error("Error saving configuration:", error.message);
    }
}

function replaceVariables(template, variables) {
    return template.replace(
        /\{(\w+)\}/g,
        (match, variable) => variables[variable] || match
    );
}

function generateSubject(fileInfo) {
    const config = loadConfig();
    return config ? replaceVariables(config.defaultSubject, fileInfo) : "";
}

function generateRecipients() {
    const config = loadConfig();
    return config ? config.defaultRecipients || [] : [];
}

function generateMessage(fileInfo) {
    const config = loadConfig();
    return config ? replaceVariables(config.defaultMessage, fileInfo) : "";
}

function generateUsername() {
    const config = loadConfig();
    return config ? config.username : "";
}

function generatePassword() {
    const config = loadConfig();
    return config ? config.password : "";
}

function generateApiKey() {
    const config = loadConfig();
    return config ? config.apiKey : "";
}

module.exports = {
    generateSubject,
    generateRecipients,
    generateMessage,
    generateUsername,
    generatePassword,
    generateApiKey,
    saveConfig,
};
