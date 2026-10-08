const WORKER_URL =
"https://detective-ai-curly-king-4e00.martinpsa.workers.dev";

function showImport(){

document.getElementById(
"importPanel"
).style.display = "block";

}

function addMessage(
speaker,
message
){

const chat =
document.getElementById(
"chat"
);

chat.innerHTML +=
"<p><b>" +
speaker +
":</b> " +
message +
"</p>";

chat.scrollTop =
chat.scrollHeight;

}

async function importCase(){

try{

const caseJson =
document.getElementById(
"caseJson"
).value;

const data =
JSON.parse(caseJson);

const response =
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
data
)
}
);

const result =
await response.json();

localStorage.setItem(
"caseId",
result.caseId
);

await loadCase();

addMessage(
"SYSTEM",
"Case imported successfully."
);

}
catch(err){

alert(
"Invalid JSON."
);

}

}

async function loadCase(){

const caseId =
localStorage.getItem(
"caseId"
);

if(!caseId){
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
).innerHTML =
data.title || "";

document.getElementById(
"victim"
).innerHTML =
data.victim || "";

document.getElementById(
"setting"
).innerHTML =
data.setting || "";

populateSuspects(
data.suspects || []
);

}

function populateSuspects(
suspects
){

const select =
document.getElementById(
"suspectSelect"
);

select.innerHTML =
'<option value="">Choose Suspect</option>';

suspects.forEach(
function(s){

const option =
document.createElement(
"option"
);

option.value =
s.name;

option.innerHTML =
s.name;

select.appendChild(
option
);

}
);

}

async function sendMessage(){

const caseId =
localStorage.getItem(
"caseId"
);

if(!caseId){

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
"YOU",
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
)
.value,

suspectName:
document
.getElementById(
"suspectSelect"
)
.value,

message:message

})
}
);

const data =
await response.json();

addMessage(
"AI",
data.reply
);

}

function saveNotes(){

localStorage.setItem(
"notes",
document.getElementById(
"notes"
).value
);

}

function loadNotes(){

document.getElementById(
"notes"
).value =
localStorage.getItem(
"notes"
) || "";

}

function exportCase(){

const caseId =
localStorage.getItem(
"caseId"
);

alert(
"Current Case ID:\n\n" +
caseId
);

}

document
.getElementById(
"notes"
)
.addEventListener(
"keyup",
saveNotes
);

loadNotes();
loadCase();