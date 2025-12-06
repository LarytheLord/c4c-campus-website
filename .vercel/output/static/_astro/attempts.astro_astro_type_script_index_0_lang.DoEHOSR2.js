import{c as h}from"../assets/index.CS-uK3Uq.js";import{a as l}from"../assets/notifications.BUGlD4Nh.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";const x="https://auyysgeurtnpidppebqj.supabase.co",v="***REMOVED***",u=h(x,v);let o=null,d=[],p=!1;async function w(){const t=window.location.pathname.split("/"),s=parseInt(t[2]);if(isNaN(s)){l("Invalid quiz ID","error");return}const{data:{session:e}}=await u.auth.getSession();if(!e){window.location.href="/login?redirect="+encodeURIComponent(window.location.pathname);return}try{await I(s,e.access_token),b(),document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("attempts-content")?.classList.remove("hidden")}catch(n){console.error("Error loading attempts:",n),l("Failed to load attempts","error")}}async function I(t,s){const e=await fetch(`/api/quizzes/${t}`,{headers:{Authorization:`Bearer ${s}`}});if(!e.ok)throw new Error("Failed to load quiz");const n=await e.json();o=n.quiz,d=n.attempts||[];const i=d.filter(r=>r.submitted_at).length;p=o.max_attempts===0||i<o.max_attempts,document.getElementById("quiz-title").textContent=o.title,document.getElementById("breadcrumb").textContent=`${d.length} attempt${d.length!==1?"s":""}`,document.getElementById("quiz-title-display").textContent=o.title,document.getElementById("quiz-description").textContent=o.description||"No description",document.getElementById("passing-score").textContent=`${o.passing_score}%`,document.getElementById("max-attempts").textContent=o.max_attempts===0?"Unlimited":o.max_attempts.toString();const a=d.filter(r=>r.submitted_at),c=a.length>0?Math.max(...a.map(r=>r.score)):0,m=document.getElementById("best-score");if(m.textContent=a.length>0?`${c}%`:"N/A",c>=o.passing_score?m.classList.add("text-success"):a.length>0&&m.classList.add("text-error"),p){const r=document.getElementById("retry-btn");r.classList.remove("hidden"),r.onclick=g}document.getElementById("back-btn")?.addEventListener("click",()=>{history.back()})}function b(){if(d.length===0){document.getElementById("no-attempts")?.classList.remove("hidden"),document.getElementById("start-quiz-btn").onclick=g;return}const t=document.getElementById("attempts-list");[...d].sort((e,n)=>n.attempt_number-e.attempt_number).forEach(e=>{const n=y(e);t.appendChild(n)})}function y(t){const s=document.createElement("div");s.className="card hover:shadow-lg transition-shadow";const e=!!t.submitted_at,n=t.passed,i=t.grading_status==="needs_review";return s.innerHTML=`
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-1">
          <!-- Attempt Badge -->
          <div class="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center ${n?"bg-success/10 text-success":i?"bg-warning/10 text-warning":e?"bg-error/10 text-error":"bg-surface-hover text-text-muted"}">
            <div class="text-xs font-medium">Attempt</div>
            <div class="text-2xl font-bold">#${t.attempt_number}</div>
          </div>

          <!-- Attempt Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <h4 class="text-lg font-bold">
                ${e?n?"Passed":"Not Passed":"In Progress"}
              </h4>
              ${i?`
                <span class="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded">
                  Awaiting Review
                </span>
              `:""}
            </div>

            <div class="flex flex-wrap gap-4 text-sm text-text-muted">
              ${e?`
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-bold ${n?"text-success":"text-error"}">${t.score}%</span>
                  <span>(${t.points_earned}/${t.total_points} points)</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>${$(t.time_spent_seconds)}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>${f(t.submitted_at)}</span>
                </div>
              `:`
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Started ${f(t.started_at)}</span>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0 flex gap-2">
          ${e?`
            <a href="/quizzes/${o.id}/results/${t.id}" class="btn btn-primary btn-sm">
              View Results
            </a>
          `:`
            <a href="/quizzes/${o.id}/take?attemptId=${t.id}" class="btn btn-primary btn-sm">
              Continue
            </a>
          `}
        </div>
      </div>
    `,s}function $(t){if(!t)return"N/A";const s=Math.floor(t/60),e=t%60;return s===0?`${e}s`:e===0?`${s}m`:`${s}m ${e}s`}function f(t){const s=new Date(t),e=new Date,n=e.getTime()-s.getTime(),i=Math.floor(n/6e4),a=Math.floor(n/36e5),c=Math.floor(n/864e5);return i<1?"Just now":i<60?`${i} minute${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:c<7?`${c} day${c!==1?"s":""} ago`:s.toLocaleDateString("en-US",{month:"short",day:"numeric",year:s.getFullYear()!==e.getFullYear()?"numeric":void 0})}async function g(){if(o)try{const{data:{session:t}}=await u.auth.getSession();if(!t)return;const s=await fetch(`/api/quizzes/${o.id}/start`,{method:"POST",headers:{Authorization:`Bearer ${t.access_token}`,"Content-Type":"application/json"}});if(!s.ok){const n=await s.json();l(n.error||"Failed to start quiz","error");return}const e=await s.json();window.location.href=`/quizzes/${o.id}/take?attemptId=${e.attempt.id}`}catch(t){console.error("Error starting quiz:",t),l("Failed to start quiz","error")}}document.getElementById("logout-btn")?.addEventListener("click",async()=>{await u.auth.signOut(),window.location.href="/login"});w();
