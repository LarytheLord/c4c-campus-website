import{s as o}from"../assets/supabase.DdTcER9f.js";import{s as E,a as u}from"../assets/notifications.BUGlD4Nh.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let h=null,l=[],d=[],a=new Set,c=null;async function k(){const{data:{session:t}}=await o.auth.getSession();if(!t)return window.location.href="/login",!1;h=t.user;const{data:e}=await o.from("applications").select("role").eq("user_id",h.id).single();return!e||e.role!=="admin"?(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("access-denied")?.classList.remove("hidden"),!1):!0}async function I(){try{const{data:t,error:e}=await o.from("applications").select("user_id, name, email, role, status, created_at").order("created_at",{ascending:!1});if(e)throw e;l=t||[],d=[...l],i()}catch(t){console.error("Error loading users:",t),document.getElementById("users-table-body").innerHTML=`
          <tr>
            <td colspan="7" class="text-center py-8 text-red-500">
              Error loading users. Please try again.
            </td>
          </tr>
        `}}function f(){const t=document.getElementById("search-input").value.toLowerCase(),e=document.getElementById("role-filter").value;d=l.filter(n=>{const s=n.name.toLowerCase().includes(t)||n.email.toLowerCase().includes(t),r=!e||n.role===e;return s&&r}),i()}function i(){const t=document.getElementById("users-table-body");if(d.length===0){t.innerHTML=`
          <tr>
            <td colspan="7" class="text-center py-8 text-text-muted">
              No users found
            </td>
          </tr>
        `;return}t.innerHTML=d.map(e=>{const n=e.role==="admin"?"bg-red-500/10 text-red-500":e.role==="teacher"?"bg-blue-500/10 text-blue-500":"bg-gray-500/10 text-gray-500",s=e.status==="approved"?"text-green-500":e.status==="pending"?"text-yellow-500":"text-red-500",r=a.has(e.user_id);return`
          <tr class="border-b border-border hover:bg-surface-hover">
            <td class="p-4">
              <input type="checkbox" class="user-checkbox rounded" data-user-id="${e.user_id}" ${r?"checked":""} />
            </td>
            <td class="p-4 font-medium">${e.name}</td>
            <td class="p-4 text-text-muted">${e.email}</td>
            <td class="p-4">
              <span class="px-2 py-1 rounded text-xs font-medium ${n}">
                ${e.role}
              </span>
            </td>
            <td class="p-4">
              <span class="${s}">
                ${e.status}
              </span>
            </td>
            <td class="p-4 text-text-muted text-sm">
              ${new Date(e.created_at).toLocaleDateString()}
            </td>
            <td class="p-4">
              <select class="role-select border border-border rounded px-2 py-1 text-sm bg-background" data-user-id="${e.user_id}" data-current-role="${e.role}">
                <option value="student" ${e.role==="student"?"selected":""}>Student</option>
                <option value="teacher" ${e.role==="teacher"?"selected":""}>Teacher</option>
                <option value="admin" ${e.role==="admin"?"selected":""}>Admin</option>
              </select>
            </td>
          </tr>
        `}).join(""),x(),p()}function x(){document.querySelectorAll(".user-checkbox").forEach(t=>{t.addEventListener("change",e=>{const n=e.target.dataset.userId;e.target.checked?a.add(n):a.delete(n),p()})}),document.querySelectorAll(".role-select").forEach(t=>{t.addEventListener("change",async e=>{const n=e.target.dataset.userId,s=e.target.dataset.currentRole,r=e.target.value;r!==s&&(c={userId:n,newRole:r},v(`Change user role from ${s} to ${r}?`),e.target.value=s)})})}function p(){const t=a.size;document.getElementById("selection-count").textContent=`${t} user${t!==1?"s":""} selected`,["bulk-student-btn","bulk-teacher-btn","bulk-admin-btn"].forEach(s=>{const r=document.getElementById(s);r.disabled=t===0});const n=document.getElementById("select-all");t===0?(n.checked=!1,n.indeterminate=!1):t===d.length?(n.checked=!0,n.indeterminate=!1):(n.checked=!1,n.indeterminate=!0)}async function w(t,e){try{const{error:n}=await o.from("applications").update({role:e}).eq("user_id",t);if(n)throw n;const s=l.find(r=>r.user_id===t);return s&&(s.role=e),i(),!0}catch(n){return console.error("Error updating role:",n),u("Failed to update user role. Please try again.","error"),!1}}async function m(t){a.size!==0&&E(`Change role to ${t} for ${a.size} user(s)?`,async()=>{const e=u("Updating user roles...","info",0);try{const n=Array.from(a),{error:s}=await o.from("applications").update({role:t}).in("user_id",n);if(s)throw s;n.forEach(r=>{const g=l.find(b=>b.user_id===r);g&&(g.role=t)}),a.clear(),i(),dismissToast(e),u(`Successfully updated ${n.length} user(s)`,"success")}catch(n){console.error("Error in bulk update:",n),dismissToast(e),u("Failed to update roles. Please try again.","error")}})}function v(t){document.getElementById("role-modal-message").textContent=t,document.getElementById("role-modal")?.classList.remove("hidden")}function y(){document.getElementById("role-modal")?.classList.add("hidden"),c=null}async function B(){await k()&&(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("users-content")?.classList.remove("hidden"),await I())}document.getElementById("search-input")?.addEventListener("input",f);document.getElementById("role-filter")?.addEventListener("change",f);document.getElementById("select-all")?.addEventListener("change",t=>{t.target.checked?d.forEach(n=>a.add(n.user_id)):a.clear(),i()});document.getElementById("bulk-student-btn")?.addEventListener("click",()=>m("student"));document.getElementById("bulk-teacher-btn")?.addEventListener("click",()=>m("teacher"));document.getElementById("bulk-admin-btn")?.addEventListener("click",()=>m("admin"));document.getElementById("role-modal-cancel")?.addEventListener("click",y);document.getElementById("role-modal-confirm")?.addEventListener("click",async()=>{c&&await w(c.userId,c.newRole)&&y()});document.getElementById("logout-btn")?.addEventListener("click",async()=>{await o.auth.signOut(),window.location.href="/login"});B();
