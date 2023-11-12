window.api.on("file-info", (fileInfo) => {
    console.log(`file-info in renderer.js:`, fileInfo);

    // Set subject and message values
    document.getElementById("subject").value = fileInfo.subject;
    document.getElementById("message").value = fileInfo.message;

    // Clear existing recipients
    const recipientsList = document.getElementById("recipients");
    recipientsList.innerHTML = "";

    // Add new recipients
    fileInfo.recipients.forEach((recipient) => {
        addRecipientToList(recipient);
    });

    // Function to add a recipient to the list
    function addRecipientToList(recipient) {
        const listItem = document.createElement("li");
        listItem.textContent = recipient;
        recipientsList.appendChild(listItem);
    }
});