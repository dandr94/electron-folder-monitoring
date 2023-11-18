const addRecipientIcon = document.getElementById("add-recipient");

addRecipientIcon.addEventListener("click", () => addRecipientInput());

function addRecipientInput() {
    const recipientsList = document.getElementById("recipients");

    const newRecipientInput = document.createElement("input");
    newRecipientInput.type = "text";
    newRecipientInput.placeholder = "Enter recipient";
    newRecipientInput.addEventListener("keydown", (event) =>
        handleRecipientKeydown(event)
    );

    const cancelIcon = createCancelIcon("", null, null);
    cancelIcon.addEventListener("click", () =>
        newRecipientInput.parentElement.remove()
    );

    const listItem = document.createElement("li");
    listItem.appendChild(newRecipientInput);
    listItem.appendChild(cancelIcon);

    recipientsList.appendChild(listItem);

    newRecipientInput.focus();
}

function handleRecipientKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();

        const enteredRecipient = event.target.value.trim();
        if (enteredRecipient) {
            const recipientsList = document.getElementById("recipients");

            const cancelIcon = createCancelIcon(enteredRecipient, null, null);
            cancelIcon.addEventListener("click", () => listItem.remove());

            const listItem = document.createElement("li");
            listItem.textContent = enteredRecipient;
            listItem.appendChild(cancelIcon);

            recipientsList.appendChild(listItem);

            event.target.parentElement.remove();
        } else {
            event.target.parentElement.remove();
        }
    }
}

function createCancelIcon(recipient, listItem, fileInfo) {
    const cancelIcon = document.createElement("i");
    cancelIcon.classList.add("cancel-icon", "fa-solid", "fa-xmark");
    cancelIcon.addEventListener("click", () =>
        removeRecipient(recipient, listItem, fileInfo)
    );
    return cancelIcon;
}

function removeRecipient(recipient, listItem, fileInfo) {
    listItem.remove();

    const index = fileInfo.recipients.indexOf(recipient);
    if (index !== -1) {
        fileInfo.recipients.splice(index, 1);
    }
}

function createListItem(recipient, fileInfo) {
    const listItem = document.createElement("li");
    const recipientContainer = document.createElement("span");
    recipientContainer.textContent = recipient;
    recipientContainer.appendChild(
        createCancelIcon(recipient, listItem, fileInfo)
    );
    listItem.appendChild(recipientContainer);
    listItem.dataset.recipient = recipient;
    return listItem;
}

function addRecipientToList(recipient, fileInfo) {
    const recipientsList = document.getElementById("recipients");
    const listItem = createListItem(recipient, fileInfo);
    recipientsList.appendChild(listItem);
}

window.api.on("file-info", (fileInfo) => {
    document.getElementById("subject").value = fileInfo.subject;
    document.getElementById("message").value = fileInfo.message;

    const recipientsList = document.getElementById("recipients");
    recipientsList.innerHTML = "";

    fileInfo.recipients.forEach((recipient) => {
        addRecipientToList(recipient, fileInfo);
    });
});
