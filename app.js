const WORKER_URL="https://detective-ai-curly-king-4e00.martinpsa.workers.dev";
function showImport(){const p=document.getElementById("importPanel");p.style.display=p.style.display==="block"?"none":"block";}
function clearChat(){document.getElementById("chat").innerHTML="";}

function addMessage(type, text) {

    const chat =
        document.getElementById("chat");

    let content = text;

    if (
        type === "ai" ||
        type === "system"
    ) {
        content = marked.parse(text);
    } else {
        content = text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    chat.innerHTML +=
        "<div class='" +
        type +
        "-message'>" +
        content +
        "</div>";

    chat.scrollTop =
        chat.scrollHeight;
}

async function importCase(){try{const obj=JSON.parse(document.getElementById('caseJson').value);const r=await fetch(WORKER_URL+'/import-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});const d=await r.json();localStorage.setItem('caseId',d.caseId);addMessage('system','Case imported');loadCase();}catch(e){alert('Invalid JSON');}}

async function loadCase(){const id=localStorage.getItem('caseId');if(!id)return;const r=await fetch(WORKER_URL+'/case?id='+encodeURIComponent(id));const d=await r.json();document.getElementById('caseTitle').textContent=d.title||'';document.getElementById('victim').textContent=d.victim||'';document.getElementById('setting').textContent=d.setting||'';const s=document.getElementById('suspectSelect');s.innerHTML='<option value="">Choose Suspect</option>';(d.suspects||[]).forEach(x=>{const o=document.createElement('option');o.value=x.name;o.textContent=x.name;s.appendChild(o);});}

async function sendMessage(){const caseId=localStorage.getItem('caseId');if(!caseId){alert('Import a case first');return;}const msg=document.getElementById('message').value;if(!msg)return;addMessage('user',msg);document.getElementById('message').value='';const r=await fetch(WORKER_URL+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId,agent:document.getElementById('agent').value,suspectName:document.getElementById('suspectSelect').value,message:msg})});const d=await r.json();addMessage('ai',d.reply||d.error||'No response');}
document.getElementById('notes').addEventListener('keyup',function(){localStorage.setItem('notes',this.value);});document.getElementById('notes').value=localStorage.getItem('notes')||'';loadCase();