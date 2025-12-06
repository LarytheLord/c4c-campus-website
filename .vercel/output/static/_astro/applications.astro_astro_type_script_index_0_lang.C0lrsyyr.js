import{s as r}from"../assets/supabase.DdTcER9f.js";import{s as w,a as g}from"../assets/notifications.BUGlD4Nh.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let l=null,i=[],v=[],o=new Set,c=null;async function E(){const{data:{session:n}}=await r.auth.getSession();if(!n)return window.location.href="/login",!1;l=n.user;const{data:e}=await r.from("applications").select("role").eq("user_id",l.id).single();return!e||e.role!=="admin"?(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("access-denied")?.classList.remove("hidden"),!1):!0}async function I(){try{const{data:n,error:e}=await r.from("applications").select("*").order("created_at",{ascending:!1});if(e)throw e;i=n||[],v=[...i],b(),y()}catch(n){console.error("Error loading applications:",n),document.getElementById("empty-state")?.classList.remove("hidden")}}function b(){const n=i.length,e=i.filter(s=>s.status==="pending").length,t=i.filter(s=>s.status==="approved").length,a=i.filter(s=>s.status==="rejected").length;document.getElementById("stat-total").textContent=n.toString(),document.getElementById("stat-pending").textContent=e.toString(),document.getElementById("stat-approved").textContent=t.toString(),document.getElementById("stat-rejected").textContent=a.toString()}function p(){const n=document.getElementById("search-input").value.toLowerCase(),e=document.getElementById("status-filter").value,t=document.getElementById("program-filter").value;v=i.filter(a=>{const s=a.name.toLowerCase().includes(n)||a.email.toLowerCase().includes(n),d=!e||a.status===e,h=!t||a.program===t;return s&&d&&h}),y()}function y(){const n=document.getElementById("applications-list"),e=document.getElementById("empty-state");if(v.length===0){n.innerHTML="",e.classList.remove("hidden");return}e.classList.add("hidden"),n.innerHTML=v.map(t=>{const a=t.status==="pending"?"bg-yellow-500/10 text-yellow-500 border-yellow-500/20":t.status==="approved"?"bg-green-500/10 text-green-500 border-green-500/20":t.status==="rejected"?"bg-red-500/10 text-red-500 border-red-500/20":"bg-blue-500/10 text-blue-500 border-blue-500/20",s=t.program==="bootcamp"?"Bootcamp":t.program==="accelerator"?"Accelerator":"Hackathon",d=o.has(t.id);return`
          <div class="card">
            <div class="flex items-start gap-4">
              <input type="checkbox" class="app-checkbox mt-1 rounded" data-app-id="${t.id}" ${d?"checked":""} />

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 class="font-semibold text-lg">${t.name}</h4>
                    <p class="text-sm text-text-muted">${t.email}</p>
                    ${t.whatsapp?`<p class="text-sm text-text-muted">WhatsApp: ${t.whatsapp}</p>`:""}
                  </div>
                  <div class="flex gap-2 items-start flex-shrink-0">
                    <span class="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      ${s}
                    </span>
                    <span class="px-2 py-1 rounded text-xs font-medium border ${a}">
                      ${t.status}
                    </span>
                  </div>
                </div>

                ${t.motivation?`
                  <div class="mb-3">
                    <p class="text-sm text-text-muted line-clamp-2">${t.motivation}</p>
                  </div>
                `:""}

                <div class="flex items-center gap-4 text-xs text-text-muted">
                  <span>Applied: ${new Date(t.created_at).toLocaleDateString()}</span>
                  ${t.reviewed_at?`<span>Reviewed: ${new Date(t.reviewed_at).toLocaleDateString()}</span>`:""}
                </div>

                <div class="flex gap-2 mt-4">
                  <button class="view-btn btn btn-ghost btn-sm" data-app-id="${t.id}">
                    View Details
                  </button>
                  ${t.status==="pending"?`
                    <button class="approve-btn btn btn-success btn-sm" data-app-id="${t.id}">
                      Approve
                    </button>
                    <button class="reject-btn btn btn-error btn-sm" data-app-id="${t.id}">
                      Reject
                    </button>
                  `:""}
                </div>
              </div>
            </div>
          </div>
        `}).join(""),$(),x()}function $(){document.querySelectorAll(".app-checkbox").forEach(n=>{n.addEventListener("change",e=>{const t=e.target.dataset.appId;e.target.checked?o.add(t):o.delete(t),x()})}),document.querySelectorAll(".view-btn").forEach(n=>{n.addEventListener("click",e=>{const t=e.target.dataset.appId;B(t)})}),document.querySelectorAll(".approve-btn").forEach(n=>{n.addEventListener("click",async e=>{const t=e.target.dataset.appId;await m(t,"approved")})}),document.querySelectorAll(".reject-btn").forEach(n=>{n.addEventListener("click",async e=>{const t=e.target.dataset.appId;await m(t,"rejected")})})}function x(){const n=o.size;document.getElementById("selection-count").textContent=`${n} application${n!==1?"s":""} selected`,["bulk-approve-btn","bulk-reject-btn","bulk-waitlist-btn"].forEach(t=>{document.getElementById(t).disabled=n===0})}async function m(n,e){try{const{error:t}=await r.from("applications").update({status:e,reviewed_at:new Date().toISOString(),reviewed_by:l.id}).eq("id",n);if(t)throw t;const a=i.find(s=>s.id===n);a&&(a.status=e,a.reviewed_at=new Date().toISOString(),a.reviewed_by=l.id),b(),p()}catch(t){console.error("Error updating status:",t),g("Failed to update application status. Please try again.","error")}}async function f(n){o.size!==0&&w(`Update ${o.size} application(s) to ${n}?`,async()=>{const e=g("Updating applications...","info",0);try{const t=Array.from(o),{error:a}=await r.from("applications").update({status:n,reviewed_at:new Date().toISOString(),reviewed_by:l.id}).in("id",t);if(a)throw a;t.forEach(s=>{const d=i.find(h=>h.id===s);d&&(d.status=n,d.reviewed_at=new Date().toISOString(),d.reviewed_by=l.id)}),o.clear(),b(),p(),dismissToast(e),g(`Successfully updated ${t.length} application(s)`,"success")}catch(t){console.error("Error in bulk update:",t),dismissToast(e),g("Failed to update applications. Please try again.","error")}})}function B(n){const e=i.find(a=>a.id===n);if(!e)return;c=e;const t=document.getElementById("modal-content");t.innerHTML=`
        <div class="space-y-4">
          <div>
            <h4 class="font-semibold mb-1">Name</h4>
            <p class="text-text-muted">${e.name}</p>
          </div>
          <div>
            <h4 class="font-semibold mb-1">Email</h4>
            <p class="text-text-muted">${e.email}</p>
          </div>
          ${e.whatsapp?`
            <div>
              <h4 class="font-semibold mb-1">WhatsApp</h4>
              <p class="text-text-muted">${e.whatsapp}</p>
            </div>
          `:""}
          ${e.location?`
            <div>
              <h4 class="font-semibold mb-1">Location</h4>
              <p class="text-text-muted">${e.location}</p>
            </div>
          `:""}
          ${e.discord?`
            <div>
              <h4 class="font-semibold mb-1">Discord</h4>
              <p class="text-text-muted">${e.discord}</p>
            </div>
          `:""}
          <div>
            <h4 class="font-semibold mb-1">Program</h4>
            <p class="text-text-muted">${e.program}</p>
          </div>
          ${e.motivation?`
            <div>
              <h4 class="font-semibold mb-1">Motivation</h4>
              <p class="text-text-muted">${e.motivation}</p>
            </div>
          `:""}
          ${e.technical_experience?`
            <div>
              <h4 class="font-semibold mb-1">Technical Experience</h4>
              <p class="text-text-muted">${e.technical_experience}</p>
            </div>
          `:""}
          ${e.commitment?`
            <div>
              <h4 class="font-semibold mb-1">Commitment</h4>
              <p class="text-text-muted">${e.commitment}</p>
            </div>
          `:""}
          ${e.interests?`
            <div>
              <h4 class="font-semibold mb-1">Interests</h4>
              <p class="text-text-muted">${e.interests.join(", ")}</p>
            </div>
          `:""}
        </div>
      `,document.getElementById("detail-modal")?.classList.remove("hidden")}function u(){document.getElementById("detail-modal")?.classList.add("hidden"),c=null}async function L(){await E()&&(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("applications-content")?.classList.remove("hidden"),await I())}document.getElementById("search-input")?.addEventListener("input",p);document.getElementById("status-filter")?.addEventListener("change",p);document.getElementById("program-filter")?.addEventListener("change",p);document.getElementById("bulk-approve-btn")?.addEventListener("click",()=>f("approved"));document.getElementById("bulk-reject-btn")?.addEventListener("click",()=>f("rejected"));document.getElementById("bulk-waitlist-btn")?.addEventListener("click",()=>f("waitlisted"));document.getElementById("close-modal")?.addEventListener("click",u);document.getElementById("modal-close")?.addEventListener("click",u);document.getElementById("modal-approve")?.addEventListener("click",async()=>{c&&(await m(c.id,"approved"),u())});document.getElementById("modal-reject")?.addEventListener("click",async()=>{c&&(await m(c.id,"rejected"),u())});document.getElementById("modal-waitlist")?.addEventListener("click",async()=>{c&&(await m(c.id,"waitlisted"),u())});document.getElementById("logout-btn")?.addEventListener("click",async()=>{await r.auth.signOut(),window.location.href="/login"});L();
