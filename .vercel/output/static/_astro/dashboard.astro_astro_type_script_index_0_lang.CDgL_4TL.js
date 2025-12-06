import{s as a}from"../assets/supabase.DdTcER9f.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let c=null;async function g(){const{data:{session:s}}=await a.auth.getSession();if(!s){document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("not-logged-in")?.classList.remove("hidden");return}c=s.user;const{data:e,error:l}=await a.from("applications").select("*").eq("user_id",c.id).single();if(e){if(e.role&&(e.role==="teacher"||e.role==="admin")){document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("not-logged-in")?.classList.remove("hidden");const d=document.getElementById("not-logged-in");d&&(d.innerHTML=`
              <div class="max-w-md mx-auto text-center">
                <div class="card">
                  <h2 class="text-2xl font-bold mb-4">Access Denied</h2>
                  <p class="text-text-muted mb-6">This dashboard is only accessible to students. Teachers and administrators should use the teacher dashboard.</p>
                  <a href="/teacher/courses" class="btn btn-primary">
                    Go to Teacher Dashboard
                  </a>
                </div>
              </div>
            `);return}const n=document.getElementById("welcome-text");n&&(n.textContent=`Welcome back, ${e.name.split(" ")[0]}!`)}document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("dashboard-content")?.classList.remove("hidden"),h()}async function h(){const s=document.getElementById("courses-loading"),e=document.getElementById("courses-list"),l=document.getElementById("courses-empty");try{const{data:n,error:d}=await a.from("enrollments").select(`
            *,
            courses:course_id (
              id,
              name,
              slug,
              description,
              track,
              estimated_hours,
              thumbnail_url
            )
          `).eq("user_id",c.id).eq("status","active");if(d)throw d;if(s?.classList.add("hidden"),!n||n.length===0){l?.classList.remove("hidden"),document.getElementById("stat-enrolled").textContent="0",document.getElementById("stat-completed").textContent="0",document.getElementById("stat-hours").textContent="0";return}e.innerHTML=n.map(o=>{const t=o.courses,u=o.completed_at!==null;return`
            <a href="/courses/${t.slug}" class="block border border-border rounded-lg p-4 hover:bg-surface-hover transition-colors">
              <div class="flex items-start gap-4">
                ${t.thumbnail_url?`<img src="${t.thumbnail_url}" alt="${t.title}" class="w-20 h-20 rounded-lg object-cover" />`:""}
                <div class="flex-1">
                  <h4 class="font-semibold text-lg">${t.title}</h4>
                  <p class="text-sm text-text-muted mt-1">${t.description||""}</p>
                  <div class="flex items-center gap-4 mt-2 text-sm text-text-muted">
                    ${t.track?`<span class="px-2 py-1 bg-primary/10 rounded">${t.track}</span>`:""}
                    ${t.default_duration_weeks?`<span>${t.default_duration_weeks} weeks</span>`:""}
                    ${u?'<span class="text-green-500">✓ Completed</span>':'<span class="text-blue-500">In Progress</span>'}
                  </div>
                </div>
              </div>
            </a>
          `}).join(""),e?.classList.remove("hidden");const i=n.filter(o=>o.completed_at!==null).length,m=n.reduce((o,t)=>o+(t.courses?.default_duration_weeks||0)*5,0);document.getElementById("stat-enrolled").textContent=n.length.toString(),document.getElementById("stat-completed").textContent=i.toString(),document.getElementById("stat-hours").textContent=m.toString()}catch(n){console.error("Error loading enrollments:",n),s?.classList.add("hidden"),l?.classList.remove("hidden"),document.getElementById("stat-enrolled").textContent="0",document.getElementById("stat-completed").textContent="0",document.getElementById("stat-hours").textContent="0"}}document.getElementById("logout-btn")?.addEventListener("click",async()=>{await a.auth.signOut(),window.location.href="/login"});const r=document.getElementById("language-selector");r&&r.addEventListener("change",function(){const s=this.value;s&&setTimeout(function(){const e=document.querySelector(".goog-te-combo");e&&(e.value=s,e.dispatchEvent(new Event("change")))},500)});g();
