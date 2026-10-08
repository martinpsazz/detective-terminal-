const WORKER_URL =
    "https://detective-ai-curly-king-4e00.martinpsa.workers.dev";

function showImport() {

    const panel =
        document.getElementById(
            "importPanel"
        );

    panel.style.display =
        panel.style.display === "block"
            ? "none"
            : "block";
}

function clearChat() {

    document.getElementById(
        "chat"
    ).innerHTML = "";
}

function addMessage(
    type,
    text
) {

    const chat =
        document.getElementById(
            "chat"
        );

    let html = text;

    if (
        (type === "ai" ||
         type === "system") &&
        window.marked
    ) {

        html =
            marked.parse(text);

    }

    chat.innerHTML +=
        `<div class="${type}-message">${html}</div>`;

    chat.scrollTop =
        chat.scrollHeight;
}

async function loadSavedCases() {

    try {

        const response =
            await fetch(
                WORKER_URL +
                "/cases"
            );

        const cases =
            await response.json();

        const select =
            document.getElementById(
                "savedCases"
            );

        select.innerHTML =
            '<option value="">Choose Saved Case</option>';

        if (
            !Array.isArray(
                cases
            )
        ) {
            return;
        }

        cases.forEach(
            c => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    c.caseId;

                option.textContent =
                    c.title ||
                    c.caseId;

                select.appendChild(
                    option
                );
            }
        );

    } catch (error) {

        console.error(
            "Failed to load cases",
            error
        );

    }
}

function loadSavedCase() {

    const caseId =
        document.getElementById(
            "savedCases"
        ).value;

    if (!caseId) {

        alert(
            "Select a saved case."
        );

        return;
    }

    localStorage.setItem(
        "caseId",
        caseId
    );

    loadCase();
}

async function importCase() {

    try {

        const raw =
            document.getElementById(
                "caseJson"
            ).value;

        const caseData =
            JSON.parse(raw);

        const response =
            await fetch(
                WORKER_URL +
                "/import-case",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            caseData
                        )
                }
            );

        const data =
            await response.json();

        if (data.error) {

            alert(
                data.error
            );

            return;
        }

        localStorage.setItem(
            "caseId",
            data.caseId
        );

        addMessage(
            "system",
            `Case imported: ${data.title}`
        );

        await loadCase();
        await loadSavedCases();

    } catch (error) {

        console.error(error);

        alert(
            "Invalid case JSON."
        );
    }
}

async function loadCase() {

    const caseId =
        localStorage.getItem(
            "caseId"
        );

    if (!caseId) {
        return;
    }

    try {

        const response =
            await fetch(
                WORKER_URL +
                "/case?id=" +
                encodeURIComponent(
                    caseId
                )
            );

        const data =
            await response.json();

        if (data.error) {

            addMessage(
                "system",
                data.error
            );

            return;
        }

        document.getElementById(
            "caseTitle"
        ).textContent =
            data.title || "";

        document.getElementById(
            "victim"
        ).textContent =
            data.victim || "";

        document.getElementById(
            "setting"
        ).textContent =
            data.setting || "";

        const suspectSelect =
            document.getElementById(
                "suspectSelect"
            );

        suspectSelect.innerHTML =
            '<option value="">Choose Suspect</option>';

        (
            data.suspects || []
        ).forEach(
            suspect => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    suspect.name;

                option.textContent =
                    suspect.name;

                suspectSelect.appendChild(
                    option
                );

            }
        );

        const locationSelect =
            document.getElementById(
                "locationSelect"
            );

        locationSelect.innerHTML =
            '<option value="">Choose Location</option>';

        (
            data.locations || []
        ).forEach(
            location => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    location.name;

                option.textContent =
                    location.name;

                locationSelect.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(error);

    }
}

async function sendMessage() {

    const caseId =
        localStorage.getItem(
            "caseId"
        );

    if (!caseId) {

        alert(
            "Load a case first."
        );

        return;
    }

    const messageBox =
        document.getElementById(
            "message"
        );

    const message =
        messageBox.value.trim();

    if (!message) {
        return;
    }

    addMessage(
        "user",
        message
    );

    messageBox.value = "";

    try {

        const response =
            await fetch(
                WORKER_URL +
                "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            caseId,

                            agent:
                            document
                            .getElementById(
                                "agent"
                            )
                            .value,

                            suspectName:
                            document
                            .getElementById(
                                "suspectSelect"
                            )
                            .value,

                            message

                        })
                }
            );

        const data =
            await response.json();

        addMessage(
            "ai",
            data.reply ||
            data.error ||
            "No response."
        );

    } catch (error) {

        console.error(error);

        addMessage(
            "system",
            "Chat request failed."
        );

    }
}

async function generateImage(
    imageType
) {

    const caseId =
        localStorage.getItem(
            "caseId"
        );

    if (!caseId) {

        alert(
            "Load a case first."
        );

        return;
    }

    document.getElementById(
        "imageStatus"
    ).textContent =
        "Generating image...";

    try {

        const response =
            await fetch(
                WORKER_URL +
                "/image",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            caseId,

                            imageType,

                            location:
                            document
                            .getElementById(
                                "locationSelect"
                            )
                            .value,

                            suspect:
                            document
                            .getElementById(
                                "suspectSelect"
                            )
                            .value

                        })
                }
            );

        const blob =
            await response.blob();

        const imageUrl =
            URL.createObjectURL(
                blob
            );

        const image =
            document.getElementById(
                "generatedImage"
            );

        image.src =
            imageUrl;

        image.style.display =
            "block";

        document.getElementById(
            "imageStatus"
        ).textContent =
            "Image generated.";

    } catch (error) {

        console.error(error);

        document.getElementById(
            "imageStatus"
        ).textContent =
            "Image generation failed.";
    }
}

function generateSceneMap() {
    generateImage("scene-map");
}

function generateCrimeScene() {
    generateImage("crime-scene");
}

function generateEvidenceBoard() {
    generateImage("evidence-board");
}

function generateSuspectPhoto() {
    generateImage("suspect-photo");
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const notes =
            document.getElementById(
                "notes"
            );

        notes.value =
            localStorage.getItem(
                "notes"
            ) || "";

        notes.addEventListener(
            "keyup",
            function() {

                localStorage.setItem(
                    "notes",
                    this.value
                );

            }
        );

        loadSavedCases();
        loadCase();

    }
);