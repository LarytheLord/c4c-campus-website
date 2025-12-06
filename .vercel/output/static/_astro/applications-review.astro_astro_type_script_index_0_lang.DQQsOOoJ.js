import{s as f}from"../assets/supabase.DdTcER9f.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let h=null,d=[],y=[],c=new Set,r=null,v=[];async function I(){const{data:{session:e}}=await f.auth.getSession();if(!e)return window.location.href="/login",!1;h=e.user;const{data:t}=await f.from("applications").select("role").eq("user_id",h.id).single();return!t||t.role!=="admin"?(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("access-denied")?.classList.remove("hidden"),!1):!0}async function B(){try{const e=await fetch("/api/admin/reviewers",{credentials:"include"});if(e.ok){v=(await e.json()).reviewers||[];const n=document.getElementById("bulk-assign-select");v.forEach(a=>{const s=document.createElement("option");s.value=a.user_id,s.textContent=`${a.name} (${a.stats.pending} pending)`,n.appendChild(s)});const i=document.getElementById("reviewer-filter");v.forEach(a=>{const s=document.createElement("option");s.value=a.user_id,s.textContent=a.name,i.appendChild(s)})}}catch(e){console.error("Error loading reviewers:",e)}}async function $(){try{const{data:e,error:t}=await f.from("applications").select("*").order("created_at",{ascending:!1});if(t)throw t;d=e||[],y=[...d],w(),b()}catch(e){console.error("Error loading applications:",e),document.getElementById("empty-state")?.classList.remove("hidden")}}function w(){const e=d.length,t=d.filter(s=>s.status==="pending").length,n=d.filter(s=>s.status==="approved").length,i=d.filter(s=>s.status==="rejected").length,a=d.filter(s=>s.status==="waitlisted").length;document.getElementById("stat-total").textContent=e.toString(),document.getElementById("stat-pending").textContent=t.toString(),document.getElementById("stat-approved").textContent=n.toString(),document.getElementById("stat-rejected").textContent=i.toString(),document.getElementById("stat-waitlisted").textContent=a.toString()}function u(){const e=document.getElementById("search-input").value.toLowerCase(),t=document.getElementById("status-filter").value,n=document.getElementById("program-filter").value,i=document.getElementById("reviewer-filter").value;y=d.filter(a=>{const s=a.name.toLowerCase().includes(e)||a.email.toLowerCase().includes(e),o=!t||a.status===t,p=!n||a.program===n;let m=!0;return i==="unassigned"?m=!a.assigned_reviewer_id:i==="me"?m=a.assigned_reviewer_id===h.id:i&&(m=a.assigned_reviewer_id===i),s&&o&&p&&m}),b()}function b(){const e=document.getElementById("applications-list"),t=document.getElementById("empty-state");if(y.length===0){e.innerHTML="",t.classList.remove("hidden");return}t.classList.add("hidden"),e.innerHTML=y.map(n=>{const i=n.status==="pending"?"bg-yellow-500/10 text-yellow-500 border-yellow-500/20":n.status==="approved"?"bg-green-500/10 text-green-500 border-green-500/20":n.status==="rejected"?"bg-red-500/10 text-red-500 border-red-500/20":"bg-blue-500/10 text-blue-500 border-blue-500/20",a=n.program==="bootcamp"?"Bootcamp":n.program==="accelerator"?"Accelerator":"Hackathon",s=c.has(n.id),o=v.find(m=>m.user_id===n.assigned_reviewer_id),p=o?`<span class="text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded">Assigned to: ${o.name}</span>`:'<span class="text-xs px-2 py-1 bg-gray-500/10 text-gray-500 rounded">Unassigned</span>';return`
          <div class="card">
            <div class="flex items-start gap-4">
              <input type="checkbox" class="app-checkbox mt-1 rounded" data-app-id="${n.id}" ${s?"checked":""} />

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 class="font-semibold text-lg">${n.name}</h4>
                    <p class="text-sm text-text-muted">${n.email}</p>
                    ${n.whatsapp?`<p class="text-sm text-text-muted">WhatsApp: ${n.whatsapp}</p>`:""}
                  </div>
                  <div class="flex gap-2 items-start flex-shrink-0 flex-wrap">
                    <span class="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      ${a}
                    </span>
                    <span class="px-2 py-1 rounded text-xs font-medium border ${i}">
                      ${n.status}
                    </span>
                  </div>
                </div>

                <div class="mb-3">
                  ${p}
                </div>

                ${n.motivation?`
                  <div class="mb-3">
                    <p class="text-sm text-text-muted line-clamp-2">${n.motivation}</p>
                  </div>
                `:""}

                <div class="flex items-center gap-4 text-xs text-text-muted">
                  <span>Applied: ${new Date(n.created_at).toLocaleDateString()}</span>
                  ${n.reviewed_at?`<span>Reviewed: ${new Date(n.reviewed_at).toLocaleDateString()}</span>`:""}
                  ${n.assignment_date?`<span>Assigned: ${new Date(n.assignment_date).toLocaleDateString()}</span>`:""}
                </div>

                <div class="flex gap-2 mt-4">
                  <button class="view-btn btn btn-primary btn-sm" data-app-id="${n.id}">
                    View & Review
                  </button>
                  ${n.status==="pending"?`
                    <button class="quick-approve-btn btn btn-success btn-sm" data-app-id="${n.id}">
                      Quick Approve
                    </button>
                  `:""}
                </div>
              </div>
            </div>
          </div>
        `}).join(""),k(),x()}function k(){document.querySelectorAll(".app-checkbox").forEach(e=>{e.addEventListener("change",t=>{const n=t.target.dataset.appId;t.target.checked?c.add(n):c.delete(n),x()})}),document.querySelectorAll(".view-btn").forEach(e=>{e.addEventListener("click",t=>{const n=t.target.dataset.appId;A(n)})}),document.querySelectorAll(".quick-approve-btn").forEach(e=>{e.addEventListener("click",async t=>{const n=t.target.dataset.appId;await l([n],"approved","")})})}function x(){const e=c.size;document.getElementById("selection-count").textContent=`${e} selected`,["bulk-approve-btn","bulk-reject-btn","bulk-waitlist-btn","bulk-assign-select","bulk-assign-btn"].forEach(n=>{const i=document.getElementById(n);(i instanceof HTMLButtonElement||i instanceof HTMLSelectElement)&&(i.disabled=e===0)})}async function l(e,t,n){try{const i=await fetch("/api/admin/update-application-status",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({application_ids:e,status:t,decision_note:n,send_email:!0})}),a=await i.json();if(!i.ok)throw new Error(a.error||"Failed to update status");e.forEach(s=>{const o=d.find(p=>p.id===s);o&&(o.status=t,o.reviewed_at=new Date().toISOString(),o.reviewed_by=h.id,n&&(o.decision_note=n))}),c.clear(),w(),u(),alert(`Successfully updated ${e.length} application(s). Emails sent: ${a.email_results?.success||0}`)}catch(i){console.error("Error updating status:",i),alert("Failed to update application status. Please try again.")}}async function L(e,t){try{const n=await fetch("/api/admin/assign-reviewer",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({application_ids:e,reviewer_id:t})}),i=await n.json();if(!n.ok)throw new Error(i.error||"Failed to assign reviewer");e.forEach(a=>{const s=d.find(o=>o.id===a);s&&(s.assigned_reviewer_id=t,s.assignment_date=t?new Date().toISOString():null)}),c.clear(),u(),alert(i.message)}catch(n){console.error("Error assigning reviewer:",n),alert("Failed to assign reviewer. Please try again.")}}async function E(e){try{const t=await fetch(`/api/admin/review-notes?application_id=${e}`,{credentials:"include"});if(t.ok){const n=await t.json();_(n.notes||[])}}catch(t){console.error("Error loading notes:",t)}}function _(e){const t=document.getElementById("notes-list");if(e.length===0){t.innerHTML='<p class="text-sm text-text-muted">No review notes yet</p>';return}t.innerHTML=e.map(n=>`
        <div class="border border-border rounded-lg p-3">
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="text-sm font-semibold">${n.reviewer_name}</span>
              <span class="text-xs text-text-muted ml-2">${new Date(n.created_at).toLocaleString()}</span>
            </div>
            ${n.is_internal?'<span class="text-xs px-2 py-1 bg-gray-500/10 text-gray-500 rounded">Internal</span>':""}
          </div>
          <p class="text-sm">${n.note}</p>
        </div>
      `).join("")}async function S(e,t){try{if((await fetch("/api/admin/review-notes",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({application_id:e,note:t,is_internal:!0})})).ok)await E(e),document.getElementById("new-note-input").value="";else throw new Error("Failed to add note")}catch(n){console.error("Error adding note:",n),alert("Failed to add note. Please try again.")}}async function A(e){const t=d.find(i=>i.id===e);if(!t)return;r=t;const n=document.getElementById("modal-content");n.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-1">Name</h4>
            <p class="text-text-muted">${t.name}</p>
          </div>
          <div>
            <h4 class="font-semibold mb-1">Email</h4>
            <p class="text-text-muted">${t.email}</p>
          </div>
          ${t.whatsapp?`
            <div>
              <h4 class="font-semibold mb-1">WhatsApp</h4>
              <p class="text-text-muted">${t.whatsapp}</p>
            </div>
          `:""}
          ${t.location?`
            <div>
              <h4 class="font-semibold mb-1">Location</h4>
              <p class="text-text-muted">${t.location}</p>
            </div>
          `:""}
          ${t.discord?`
            <div>
              <h4 class="font-semibold mb-1">Discord</h4>
              <p class="text-text-muted">${t.discord}</p>
            </div>
          `:""}
          <div>
            <h4 class="font-semibold mb-1">Program</h4>
            <p class="text-text-muted">${t.program}</p>
          </div>
        </div>

        ${t.motivation?`
          <div class="mt-6">
            <h4 class="font-semibold mb-2">Motivation</h4>
            <p class="text-text-muted">${t.motivation}</p>
          </div>
        `:""}
        ${t.technical_experience?`
          <div class="mt-4">
            <h4 class="font-semibold mb-2">Technical Experience</h4>
            <p class="text-text-muted">${t.technical_experience}</p>
          </div>
        `:""}
        ${t.commitment?`
          <div class="mt-4">
            <h4 class="font-semibold mb-2">Commitment</h4>
            <p class="text-text-muted">${t.commitment}</p>
          </div>
        `:""}
        ${t.interests?`
          <div class="mt-4">
            <h4 class="font-semibold mb-2">Interests</h4>
            <p class="text-text-muted">${t.interests.join(", ")}</p>
          </div>
        `:""}
      `,await E(e),document.getElementById("detail-modal")?.classList.remove("hidden")}function g(){document.getElementById("detail-modal")?.classList.add("hidden"),r=null}async function j(){await I()&&(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("applications-content")?.classList.remove("hidden"),await B(),await $())}document.getElementById("search-input")?.addEventListener("input",u);document.getElementById("status-filter")?.addEventListener("change",u);document.getElementById("program-filter")?.addEventListener("change",u);document.getElementById("reviewer-filter")?.addEventListener("change",u);document.getElementById("bulk-approve-btn")?.addEventListener("click",()=>{const e=prompt("Optional decision note (will be sent in email):");l(Array.from(c),"approved",e||"")});document.getElementById("bulk-reject-btn")?.addEventListener("click",()=>{const e=prompt("Optional decision note (will be sent in email):");l(Array.from(c),"rejected",e||"")});document.getElementById("bulk-waitlist-btn")?.addEventListener("click",()=>{const e=prompt("Optional decision note (will be sent in email):");l(Array.from(c),"waitlisted",e||"")});document.getElementById("bulk-assign-btn")?.addEventListener("click",()=>{const e=document.getElementById("bulk-assign-select").value;e&&L(Array.from(c),e)});document.getElementById("close-modal")?.addEventListener("click",g);document.getElementById("modal-close")?.addEventListener("click",g);document.getElementById("add-note-btn")?.addEventListener("click",()=>{const t=document.getElementById("new-note-input").value.trim();t&&r&&S(r.id,t)});document.getElementById("modal-approve")?.addEventListener("click",async()=>{if(r){const e=document.getElementById("decision-note-input").value;await l([r.id],"approved",e),g()}});document.getElementById("modal-reject")?.addEventListener("click",async()=>{if(r){const e=document.getElementById("decision-note-input").value;await l([r.id],"rejected",e),g()}});document.getElementById("modal-waitlist")?.addEventListener("click",async()=>{if(r){const e=document.getElementById("decision-note-input").value;await l([r.id],"waitlisted",e),g()}});document.getElementById("logout-btn")?.addEventListener("click",async()=>{await f.auth.signOut(),window.location.href="/login"});j();
