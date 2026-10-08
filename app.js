const WORKER_URL =
"https://detective-ai-curly-king-4e00.martinpsa.workers.dev";

function showImport() {

    var panel =
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

function addMessage(type,text){

    var chat =
        document.getElementById(
            "chat"
        );

    chat.innerHTML +=
        "<p class='" +
        type +
        "'><strong>" +
        type.toUpperCase() +
        ":</strong> " +
        text +
        "</p>";

    chat.scrollTop =
        chat.scrollHeight;
}

async function importCase(){

    try{

        var jsonText =
            document.getElementById(
                "caseJson"
            ).value;

        var caseData =
            JSON.parse(jsonText);

        var response =
            await fetch(
                WORKER_URL +
                "/import-case",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:JSON.stringify(
                        caseData
                    )
                }
            );

        var result =
            await response.json();

        localStorage.setItem(
            "caseId",
            result.caseId
        );

        addMessage(
            "system",
            "Case imported."
        );

        loadCase();

    }catch(error){

        alert(
            "Invalid JSON"
        );

    }
}

async function loadCase(){

    var caseId =
        localStorage.getItem(
            "caseId"
        );

    if(!caseId){
        return;
    }

    var response =
        await fetch(
            WORKER_URL +
            "/case?id=" +
            encodeURIComponent(
                caseId
            )
        );

    var data =
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
}

function populateSuspects(
    suspects
){

    var select =
        document.getElementById(
            "suspectSelect"
        );

    select.innerHTML =
        '<option value="">Choose Suspect</option>';

    suspects.forEach(function(s){

        var option =
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

    });
}

async function sendMessage(){

    var caseId =
        localStorage.getItem(
            "caseId"
        );

    if(!caseId){

        alert(
            "Import a case first."
        );

        return;
    }

    var messageBox =
        document.getElementById(
            "message"
        );

    var message =
        messageBox.value;

    if(!message){
        return;
    }

    addMessage(
        "user",
        message
    );

    messageBox.value = "";

    var response =
        await fetch(
            WORKER_URL +
            "/chat",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    caseId:caseId,

                    agent:
                    document
                    .getElementById(
                        "agent"
                    ).value,

                    suspectName:
                    document
                    .getElementById(
                        "suspectSelect"
                    ).value,

                    message:message
                })
            }
        );

    var data =
        await response.json();

    addMessage(
        "ai",
        data.reply ||
        data.error
    );
}

document
.getElementById(
    "notes"
)
.addEventListener(
    "keyup",
    function(){

        localStorage.setItem(
            "notes",
            this.value
        );

    }
);

document.getElementById(
    "notes"
).value =
    localStorage.getItem(
        "notes"
    ) || "";

loadCase();