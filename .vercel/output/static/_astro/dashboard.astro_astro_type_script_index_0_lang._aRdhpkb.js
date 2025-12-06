import{s as n}from"../assets/supabase.DdTcER9f.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let l=null;async function g(){const{data:{session:t}}=await n.auth.getSession();if(!t)return window.location.href="/login",!1;l=t.user;const{data:e}=await n.from("applications").select("role").eq("user_id",l.id).single();return!e||e.role!=="admin"?(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("access-denied")?.classList.remove("hidden"),!1):!0}async function m(){try{const[t,e,a,s]=await Promise.all([n.from("applications").select("id",{count:"exact",head:!0}),n.from("applications").select("id",{count:"exact",head:!0}).eq("status","pending"),n.from("courses").select("id",{count:"exact",head:!0}),n.from("cohorts").select("id",{count:"exact",head:!0}).eq("status","active")]);document.getElementById("stat-total-users").textContent=t.count?.toString()||"0",document.getElementById("stat-pending-apps").textContent=e.count?.toString()||"0",document.getElementById("stat-total-courses").textContent=a.count?.toString()||"0",document.getElementById("stat-active-cohorts").textContent=s.count?.toString()||"0",document.getElementById("db-status").textContent="Connected",document.getElementById("db-health-bar").style.width="100%",document.getElementById("storage-used").textContent="N/A",document.getElementById("storage-bar").style.width="0%"}catch(t){console.error("Error loading stats:",t),document.getElementById("db-status").textContent="Error",document.getElementById("db-status").classList.remove("text-green-500"),document.getElementById("db-status").classList.add("text-red-500")}}async function p(){const t=document.getElementById("review-queue-loading"),e=document.getElementById("review-queue-list"),a=document.getElementById("review-queue-empty"),s=document.getElementById("my-queue-count");try{const{data:o,error:d}=await n.from("applications").select("id, name, email, program, status, created_at, assignment_date").eq("assigned_reviewer_id",l.id).eq("status","pending").order("assignment_date",{ascending:!0}).limit(5);t?.classList.add("hidden");const r=o?.length||0;if(s.textContent=r.toString(),!o||o.length===0){a?.classList.remove("hidden");return}e.innerHTML=o.map(i=>{const c=Math.floor((Date.now()-new Date(i.assignment_date).getTime())/864e5),u=c>3?"text-red-500":c>1?"text-yellow-500":"text-gray-500";return`
            <div class="border border-border rounded-lg p-3 hover:border-primary transition-colors">
              <a href="/admin/applications-review?highlight=${i.id}" class="block">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="font-semibold">${i.name}</p>
                    <p class="text-sm text-text-muted">${i.email}</p>
                    <div class="flex gap-2 mt-1">
                      <span class="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">${i.program}</span>
                      <span class="text-xs ${u}">Assigned ${c}d ago</span>
                    </div>
                  </div>
                  <span class="text-primary text-sm">Review →</span>
                </div>
              </a>
            </div>
          `}).join(""),e?.classList.remove("hidden")}catch(o){console.error("Error loading review queue:",o),t?.classList.add("hidden"),a?.classList.remove("hidden")}}async function y(){const t=document.getElementById("recent-apps-loading"),e=document.getElementById("recent-apps-list"),a=document.getElementById("recent-apps-empty");try{const{data:s,error:o}=await n.from("applications").select("id, name, email, status, created_at").order("created_at",{ascending:!1}).limit(5);if(t?.classList.add("hidden"),!s||s.length===0){a?.classList.remove("hidden");return}e.innerHTML=s.map(d=>{const r=d.status==="pending"?"bg-yellow-500/10 text-yellow-500":d.status==="approved"?"bg-green-500/10 text-green-500":"bg-red-500/10 text-red-500";return`
            <div class="border border-border rounded-lg p-3">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-semibold">${d.name}</p>
                  <p class="text-sm text-text-muted">${d.email}</p>
                  <p class="text-xs text-text-muted mt-1">${new Date(d.created_at).toLocaleDateString()}</p>
                </div>
                <span class="px-2 py-1 rounded text-xs font-medium ${r}">
                  ${d.status}
                </span>
              </div>
            </div>
          `}).join(""),e?.classList.remove("hidden")}catch(s){console.error("Error loading recent applications:",s),t?.classList.add("hidden"),a?.classList.remove("hidden")}}async function h(){await g()&&(document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("dashboard-content")?.classList.remove("hidden"),await Promise.all([m(),p(),y()]))}document.getElementById("logout-btn")?.addEventListener("click",async()=>{await n.auth.signOut(),window.location.href="/login"});document.getElementById("refresh-stats-btn")?.addEventListener("click",async()=>{await m()});h();
