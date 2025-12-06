import{s}from"../assets/supabase.DdTcER9f.js";import{a as r,s as b}from"../assets/notifications.BUGlD4Nh.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let f=null,a=[],h=[],I=[],B="all",d=null,i=null;async function w(){const{data:{session:t}}=await s.auth.getSession();if(!t)return window.location.href="/login",!1;f=t.user;const{data:e}=await s.from("applications").select("role").eq("user_id",f.id).single();return!e||e.role!=="admin"?(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("access-denied")?.classList.remove("hidden"),!1):!0}async function S(){const{data:t,error:e}=await s.from("courses").select("id, name, slug").order("name",{ascending:!0});if(e){console.error("Error loading courses:",e);return}I=t||[],_()}function _(){const t=document.getElementById("cohort-course");if(!t)return;const e=I.map(n=>`<option value="${n.id}">${n.name}</option>`).join("");t.innerHTML='<option value="">Select a course</option>'+e}async function g(){const t=document.getElementById("cohorts-loading"),e=document.getElementById("cohorts-grid"),n=document.getElementById("cohorts-empty");t?.classList.remove("hidden"),e?.classList.add("hidden"),n?.classList.add("hidden");const{data:o,error:l}=await s.from("cohorts").select(`
          *,
          courses(name, slug),
          enrollments:enrollments(count)
        `).order("created_at",{ascending:!1});if(t?.classList.add("hidden"),l){console.error("Error loading cohorts:",l),r("Failed to load cohorts","error"),n?.classList.remove("hidden");return}a=o||[],C(B)}function C(t){B=t,document.querySelectorAll(".filter-btn").forEach(e=>{e.getAttribute("data-filter")===t?e.classList.add("active"):e.classList.remove("active")}),t==="all"?h=a:h=a.filter(e=>e.status===t),$(),k()}function $(){const t=document.getElementById("cohorts-grid"),e=document.getElementById("cohorts-empty");if(h.length===0){t?.classList.add("hidden"),e?.classList.remove("hidden");return}t.innerHTML=h.map(n=>{const o=n.enrollments?.[0]?.count||0;return`
          <div class="card hover:shadow-lg transition-all duration-300 border-2 hover:border-primary">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold mb-1">${n.name}</h3>
                <p class="text-sm text-text-muted flex items-center gap-1">
                  <span>📚</span>
                  ${n.courses?.name||"Unknown Course"}
                </p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full font-semibold ${H(n.status)}">${n.status.toUpperCase()}</span>
            </div>
            <div class="bg-surface-hover rounded-lg p-4 mb-4">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-lg">📅</span>
                  <div>
                    <p class="text-xs text-text-muted">Start Date</p>
                    <p class="font-medium">${x(n.start_date)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg">🏁</span>
                  <div>
                    <p class="text-xs text-text-muted">End Date</p>
                    <p class="font-medium">${n.end_date?x(n.end_date):"Ongoing"}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg">👥</span>
                  <div>
                    <p class="text-xs text-text-muted">Enrolled / Max</p>
                    <p class="font-medium">${o} / ${n.max_students}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg">⚡</span>
                  <div>
                    <p class="text-xs text-text-muted">Status</p>
                    <p class="font-medium capitalize">${n.status}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-primary flex-1 manage-students-btn" data-id="${n.id}">
                👥 Students (${o})
              </button>
              <button class="btn btn-sm btn-secondary edit-cohort-btn" data-id="${n.id}">
                ✏️ Edit
              </button>
              <button class="btn btn-sm btn-error delete-cohort-btn" data-id="${n.id}">
                🗑️ Delete
              </button>
            </div>
          </div>
        `}).join(""),t?.classList.remove("hidden"),e?.classList.add("hidden"),A()}function A(){document.querySelectorAll(".manage-students-btn").forEach(t=>{t.addEventListener("click",()=>{const e=parseInt(t.getAttribute("data-id"));T(e)})}),document.querySelectorAll(".edit-cohort-btn").forEach(t=>{t.addEventListener("click",()=>{const e=parseInt(t.getAttribute("data-id"));D(e)})}),document.querySelectorAll(".delete-cohort-btn").forEach(t=>{t.addEventListener("click",()=>{const e=parseInt(t.getAttribute("data-id"));M(e)})})}function k(){document.getElementById("stat-total-cohorts").textContent=a.length.toString();const t=a.filter(o=>o.status==="active").length;document.getElementById("stat-active-cohorts").textContent=t.toString();const e=a.filter(o=>o.status==="upcoming").length;document.getElementById("stat-upcoming-cohorts").textContent=e.toString();const n=a.reduce((o,l)=>o+(l.enrollments?.[0]?.count||0),0);document.getElementById("stat-total-students").textContent=n.toString()}function q(){d=null,document.getElementById("cohort-modal-title").textContent="Create Cohort",document.getElementById("cohort-submit-btn").textContent="Create Cohort",document.getElementById("cohort-form").reset(),document.getElementById("cohort-id").value="",document.getElementById("cohort-max-students").value="50",document.getElementById("cohort-modal")?.classList.remove("hidden")}function p(){document.getElementById("cohort-modal")?.classList.add("hidden"),d=null}function D(t){d=a.find(e=>e.id===t),d&&(document.getElementById("cohort-modal-title").textContent="Edit Cohort",document.getElementById("cohort-submit-btn").textContent="Update Cohort",document.getElementById("cohort-id").value=d.id.toString(),document.getElementById("cohort-course").value=d.course_id.toString(),document.getElementById("cohort-name").value=d.name,document.getElementById("cohort-start-date").value=d.start_date,document.getElementById("cohort-end-date").value=d.end_date||"",document.getElementById("cohort-max-students").value=d.max_students.toString(),document.getElementById("cohort-status").value=d.status,document.getElementById("cohort-modal")?.classList.remove("hidden"))}async function F(t){t.preventDefault();const e=document.getElementById("cohort-id").value,n={course_id:parseInt(document.getElementById("cohort-course").value),name:document.getElementById("cohort-name").value,start_date:document.getElementById("cohort-start-date").value,end_date:document.getElementById("cohort-end-date").value||null,max_students:parseInt(document.getElementById("cohort-max-students").value),status:document.getElementById("cohort-status").value,created_by:d?.created_by||f.id};let o;if(e?o=await s.from("cohorts").update(n).eq("id",parseInt(e)).select().single():o=await s.from("cohorts").insert([n]).select().single(),o.error){r("Error saving cohort: "+o.error.message,"error");return}r(e?"Cohort updated successfully!":"Cohort created successfully!","success"),p(),await g()}function M(t){const e=a.find(n=>n.id===t);e&&b({title:"Delete Cohort",message:`Are you sure you want to delete "${e.name}"? This action cannot be undone.`,confirmText:"Delete",confirmClass:"btn-error",onConfirm:async()=>{const{error:n}=await s.from("cohorts").delete().eq("id",t);if(n){r("Error deleting cohort: "+n.message,"error");return}r("Cohort deleted successfully!","success"),await g()}})}async function T(t){i=a.find(e=>e.id===t),i&&(document.getElementById("students-modal-title").textContent=`Students - ${i.name}`,document.getElementById("students-modal-subtitle").textContent=i.courses?.name||"Unknown Course",document.getElementById("students-modal")?.classList.remove("hidden"),await v(t))}function j(){document.getElementById("students-modal")?.classList.add("hidden"),i=null}async function v(t){const e=document.getElementById("students-loading"),n=document.getElementById("students-list"),o=document.getElementById("students-empty");e?.classList.remove("hidden"),n?.classList.add("hidden"),o?.classList.add("hidden");const{data:l,error:u}=await s.from("enrollments").select(`
          *,
          applications!inner(name, email, user_id)
        `).eq("cohort_id",t).order("enrolled_at",{ascending:!1});if(e?.classList.add("hidden"),u){console.error("Error loading students:",u),r("Failed to load students","error"),o?.classList.remove("hidden");return}const y=l||[];if(y.length===0){o?.classList.remove("hidden");return}n.innerHTML=y.map(c=>{const m=c.applications;return`
          <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span>👤</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">${m.name}</p>
                <p class="text-xs text-text-muted truncate">${m.email}</p>
              </div>
            </div>
            <button class="btn btn-sm btn-error remove-student-btn" data-enrollment-id="${c.id}" data-name="${m.name}">
              Remove
            </button>
          </div>
        `}).join(""),n?.classList.remove("hidden"),document.querySelectorAll(".remove-student-btn").forEach(c=>{c.addEventListener("click",async()=>{const m=parseInt(c.getAttribute("data-enrollment-id")),L=c.getAttribute("data-name");b({title:"Remove Student",message:`Are you sure you want to remove ${L} from this cohort?`,confirmText:"Remove",confirmClass:"btn-error",onConfirm:async()=>{const{error:E}=await s.from("enrollments").delete().eq("id",m);if(E){r("Failed to remove student: "+E.message,"error");return}r("Student removed successfully!","success"),await v(t),await g()}})})})}async function U(t){if(t.preventDefault(),!i)return;const e=document.getElementById("student-email").value.trim(),{data:n,error:o}=await s.from("applications").select("user_id, name").eq("email",e).single();if(o||!n){r("No user found with this email address","error");return}const{data:l}=await s.from("enrollments").select("id").eq("cohort_id",i.id).eq("user_id",n.user_id).single();if(l){r("This student is already enrolled in this cohort","error");return}const{error:u}=await s.from("enrollments").insert([{cohort_id:i.id,user_id:n.user_id,status:"active",enrolled_at:new Date().toISOString()}]);if(u){r("Failed to add student: "+u.message,"error");return}document.getElementById("student-email").value="",r(`${n.name} has been added to the cohort!`,"success"),await v(i.id),await g()}function x(t){return new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}function H(t){return{upcoming:"bg-blue-500/10 text-blue-500",active:"bg-green-500/10 text-green-500",completed:"bg-gray-500/10 text-gray-500",archived:"bg-orange-500/10 text-orange-500"}[t]||"bg-gray-500/10 text-gray-500"}async function O(){await w()&&(await Promise.all([S(),g()]),document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("main-content")?.classList.remove("hidden"),R())}function R(){document.querySelectorAll(".filter-btn").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-filter");C(e)})}),document.getElementById("create-cohort-btn")?.addEventListener("click",q),document.getElementById("close-cohort-modal")?.addEventListener("click",p),document.getElementById("cancel-cohort-modal")?.addEventListener("click",p),document.getElementById("cohort-form")?.addEventListener("submit",F),document.getElementById("close-students-modal")?.addEventListener("click",j),document.getElementById("add-student-form")?.addEventListener("submit",U),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await s.auth.signOut(),window.location.href="/login"})}O();
