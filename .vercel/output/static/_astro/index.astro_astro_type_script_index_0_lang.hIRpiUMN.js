import{c as x}from"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";const u=x("https://auyysgeurtnpidppebqj.supabase.co","***REMOVED***");let f=[],c=[];async function _(){try{const{data:{session:e}}=await u.auth.getSession();if(!e){window.location.href="/login?redirect=/assignments";return}const{data:n,error:i}=await u.from("enrollments").select("course_id, courses(id, name)").eq("user_id",e.user.id).eq("status","active");if(i)throw i;if(!n||n.length===0){D();return}const s=n.map(l=>l.course_id),{data:t,error:d}=await u.from("assignments").select(`
            *,
            lessons!inner(
              id, name,
              modules!inner(
                id, name,
                courses!inner(id, name)
              )
            )
          `).in("lessons.modules.course_id",s).eq("is_published",!0);if(d)throw d;const o=t?.map(l=>l.id)||[],{data:a,error:r}=await u.from("assignment_submissions").select("*").in("assignment_id",o).eq("user_id",e.user.id);if(r)throw r;f=(t||[]).map(l=>{const b=a?.find(v=>v.assignment_id===l.id)||null,p=l.lessons,g=p?.modules?.courses;return{...l,user_submission:b,course_name:g?.name||"Unknown Course",course_id:g?.id,lesson_name:p?.name||"Unknown Lesson"}}),h(n),y(),m(),E()}catch(e){console.error("Error loading assignments:",e),I(e instanceof Error?e.message:"Failed to load assignments")}}function h(e){const n=document.getElementById("course-filter");n&&e.forEach(i=>{const s=i.courses,t=document.createElement("option");t.value=s.id.toString(),t.textContent=s.title,n.appendChild(t)})}function y(){const e=new Date;let n=0,i=0,s=0,t=0;f.forEach(o=>{const a=o.due_date?new Date(o.due_date):null,r=a&&e>a;o.user_submission!==null?(i++,o.user_submission?.status==="graded"&&s++):(n++,r&&t++)});const d=document.getElementById("stats-container");d&&(d.innerHTML=`
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-blue-600">${n}</div>
          <div class="text-sm text-gray-600 mt-1">Not Submitted</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-green-600">${i}</div>
          <div class="text-sm text-gray-600 mt-1">Submitted</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-purple-600">${s}</div>
          <div class="text-sm text-gray-600 mt-1">Graded</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-3xl font-bold text-red-600">${t}</div>
          <div class="text-sm text-gray-600 mt-1">Overdue</div>
        </div>
      `)}function m(){const e=document.getElementById("status-filter")?.value||"all",n=document.getElementById("sort-filter")?.value||"due_date_asc",i=document.getElementById("course-filter")?.value||"all",s=new Date;c=f.filter(t=>{if(i!=="all"&&t.course_id?.toString()!==i)return!1;const d=t.user_submission!==null,o=t.user_submission?.status==="graded",a=t.due_date?new Date(t.due_date):null,r=a&&s>a;return!(e==="not_submitted"&&d||e==="submitted"&&(!d||o)||e==="graded"&&!o||e==="overdue"&&(!r||d))}),c.sort((t,d)=>{switch(n){case"due_date_asc":return t.due_date?d.due_date?new Date(t.due_date).getTime()-new Date(d.due_date).getTime():-1:1;case"due_date_desc":return t.due_date?d.due_date?new Date(d.due_date).getTime()-new Date(t.due_date).getTime():-1:1;case"created_desc":return new Date(d.created_at).getTime()-new Date(t.created_at).getTime();case"title_asc":return t.title.localeCompare(d.title);default:return 0}}),w()}function w(){const e=document.getElementById("assignments-list"),n=document.getElementById("empty");if(!e||!n)return;if(c.length===0){e.innerHTML="",n.classList.remove("hidden");return}n.classList.add("hidden");const i=new Date;e.innerHTML=c.map(s=>{const t=s.due_date?new Date(s.due_date):null,d=t&&i>t,o=s.user_submission!==null,a=s.user_submission?.status==="graded";let r="";return o?a?r=`<span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Graded: ${s.user_submission?.points_earned||s.user_submission?.grade||0}/${s.max_points}</span>`:r='<span class="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Submitted - Pending</span>':d&&!s.allow_late_submissions?r='<span class="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Closed</span>':d?r='<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">Late</span>':r='<span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Not Submitted</span>',`
          <a href="/assignments/${s.id}" class="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold mb-1 truncate">${s.title}</h3>
                <p class="text-sm text-gray-600 mb-2">
                  <span class="font-medium">${s.course_name}</span> • ${s.lesson_name}
                </p>
                ${s.description?`<p class="text-gray-600 text-sm line-clamp-2">${s.description}</p>`:""}
              </div>
              <div>
                ${r}
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-4">
                ${t?`
                  <div class="flex items-center gap-1 ${d?"text-red-600":"text-gray-600"}">
                    <span>📅</span>
                    <span>Due: ${t.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                  </div>
                `:'<span class="text-gray-500">No due date</span>'}

                <div class="text-gray-600">
                  <span class="font-medium">${s.max_points}</span> points
                </div>
              </div>

              <div class="text-blue-600 font-medium">
                View Details →
              </div>
            </div>
          </a>
        `}).join("")}function I(e){const n=document.getElementById("error"),i=document.getElementById("loading");n&&(n.textContent=e,n.classList.remove("hidden")),i&&i.classList.add("hidden")}function D(){const e=document.getElementById("empty"),n=document.getElementById("loading");e&&e.classList.remove("hidden"),n&&n.classList.add("hidden")}function E(){const e=document.getElementById("loading");e&&e.classList.add("hidden")}document.getElementById("status-filter")?.addEventListener("change",m);document.getElementById("sort-filter")?.addEventListener("change",m);document.getElementById("course-filter")?.addEventListener("change",m);_();
