import{c as $}from"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";const _="https://auyysgeurtnpidppebqj.supabase.co",M="***REMOVED***",i=$(_,M);let y=null,m=[],E=[],a=null;function c(e,t,n="info",s){const d=document.getElementById("notification-modal"),r=document.getElementById("notification-icon"),o=document.getElementById("notification-title"),l=document.getElementById("notification-message"),u=document.getElementById("notification-actions"),g={success:"✅",error:"❌",info:"ℹ️",warning:"⚠️"};r&&(r.textContent=g[n]),o&&(o.textContent=e),l&&(l.textContent=t),u&&(s&&s.length>0?(u.innerHTML=s.map(p=>`<button class="${p.primary?"btn btn-primary":"btn btn-ghost"} flex-1 modal-action-btn">${p.label}</button>`).join(""),u.querySelectorAll(".modal-action-btn").forEach((p,S)=>{p.addEventListener("click",()=>{d?.classList.add("hidden"),s[S].onClick()})})):(u.innerHTML='<button class="btn btn-primary flex-1 modal-close-btn">OK</button>',u.querySelector(".modal-close-btn")?.addEventListener("click",()=>{d?.classList.add("hidden")}))),d?.classList.remove("hidden")}function x(e,t,n,s){c(e,t,"warning",[{label:"Cancel",onClick:(()=>{}),primary:!1},{label:"Confirm",onClick:n,primary:!0}])}function A(e,t){const n=document.getElementById("input-modal"),s=document.getElementById("input-title"),d=document.getElementById("input-field"),r=document.getElementById("input-submit"),o=document.getElementById("input-cancel");s&&(s.textContent=e),d&&(d.value="");const l=()=>{const g=d?.value.trim();g&&(n?.classList.add("hidden"),t(g))},u=()=>{n?.classList.add("hidden")};r?.replaceWith(r.cloneNode(!0)),o?.replaceWith(o.cloneNode(!0)),document.getElementById("input-submit")?.addEventListener("click",l),document.getElementById("input-cancel")?.addEventListener("click",u),d?.addEventListener("keypress",g=>{g.key==="Enter"&&l()}),n?.classList.remove("hidden"),d?.focus()}async function D(){const{data:{user:e}}=await i.auth.getUser();if(!e){window.location.href="/login";return}y=e;const{data:t}=await i.from("applications").select("name, role").eq("user_id",e.id).single();if(!t?.role||t.role!=="teacher"&&t.role!=="admin"){document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("access-denied")?.classList.remove("hidden");return}if(t?.name){const n=t.name.split(" ")[0],s=document.getElementById("welcome-text");s&&(s.textContent=`Welcome back, ${n}!`)}await h(),await I(),document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("teacher-content")?.classList.remove("hidden"),q()}async function h(){const e=document.getElementById("courses-loading"),t=document.getElementById("courses-grid"),n=document.getElementById("courses-empty");e?.classList.remove("hidden"),t?.classList.add("hidden"),n?.classList.add("hidden");const{data:s,error:d}=await i.from("courses").select("*").eq("created_by",y.id).order("created_at",{ascending:!1});if(e?.classList.add("hidden"),d){console.error("Error loading courses:",d),n?.classList.remove("hidden");return}if(m=s||[],m.length===0){n?.classList.remove("hidden"),L(m);return}t.innerHTML=m.map(r=>`
        <div class="card hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold">${r.title}</h3>
            ${r.is_published?'<span class="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">Published</span>':'<span class="text-xs px-2 py-1 bg-orange-500/10 text-orange-500 rounded">Draft</span>'}
          </div>
          <p class="text-sm text-text-muted mb-3 line-clamp-2">${r.description||"No description"}</p>
          <div class="flex items-center gap-2 text-xs text-text-muted mb-4">
            <span class="px-2 py-1 bg-primary/10 rounded">${J(r.track)}</span>
            <span class="px-2 py-1 bg-primary/10 rounded">${V(r.difficulty)}</span>
            ${r.default_duration_weeks?`<span>${r.default_duration_weeks} weeks</span>`:""}
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-primary flex-1 edit-course-tab" data-id="${r.id}">Edit</button>
            <a href="/courses/${r.slug}" class="btn btn-sm btn-secondary">View</a>
          </div>
        </div>
      `).join(""),t?.classList.remove("hidden"),L(m),z(),t?.querySelectorAll(".edit-course-tab").forEach(r=>{r.addEventListener("click",o=>{const l=r.getAttribute("data-id");w(parseInt(l))})})}async function I(){const e=document.getElementById("cohorts-loading"),t=document.getElementById("cohorts-grid"),n=document.getElementById("cohorts-empty");e?.classList.remove("hidden"),t?.classList.add("hidden"),n?.classList.add("hidden");const s=m.map(o=>o.id);if(s.length===0){e?.classList.add("hidden"),n?.classList.remove("hidden");return}const{data:d,error:r}=await i.from("cohorts").select("*, courses(name, slug)").in("course_id",s).order("created_at",{ascending:!1});if(e?.classList.add("hidden"),r){console.error("Error loading cohorts:",r),n?.classList.remove("hidden");return}if(E=d||[],E.length===0){n?.classList.remove("hidden");return}t.innerHTML=E.map(o=>`
        <div class="card hover:shadow-lg transition-all duration-300 border-2 hover:border-primary">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-1">${o.name}</h3>
              <p class="text-sm text-text-muted flex items-center gap-1">
                <span>📚</span>
                ${o.courses?.name||"Unknown Course"}
              </p>
            </div>
            <span class="text-xs px-3 py-1 rounded-full font-semibold ${F(o.status)}">${o.status.toUpperCase()}</span>
          </div>
          <div class="bg-surface-hover rounded-lg p-4 mb-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-lg">📅</span>
                <div>
                  <p class="text-xs text-text-muted">Start Date</p>
                  <p class="font-medium">${C(o.start_date)}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg">🏁</span>
                <div>
                  <p class="text-xs text-text-muted">End Date</p>
                  <p class="font-medium">${o.end_date?C(o.end_date):"Ongoing"}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg">👥</span>
                <div>
                  <p class="text-xs text-text-muted">Max Students</p>
                  <p class="font-medium">${o.max_students}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg">⚡</span>
                <div>
                  <p class="text-xs text-text-muted">Status</p>
                  <p class="font-medium capitalize">${o.status}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <a href="/teacher/cohorts/${o.id}" class="btn btn-sm btn-primary flex-1 font-semibold">
              Manage Cohort →
            </a>
            <button class="btn btn-sm btn-ghost delete-cohort hover:bg-red-50 hover:text-red-600" data-id="${o.id}">
              🗑️ Delete
            </button>
          </div>
        </div>
      `).join(""),t?.classList.remove("hidden"),t?.querySelectorAll(".delete-cohort").forEach(o=>{o.addEventListener("click",async l=>{const u=o.getAttribute("data-id");x("Delete Cohort","Are you sure you want to delete this cohort?",async()=>{await O(parseInt(u))})})})}function L(e){const t=e.filter(s=>s.published).length,n=e.filter(s=>!s.published).length;document.getElementById("stat-courses").textContent=e.length.toString(),document.getElementById("stat-published").textContent=t.toString(),document.getElementById("stat-drafts").textContent=n.toString(),document.getElementById("stat-students").textContent="0"}function q(){document.querySelectorAll(".tab-button").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-tab");t&&f(t)})}),document.getElementById("create-course-btn")?.addEventListener("click",T),document.getElementById("close-modal")?.addEventListener("click",v),document.getElementById("cancel-modal")?.addEventListener("click",v),document.getElementById("quick-course-form")?.addEventListener("submit",H),document.getElementById("course-form")?.addEventListener("submit",j),document.getElementById("back-to-courses-btn")?.addEventListener("click",()=>f("courses")),document.getElementById("create-cohort-btn")?.addEventListener("click",N),document.getElementById("close-cohort-modal")?.addEventListener("click",b),document.getElementById("cancel-cohort-modal")?.addEventListener("click",b),document.getElementById("cohort-form")?.addEventListener("submit",U),document.getElementById("course-name")?.addEventListener("input",e=>{const t=e.target.value,n=document.getElementById("course-slug");!a&&n&&(n.value=k(t))}),document.getElementById("add-module-btn")?.addEventListener("click",async()=>{a&&A("Enter module name:",async e=>{const t=document.querySelectorAll("#modules-list .module-item").length+1,{data:n,error:s}=await i.from("modules").insert([{course_id:a.id,name:e,order_index:t}]).select().single();if(s){c("Error","Error creating module: "+s.message,"error");return}c("Success","Module added successfully!","success"),B(a.id)})}),document.getElementById("delete-course-btn")?.addEventListener("click",async()=>{a&&x("Delete Course",`Are you sure you want to delete "${a.name}"? This action cannot be undone.`,async()=>{const{error:e}=await i.from("courses").delete().eq("id",a.id);if(e){c("Error","Error deleting course: "+e.message,"error");return}c("Success","Course deleted successfully!","success"),a=null,document.getElementById("tab-edit")?.classList.add("hidden"),await h(),f("courses")})}),document.getElementById("quick-cohorts-btn")?.addEventListener("click",()=>{f("cohorts")}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await i.auth.signOut(),window.location.href="/login"})}function f(e){const t=document.getElementById("breadcrumb-current");t&&(e==="courses"?t.textContent="My Courses":e==="edit"?t.textContent="Edit Course":e==="cohorts"&&(t.textContent="Cohort Management")),document.querySelectorAll(".tab-button").forEach(n=>{n.getAttribute("data-tab")===e?(n.classList.add("active","border-primary","text-primary"),n.classList.remove("border-transparent","text-text-muted")):(n.classList.remove("active","border-primary","text-primary"),n.classList.add("border-transparent","text-text-muted"))}),document.querySelectorAll(".tab-content").forEach(n=>{n.classList.add("hidden")}),document.getElementById(`content-${e}`)?.classList.remove("hidden")}function w(e){a=m.find(t=>t.id===e),a&&(document.getElementById("tab-edit")?.classList.remove("hidden"),document.getElementById("course-name").value=a.name,document.getElementById("course-description").value=a.description||"",document.getElementById("course-track").value=a.track,document.getElementById("course-difficulty").value=a.difficulty,document.getElementById("course-hours").value=a.estimated_hours||"",document.getElementById("course-slug").value=a.slug,document.getElementById("course-published").checked=a.published,document.getElementById("edit-course-title").textContent=`Edit: ${a.name}`,document.getElementById("delete-course-btn")?.classList.remove("hidden"),B(e),f("edit"))}async function B(e){const t=document.getElementById("modules-list");if(!t)return;const{data:n,error:s}=await i.from("modules").select("*").eq("course_id",e).order("order_index",{ascending:!0});if(s){console.error("Error loading modules:",s),t.innerHTML='<p class="text-text-muted text-center py-8">Error loading modules</p>';return}if(!n||n.length===0){t.innerHTML='<p class="text-text-muted text-center py-8">No modules yet. Add your first module to start building content.</p>';return}t.innerHTML=n.map(d=>`
        <div class="module-item border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <span class="text-2xl">📚</span>
              <div>
                <h4 class="font-semibold">${d.title}</h4>
                <p class="text-sm text-text-muted">Order: ${d.order_index}</p>
              </div>
            </div>
            <button class="btn btn-sm btn-error delete-module" data-id="${d.id}">Delete</button>
          </div>
        </div>
      `).join(""),t.querySelectorAll(".delete-module").forEach(d=>{d.addEventListener("click",async r=>{const o=d.getAttribute("data-id");o&&x("Delete Module","Are you sure you want to delete this module?",async()=>{const{error:l}=await i.from("modules").delete().eq("id",parseInt(o));if(l){c("Error","Error deleting module: "+l.message,"error");return}B(e)})})})}function T(){const e=document.getElementById("course-modal");document.getElementById("quick-course-form").reset(),e?.classList.remove("hidden")}function v(){document.getElementById("course-modal")?.classList.add("hidden")}async function H(e){e.preventDefault();const t={name:document.getElementById("modal-course-name").value,description:document.getElementById("modal-course-description").value,track:document.getElementById("modal-course-track").value,difficulty:document.getElementById("modal-course-difficulty").value,slug:k(document.getElementById("modal-course-name").value),published:!1,created_by:y.id},{data:n,error:s}=await i.from("courses").insert([t]).select().single();if(s){c("Error","Error creating course: "+s.message,"error");return}v(),c("Success","Course created successfully!","success"),await h(),n&&w(n.id)}async function j(e){e.preventDefault();const t={name:document.getElementById("course-name").value,description:document.getElementById("course-description").value,track:document.getElementById("course-track").value,difficulty:document.getElementById("course-difficulty").value,estimated_hours:parseInt(document.getElementById("course-hours").value)||null,slug:document.getElementById("course-slug").value,published:document.getElementById("course-published").checked};if(a){const{error:n}=await i.from("courses").update(t).eq("id",a.id);if(n){c("Error","Error updating course: "+n.message,"error");return}c("Success","Course updated successfully!","success")}await h()}function N(){const e=document.getElementById("cohort-modal");document.getElementById("cohort-form").reset(),e?.classList.remove("hidden")}function b(){document.getElementById("cohort-modal")?.classList.add("hidden")}async function U(e){e.preventDefault();const t={course_id:parseInt(document.getElementById("cohort-course").value),name:document.getElementById("cohort-name").value,start_date:document.getElementById("cohort-start-date").value,end_date:document.getElementById("cohort-end-date").value||null,max_students:parseInt(document.getElementById("cohort-max-students").value),created_by:y.id},{error:n}=await i.from("cohorts").insert([t]);if(n){c("Error","Error creating cohort: "+n.message,"error");return}b(),await I(),c("Success","Cohort created successfully!","success")}async function O(e){const{error:t}=await i.from("cohorts").delete().eq("id",e);if(t){c("Error","Error deleting cohort: "+t.message,"error");return}c("Success","Cohort deleted successfully!","success"),await I()}function z(){[document.getElementById("cohort-course"),document.getElementById("cohort-course-filter")].forEach(t=>{if(!t)return;const n=t.value,s=m.map(d=>`<option value="${d.id}">${d.name}</option>`).join("");t.id==="cohort-course"?t.innerHTML='<option value="">Select a course</option>'+s:t.innerHTML='<option value="">All Courses</option>'+s,n&&(t.value=n)})}function k(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function J(e){return{"animal-advocacy":"Animal Advocacy",climate:"Climate","ai-safety":"AI Safety",general:"General"}[e]||e}function V(e){return e.charAt(0).toUpperCase()+e.slice(1)}function C(e){return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}function F(e){return{upcoming:"bg-blue-500/10 text-blue-500",active:"bg-green-500/10 text-green-500",completed:"bg-gray-500/10 text-gray-500",archived:"bg-orange-500/10 text-orange-500"}[e]||"bg-gray-500/10 text-gray-500"}D();
