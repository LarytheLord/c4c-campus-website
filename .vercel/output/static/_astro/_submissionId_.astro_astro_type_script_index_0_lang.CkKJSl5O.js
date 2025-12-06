import{c as w}from"../assets/index.CS-uK3Uq.js";import{g as x,f as _}from"../assets/file-upload.F6qW9e-X.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";import"../assets/supabase.DdTcER9f.js";const a=w("https://auyysgeurtnpidppebqj.supabase.co","***REMOVED***"),g=window.location.pathname.split("/"),u=g[2],b=g[4];let t=null,d=null;async function v(){try{const{data:{session:e}}=await a.auth.getSession();if(!e){window.location.href=`/login?redirect=${window.location.pathname}`;return}const{data:n,error:i}=await a.from("assignment_submissions").select(`
            *,
            assignments(
              *,
              lessons(
                id, name,
                modules(
                  id, name,
                  courses(id, name)
                )
              )
            )
          `).eq("id",b).single();if(i||!n)throw new Error("Submission not found or access denied");if(n.user_id!==e.user.id)throw new Error("Access denied");t=n,d=n.assignments,h([]),F()}catch(e){console.error("Error loading submission:",e),S(e instanceof Error?e.message:"Failed to load submission")}}function h(e){if(!t||!d)return;const n=document.getElementById("back-link");n&&n.setAttribute("href",`/assignments/${u}`);const i=document.getElementById("submission-title");i&&(i.textContent=`Submission #${t.submission_number}`);const s=document.getElementById("submission-meta");if(s){const y=d.lessons?.modules?.courses;s.textContent=`${d.title} • ${y?.name||"Course"}`}I(),$(),E(),D(e);const o=new Date,l=d.due_date?new Date(d.due_date):null,f=l&&o>l,p=d.allow_resubmission&&t.submission_number<d.max_submissions&&(!f||d.allow_late_submissions),r=document.getElementById("resubmit-btn");r&&p&&(r.classList.remove("hidden"),r.addEventListener("click",()=>{window.location.href=`/assignments/${u}`}));const c=document.getElementById("content");c&&c.classList.remove("hidden")}function I(){if(!t)return;const e=document.getElementById("status-badge");if(!e)return;let n="";t.status==="graded"?n=`<span class="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full">Graded: ${t.points_earned||t.grade||0}/${d.max_points}</span>`:t.is_late?n='<span class="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">Late Submission</span>':n='<span class="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Pending Grade</span>',e.innerHTML=n}function $(){if(!t)return;const e=document.getElementById("file-info");if(!e)return;const n=x(t.file_name),i=_(t.file_size_bytes);e.innerHTML=`
        <div class="flex items-center gap-3">
          <span class="text-4xl">${n}</span>
          <div>
            <p class="font-medium text-lg">${t.file_name}</p>
            <p class="text-sm text-gray-600">${i} • ${t.file_type}</p>
          </div>
        </div>
        <button
          id="download-file-btn"
          class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
        >
          Download
        </button>
      `;const s=document.getElementById("download-file-btn");s&&s.addEventListener("click",m);const o=document.getElementById("download-btn");o&&o.addEventListener("click",m)}function E(){if(!t)return;const e=document.getElementById("grade-container");if(!e)return;if(t.status!=="graded"||t.grade===null){e.innerHTML=`
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-5xl mb-3">⏳</div>
            <h3 class="text-lg font-bold text-yellow-700 mb-2">Grading in Progress</h3>
            <p class="text-yellow-600 text-sm">Your submission is being reviewed by the instructor.</p>
          </div>
        `;return}const n=t.points_earned||t.grade||0,i=n/d.max_points*100;let s="gray",o="📊";i>=90?(s="green",o="🌟"):i>=80?(s="blue",o="✨"):i>=70?(s="yellow",o="👍"):i>=60?(s="orange",o="📈"):(s="red",o="📉"),e.innerHTML=`
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold mb-4">Grade & Feedback</h2>

          <div class="text-center mb-6">
            <div class="text-6xl mb-2">${o}</div>
            <div class="text-5xl font-bold text-${s}-600 mb-2">${n}</div>
            <div class="text-gray-600 text-lg mb-1">out of ${d.max_points} points</div>
            <div class="text-2xl font-semibold text-${s}-600">${i.toFixed(1)}%</div>
          </div>

          <div class="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div class="bg-${s}-500 h-3 rounded-full" style="width: ${i}%"></div>
          </div>

          ${t.is_late&&t.grade!==t.points_earned?`
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-sm text-orange-700">
              <strong>⚠️ Late Penalty Applied:</strong> Original grade ${t.grade} reduced to ${t.points_earned}
            </div>
          `:""}

          ${t.feedback?`
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="font-semibold mb-2 flex items-center gap-2">
                <span>💬</span> Instructor Feedback
              </h3>
              <p class="text-gray-700 whitespace-pre-wrap">${t.feedback}</p>
            </div>
          `:'<p class="text-gray-500 text-sm text-center">No feedback provided yet.</p>'}

          ${t.graded_at?`
            <div class="mt-4 text-sm text-gray-600 text-center">
              Graded on ${new Date(t.graded_at).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}
            </div>
          `:""}
        </div>
      `}function D(e){const n=document.getElementById("timeline");if(!n)return;const i=[{action:t.submission_number>1?"resubmitted":"submitted",timestamp:t.submitted_at,icon:"📤",color:"blue",description:`Submission #${t.submission_number} uploaded${t.is_late?" (Late)":""}`},...e.map(s=>({action:s.action,timestamp:s.created_at,icon:k(s.action),color:B(s.action),description:L(s.action,s.details)}))];n.innerHTML=i.map((s,o)=>`
        <div class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full bg-${s.color}-100 flex items-center justify-center text-lg">
              ${s.icon}
            </div>
            ${o<i.length-1?'<div class="w-0.5 h-full bg-gray-200 mt-2"></div>':""}
          </div>
          <div class="flex-1 pb-6">
            <p class="font-medium text-gray-900">${s.description}</p>
            <p class="text-sm text-gray-600">
              ${new Date(s.timestamp).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}
            </p>
          </div>
        </div>
      `).join("")}function k(e){return{submitted:"📤",resubmitted:"🔄",graded:"✅",returned:"📥",downloaded_by_teacher:"👨‍🏫",downloaded_by_student:"📥",feedback_updated:"💬",grade_updated:"📝"}[e]||"📋"}function B(e){return{submitted:"blue",resubmitted:"purple",graded:"green",returned:"blue",downloaded_by_teacher:"gray",downloaded_by_student:"gray",feedback_updated:"yellow",grade_updated:"orange"}[e]||"gray"}function L(e,n){return{submitted:"Assignment submitted",resubmitted:"Assignment resubmitted",graded:"Graded by instructor",returned:"Returned to student",downloaded_by_teacher:"Downloaded by instructor",downloaded_by_student:"Downloaded by you",feedback_updated:"Feedback updated",grade_updated:"Grade updated"}[e]||e}async function m(){try{const{data:{session:e}}=await a.auth.getSession();if(!e)return;const n=await fetch(`/api/submissions/${b}/download`,{headers:{Authorization:`Bearer ${e.access_token}`}}),i=await n.json();if(!n.ok)throw new Error(i.error||"Failed to get download URL");window.open(i.url,"_blank")}catch(e){alert(`Download failed: ${e instanceof Error?e.message:"Unknown error"}`)}}function S(e){const n=document.getElementById("error"),i=document.getElementById("loading");n&&(n.textContent=e,n.classList.remove("hidden")),i&&i.classList.add("hidden")}function F(){const e=document.getElementById("loading");e&&e.classList.add("hidden")}v();
