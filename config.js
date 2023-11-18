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

module.exports = {
    generateSubject,
    generateRecipients,
    generateMessage,
};
