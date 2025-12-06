import{c as U}from"../assets/index.CS-uK3Uq.js";import{a as r,s as B,b as $}from"../assets/notifications.BUGlD4Nh.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";async function j(t,e,o=!1){if(!t)throw new Error("cohortId is required");if(!e)throw new Error("Supabase client is required");const d=new Map;if(o)return d;const{data:l,error:n}=await e.from("cohort_schedules").select("module_id, unlock_date, lock_date").eq("cohort_id",t);if(n||!l)return d;const s=new Date().toISOString().split("T")[0],y=new Date(s);return l.forEach(u=>{const m=new Date(u.unlock_date),p=u.lock_date?new Date(u.lock_date):null;let g=!0,b="unlocked";(y<m||p&&y>=p)&&(g=!1,b="locked"),d.set(u.module_id,{isUnlocked:g,unlockDate:m,lockDate:p,reason:b})}),d}function z(t){return t?t.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"Not scheduled"}function H(t){if(!t)return 0;const e=new Date,o=new Date(e.getFullYear(),e.getMonth(),e.getDate()),l=new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime()-o.getTime();return Math.ceil(l/(1e3*60*60*24))}const O="https://auyysgeurtnpidppebqj.supabase.co",N="***REMOVED***",c=U(O,N);let E=null,h=null,v=[],x=[],D=new Set,C=null,S=new Map,f=null,a=null,w=null,L=!1;async function P(){const t=window.location.pathname.split("/"),e=t[t.length-1],{data:{user:o}}=await c.auth.getUser();if(!o){window.location.href="/login?redirect="+encodeURIComponent(window.location.pathname);return}E=o;const{data:d}=await c.from("applications").select("email").eq("user_id",o.id).single();L=d?.email?.startsWith("teacher@")||!1,await F(e),!L&&h&&(await A(),await M()),document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("course-content")?.classList.remove("hidden"),V()}async function M(){const{data:t}=await c.from("cohort_enrollments").select(`
        cohort_id,
        cohorts!inner (
          course_id
        )
      `).eq("user_id",E.id).eq("status","active").eq("cohorts.course_id",h.id).order("enrolled_at",{ascending:!1}).limit(1);t&&t.length>0&&(C=t[0].cohort_id,S=await j(C,c,L))}async function F(t){const{data:e,error:o}=await c.from("courses").select("*").eq("slug",t).single();if(o||!e){r("Course not found","error"),setTimeout(()=>{window.location.href="/courses"},1500);return}h=e,document.getElementById("course-title").textContent=e.title,document.getElementById("course-name").textContent=e.title,document.getElementById("course-description").textContent=e.description||"No description",document.getElementById("breadcrumb").textContent=`Course / ${e.title}`,document.getElementById("breadcrumb-course-name").textContent=e.title;const d=`
      <span class="px-2 py-1 bg-primary/10 rounded">${W(e.track)}</span>
      <span class="px-2 py-1 bg-primary/10 rounded">${ee(e.difficulty)}</span>
      ${e.default_duration_weeks?`<span class="px-2 py-1 bg-primary/10 rounded">${e.default_duration_weeks} weeks</span>`:""}
      ${e.is_published?'<span class="px-2 py-1 bg-green-500/10 text-green-500 rounded">Published</span>':'<span class="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">Draft</span>'}
    `;document.getElementById("course-meta").innerHTML=d,e.created_by===E.id&&(document.getElementById("teacher-actions").style.display="flex"),await I()}async function I(){const t=document.getElementById("modules-loading"),e=document.getElementById("modules-list"),o=document.getElementById("modules-empty");t?.classList.remove("hidden"),e?.classList.add("hidden"),o?.classList.add("hidden");const{data:d,error:l}=await c.from("modules").select(`
        *,
        lessons(*)
      `).eq("course_id",h.id).order("order_index",{ascending:!0});if(t?.classList.add("hidden"),l){console.error("Error loading modules:",l),o?.classList.remove("hidden");return}if(v=d||[],v.length===0){o?.classList.remove("hidden");return}e.innerHTML=v.map(n=>{const i=(n.lessons||[]).sort((g,b)=>g.order_index-b.order_index),s=h.created_by===E.id,y=S.get(n.id),u=y&&!y.isUnlocked,m=y?.unlockDate,p=m?H(m):null;return`
        <div class="card ${u?"opacity-75 bg-gray-50":""}">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold">${n.order_index}. ${n.title}</h3>
                ${u?`
                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-600 text-xs rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Locked
                  </span>
                `:""}
              </div>
              ${n.description?`<p class="text-sm text-text-muted mt-1">${n.description}</p>`:""}
              ${u&&m?`
                <div class="mt-2 text-sm text-orange-600">
                  <span class="font-medium">Unlocks ${z(m)}</span>
                  ${p!==null&&p>0?` (in ${p} day${p===1?"":"s"})`:""}
                </div>
              `:""}
            </div>
            ${s?`
              <div class="flex gap-2">
                <button class="btn btn-sm btn-ghost add-lesson" data-module-id="${n.id}">+ Lesson</button>
                <button class="btn btn-sm btn-ghost edit-module" data-id="${n.id}">Edit</button>
                <button class="btn btn-sm btn-ghost delete-module" data-id="${n.id}">Delete</button>
              </div>
            `:""}
          </div>

          ${i.length>0?`
            <div class="space-y-2">
              ${i.map(g=>`
                <div class="p-3 border border-border rounded-lg ${u?"opacity-50 cursor-not-allowed":"hover:bg-surface-hover cursor-pointer"} flex justify-between items-center">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">${g.order_index}. ${g.title}</span>
                      ${u?`
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      `:""}
                    </div>
                    ${g.duration_minutes?`<div class="text-xs text-text-muted">${g.duration_minutes} min</div>`:""}
                  </div>
                  ${s?`
                    <div class="flex gap-2">
                      <button class="btn btn-sm btn-ghost edit-lesson" data-id="${g.id}" data-module-id="${n.id}">Edit</button>
                      <button class="btn btn-sm btn-ghost delete-lesson" data-id="${g.id}">Delete</button>
                    </div>
                  `:""}
                </div>
              `).join("")}
            </div>
          `:`
            <p class="text-sm text-text-muted">No lessons yet${s?'. Click "+ Lesson" to add one.':"."}</p>
          `}
        </div>
      `}).join(""),e?.classList.remove("hidden"),h.created_by===E.id&&(e?.querySelectorAll(".add-lesson").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.getAttribute("data-module-id"));Z(i)})}),e?.querySelectorAll(".edit-module").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.getAttribute("data-id"));X(i)})}),e?.querySelectorAll(".delete-module").forEach(n=>{n.addEventListener("click",async()=>{const i=parseInt(n.getAttribute("data-id"));B("Delete this module and all its lessons?",async()=>{await G(i)})})}),e?.querySelectorAll(".edit-lesson").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.getAttribute("data-id")),s=parseInt(n.getAttribute("data-module-id"));K(i,s)})}),e?.querySelectorAll(".delete-lesson").forEach(n=>{n.addEventListener("click",async()=>{const i=parseInt(n.getAttribute("data-id"));B("Delete this lesson?",async()=>{await Q(i)})})}))}async function A(){const t=document.getElementById("cohorts-loading"),e=document.getElementById("cohorts-grid"),o=document.getElementById("cohorts-empty");document.getElementById("cohorts-section")?.classList.remove("hidden"),t?.classList.remove("hidden"),e?.classList.add("hidden"),o?.classList.add("hidden");const{data:l,error:n}=await c.from("cohorts").select("*").eq("course_id",h.id).in("status",["upcoming","active"]).order("start_date",{ascending:!0});if(t?.classList.add("hidden"),n){console.error("Error loading cohorts:",n),o?.classList.remove("hidden");return}x=l||[];const{data:i}=await c.from("cohort_enrollments").select("cohort_id").eq("user_id",E.id);if(D=new Set(i?.map(s=>s.cohort_id)||[]),x.length===0){o?.classList.remove("hidden");return}e.innerHTML=x.map(s=>{const y=D.has(s.id),u=new Date(s.start_date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),m=s.end_date?new Date(s.end_date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):"Ongoing";return`
        <div class="card">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold">${s.name}</h3>
            <span class="text-xs px-2 py-1 ${s.status==="active"?"bg-green-500/10 text-green-500":"bg-blue-500/10 text-blue-500"} rounded">${s.status==="active"?"Active":"Upcoming"}</span>
          </div>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center gap-2 text-text-muted">
              <span>📅</span>
              <span>${u} - ${m}</span>
            </div>
            ${s.max_students?`
              <div class="flex items-center gap-2 text-text-muted">
                <span>👥</span>
                <span>Max ${s.max_students} students</span>
              </div>
            `:""}
          </div>
          ${y?'<div class="badge bg-green-500/10 text-green-500 w-full text-center py-2">✓ Enrolled</div>':'<button class="btn btn-primary w-full enroll-cohort-btn" data-cohort-id="'+s.id+'" data-cohort-name="'+s.name+'">Enroll in Cohort</button>'}
        </div>
      `}).join(""),e?.classList.remove("hidden"),e?.querySelectorAll(".enroll-cohort-btn").forEach(s=>{s.addEventListener("click",async()=>{const y=s.getAttribute("data-cohort-id"),u=s.getAttribute("data-cohort-name"),m=s;$(m,!0,"Enrolling..."),await J(y,u),$(m,!1,"Enroll in Cohort")})})}async function J(t,e){if(!E){r("Please login to enroll in cohorts","error"),setTimeout(()=>{window.location.href="/login"},1500);return}B(`Enroll in ${e}?`,async()=>{const o=r("Enrolling...","info",0);try{const{data:{session:d}}=await c.auth.getSession();if(!d){dismissToast(o),r("Session expired. Please login again.","error"),setTimeout(()=>{window.location.href="/login"},1500);return}const l=await fetch("/api/enroll-cohort",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d.access_token}`},body:JSON.stringify({cohortId:t})}),n=await l.json();if(dismissToast(o),!l.ok){l.status===409?n.error.includes("full")?r("This cohort is full. Please try another cohort.","error"):r("You are already enrolled in this cohort!","warning"):r("Error enrolling: "+(n.error||"Unknown error"),"error");return}r("Successfully enrolled in "+e+"!","success"),await A(),await M(),await I()}catch(d){console.error("Enrollment error:",d),dismissToast(o),r("Error enrolling in cohort. Please try again.","error")}})}function V(){document.getElementById("edit-course-btn")?.addEventListener("click",()=>{window.location.href="/teacher/courses"}),document.getElementById("add-module-btn")?.addEventListener("click",()=>{f=null,q()}),document.getElementById("close-module-modal")?.addEventListener("click",_),document.getElementById("cancel-module-modal")?.addEventListener("click",_),document.getElementById("module-form")?.addEventListener("submit",Y),document.getElementById("close-lesson-modal")?.addEventListener("click",k),document.getElementById("cancel-lesson-modal")?.addEventListener("click",k),document.getElementById("lesson-form")?.addEventListener("submit",R),document.getElementById("lesson-name")?.addEventListener("input",t=>{const e=t.target.value,o=document.getElementById("lesson-slug");!a&&o&&(o.value=e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))}),document.getElementById("lesson-video-type")?.addEventListener("change",t=>{const e=t.target.value,o=document.getElementById("youtube-field"),d=document.getElementById("upload-field");o?.classList.toggle("hidden",e!=="youtube"),d?.classList.toggle("hidden",e!=="upload")}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await c.auth.signOut(),window.location.href="/login"})}function q(){const t=document.getElementById("module-modal"),e=document.getElementById("module-form"),o=document.getElementById("module-modal-title");f?(o.textContent="Edit Module",document.getElementById("module-name").value=f.name,document.getElementById("module-description").value=f.description||"",document.getElementById("module-order").value=f.order_index):(o.textContent="Add Module",e.reset(),document.getElementById("module-order").value=(v.length+1).toString()),t?.classList.remove("hidden")}function _(){document.getElementById("module-modal")?.classList.add("hidden"),f=null}async function Y(t){t.preventDefault();const e={course_id:h.id,name:document.getElementById("module-name").value,description:document.getElementById("module-description").value,order_index:parseInt(document.getElementById("module-order").value)};if(f){const{error:o}=await c.from("modules").update(e).eq("id",f.id);if(o){r("Error updating module: "+o.message,"error");return}}else{const{error:o}=await c.from("modules").insert([e]);if(o){r("Error creating module: "+o.message,"error");return}}_(),await I()}function X(t){f=v.find(e=>e.id===t),f&&q()}async function G(t){const{error:e}=await c.from("modules").delete().eq("id",t);if(e){r("Error deleting module: "+e.message,"error");return}r("Module deleted successfully","success"),await I()}function Z(t){w=t,a=null,T()}function T(){const t=document.getElementById("lesson-modal"),e=document.getElementById("lesson-form"),o=document.getElementById("lesson-modal-title"),l=v.find(n=>n.id===w)?.lessons?.length||0;if(a){o.textContent="Edit Lesson",document.getElementById("lesson-name").value=a.name,document.getElementById("lesson-slug").value=a.slug,document.getElementById("lesson-duration").value=a.video_duration_seconds||"",document.getElementById("lesson-content").value=a.text_content||"",document.getElementById("lesson-order").value=a.order_index;const n=document.getElementById("lesson-video-type"),i=document.getElementById("lesson-youtube"),s=document.getElementById("lesson-video-path");a.youtube_url?(n.value="youtube",i.value=a.youtube_url,document.getElementById("youtube-field")?.classList.remove("hidden")):a.video_path?(n.value="upload",s.value=a.video_path,document.getElementById("upload-field")?.classList.remove("hidden")):n.value=""}else o.textContent="Add Lesson",e.reset(),document.getElementById("lesson-order").value=(l+1).toString(),document.getElementById("youtube-field")?.classList.add("hidden"),document.getElementById("upload-field")?.classList.add("hidden");t?.classList.remove("hidden")}function k(){document.getElementById("lesson-modal")?.classList.add("hidden"),a=null,w=null}async function R(t){t.preventDefault();const e=document.getElementById("lesson-video-type").value,o=document.getElementById("lesson-youtube").value,d=document.getElementById("lesson-video-path").value,l={module_id:w||a.module_id,name:document.getElementById("lesson-name").value,slug:document.getElementById("lesson-slug").value,video_duration_seconds:parseInt(document.getElementById("lesson-duration").value)||null,text_content:document.getElementById("lesson-content").value,order_index:parseInt(document.getElementById("lesson-order").value),youtube_url:e==="youtube"?o:null,video_path:e==="upload"?d:null};if(a){const{error:n}=await c.from("lessons").update(l).eq("id",a.id);if(n){r("Error updating lesson: "+n.message,"error");return}}else{const{error:n}=await c.from("lessons").insert([l]);if(n){r("Error creating lesson: "+n.message,"error");return}}k(),await I()}function K(t,e){a=v.find(d=>d.id===e)?.lessons?.find(d=>d.id===t),w=e,a&&T()}async function Q(t){const{error:e}=await c.from("lessons").delete().eq("id",t);if(e){r("Error deleting lesson: "+e.message,"error");return}r("Lesson deleted successfully","success"),await I()}function W(t){return{"animal-advocacy":"Animal Advocacy",climate:"Climate","ai-safety":"AI Safety",general:"General"}[t]||t}function ee(t){return t.charAt(0).toUpperCase()+t.slice(1)}P();
