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

function getUpdatedValues() {
    const updatedSubject = document.getElementById("subject").value;
    const updatedRecipients = Array.from(
        document.querySelectorAll("#recipients li")
    ).map((li) => li.textContent);
    const updatedMessage = document.getElementById("message").value;

    return {
        subject: updatedSubject,
        recipients: updatedRecipients,
        message: updatedMessage,
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

function sendEmail() {
    const updatedValues = getUpdatedValues();

    if (updatedValues.recipients.length === 0) {
        showErrorMessage("Please enter at least one recipient.");
        return;
    }

    fetch("http://127.0.0.1:8000/api/send_email/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "007FcXtvaq45QHVoGUXqiJ7tIqHlle-Z9KRjqDZn_hc",
        },
        body: JSON.stringify({
            sender_email: "sealdere@gmail.com",
            sender_password: "sgwh eqji yrku rjry",
            to_email: updatedValues["recipients"],
            subject: updatedValues["subject"],
            message: updatedValues["message"],
        }),
    })
        .then((response) => response.json())
        .then((data) => showSuccessMessage(data.message))
        .catch((error) =>
            showErrorMessage(
                "Something went wrong. Email has not been successfully send!"
            )
        );
}

window.api.on("file-info", (fileInfo) => {
    document.getElementById("subject").value = fileInfo.subject;
    document.getElementById("message").value = fileInfo.message;

    const sendEmailButton = document.getElementById("send-email");

    const recipientsList = document.getElementById("recipients");
    recipientsList.innerHTML = "";

    fileInfo.recipients.forEach((recipient) => {
        addRecipientToList(recipient, fileInfo);
    });

    sendEmailButton.addEventListener("click", () => sendEmail());
});
