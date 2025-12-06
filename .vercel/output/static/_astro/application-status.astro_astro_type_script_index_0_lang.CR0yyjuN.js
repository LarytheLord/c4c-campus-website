import{s as d}from"../assets/supabase.DdTcER9f.js";import"../assets/index.CS-uK3Uq.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";let o=null,e=null;async function r(){const{data:{session:t}}=await d.auth.getSession();if(!t){document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("not-logged-in")?.classList.remove("hidden");return}o=t.user;const{data:a,error:l}=await d.from("applications").select("*").eq("user_id",o.id).single();if(l||!a){document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("no-application")?.classList.remove("hidden");return}if(e=a,a.status==="approved"){window.location.href="/dashboard";return}p()}function p(){if(!e)return;const t=document.getElementById("welcome-text");t&&(t.textContent=`Welcome, ${e.name.split(" ")[0]}!`);const a=`status-${e.status}`;document.getElementById(a)?.classList.remove("hidden");const l=document.getElementById("submitted-date");l&&(l.textContent=new Date(e.created_at).toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"}));const i=document.getElementById("program-name");i&&(i.textContent=e.program);const s=document.getElementById("user-email");s&&(s.textContent=e.email),c(),document.getElementById("loading-state")?.classList.add("hidden"),document.getElementById("status-content")?.classList.remove("hidden")}function c(){const t=document.getElementById("application-details");if(!t||!e)return;let a=`
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-text-muted">Name</label>
            <p class="mt-1">${e.name}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Email</label>
            <p class="mt-1">${e.email}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">WhatsApp</label>
            <p class="mt-1">${e.whatsapp||"-"}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Location</label>
            <p class="mt-1">${e.location||"-"}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-text-muted">Discord</label>
            <p class="mt-1">${e.discord||"-"}</p>
          </div>
        </div>
      `;e.program==="bootcamp"?a+=`
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Interests</label>
            <p class="mt-1">${e.interests?.join(", ")||"-"}</p>
          </div>
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Motivation</label>
            <p class="mt-1 whitespace-pre-wrap">${e.motivation||"-"}</p>
          </div>
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Technical Experience</label>
            <p class="mt-1 whitespace-pre-wrap">${e.technical_experience||"-"}</p>
          </div>
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Commitment</label>
            <p class="mt-1 whitespace-pre-wrap">${e.commitment||"-"}</p>
          </div>
        `:e.program==="accelerator"&&(a+=`
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Track</label>
            <p class="mt-1 capitalize">${e.track||"-"}</p>
          </div>
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Project Name</label>
            <p class="mt-1">${e.project_name||"-"}</p>
          </div>
          <div class="mt-4">
            <label class="text-sm font-medium text-text-muted">Project Description</label>
            <p class="mt-1 whitespace-pre-wrap">${e.project_description||"-"}</p>
          </div>
        `),t.innerHTML=a}function u(){if(!e)return;const t=document.getElementById("edit-modal"),a=document.getElementById("edit-form-fields");if(!a)return;let l=`
        <div>
          <label class="block text-sm font-medium mb-2">WhatsApp Number</label>
          <input type="tel" name="whatsapp" value="${e.whatsapp||""}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="+91-9876543210">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Location</label>
          <input type="text" name="location" value="${e.location||""}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Mumbai, Maharashtra">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Discord Handle</label>
          <input type="text" name="discord" value="${e.discord||""}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="username#1234">
        </div>
      `;e.program==="bootcamp"&&(l+=`
          <div>
            <label class="block text-sm font-medium mb-2">Motivation</label>
            <textarea name="motivation" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg">${e.motivation||""}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Technical Experience</label>
            <textarea name="technicalExperience" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg">${e.technical_experience||""}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Commitment</label>
            <textarea name="commitment" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg">${e.commitment||""}</textarea>
          </div>
        `),a.innerHTML=l,t?.classList.remove("hidden")}function n(){document.getElementById("edit-modal")?.classList.add("hidden")}async function b(t){t.preventDefault();const a=t.target,l=new FormData(a),i={whatsapp:l.get("whatsapp"),location:l.get("location"),discord:l.get("discord")};e.program==="bootcamp"&&(i.motivation=l.get("motivation"),i.technical_experience=l.get("technicalExperience"),i.commitment=l.get("commitment"));const{error:s}=await d.from("applications").update(i).eq("id",e.id);if(s){alert("Error updating application: "+s.message);return}alert("Application updated successfully!"),n();const{data:m}=await d.from("applications").select("*").eq("user_id",o.id).single();m&&(e=m,c())}document.getElementById("edit-btn")?.addEventListener("click",u);document.getElementById("close-edit-modal")?.addEventListener("click",n);document.getElementById("cancel-edit")?.addEventListener("click",n);document.getElementById("edit-form")?.addEventListener("submit",b);document.getElementById("logout-btn")?.addEventListener("click",async()=>{await d.auth.signOut(),window.location.href="/"});document.getElementById("edit-modal")?.addEventListener("click",t=>{t.target===t.currentTarget&&n()});r();
