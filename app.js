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

function addMessage(type, text) {

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

async function importCase() {

    try {

        const caseData =
            JSON.parse(
                document.getElementById(
                    "caseJson"
                ).value
            );

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
                    body: JSON.stringify(
                        caseData
                    )
                }
            );

        const data =
            await response.json();

        localStorage.setItem(
            "caseId",
            data.caseId
        );

        addMessage(
            "system",
            "Case imported."
        );

        loadCase();

    } catch {

        alert(
            "Invalid JSON."
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

    populateSuspects(
        data.suspects || []
    );

    populateLocations(
        data.locations || []
    );
}

function populateSuspects(
    suspects
) {

    const select =
        document.getElementById(
            "suspectSelect"
        );

    select.innerHTML =
        '<option value="">Choose Suspect</option>';

    suspects.forEach(
        s => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                s.name;

            option.textContent =
                s.name;

            select.appendChild(
                option
            );
        }
    );
}

function populateLocations(
    locations
) {

    const select =
        document.getElementById(
            "locationSelect"
        );

    select.innerHTML =
        '<option value="">Choose Location</option>';

    locations.forEach(
        l => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                l.name;

            option.textContent =
                l.name;

            select.appendChild(
                option
            );
        }
    );
}

async function sendMessage() {

    const caseId =
        localStorage.getItem(
            "caseId"
        );

    if (!caseId) {

        alert(
            "Import a case first."
        );

        return;
    }

    const message =
        document.getElementById(
            "message"
        ).value;

    addMessage(
        "user",
        message
    );

    document.getElementById(
        "message"
    ).value = "";

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

                body: JSON.stringify({

                    caseId,

                    agent:
                    document.getElementById(
                        "agent"
                    ).value,

                    suspectName:
                    document.getElementById(
                        "suspectSelect"
                    ).value,

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
}

async function generateImage(
    imageType
) {

    const caseId =
        localStorage.getItem(
            "caseId"
        );

    if (