const p=document.getElementById("show-bootcamp"),u=document.getElementById("show-incubator"),g=document.getElementById("show-hackathon"),l=document.getElementById("bootcamp"),m=document.getElementById("incubator"),h=document.getElementById("hackathon");function c(e,n=!0){l?.classList.add("hidden"),m?.classList.add("hidden"),h?.classList.add("hidden"),p?.classList.remove("active-program"),u?.classList.remove("active-program"),g?.classList.remove("active-program");let i=null;if(e==="bootcamp"?(l?.classList.remove("hidden"),p?.classList.add("active-program"),i=l):e==="incubator"?(m?.classList.remove("hidden"),u?.classList.add("active-program"),i=m):e==="hackathon"&&(h?.classList.remove("hidden"),g?.classList.add("active-program"),i=h),n&&i){const o=i.getBoundingClientRect().top+window.scrollY-80;window.scrollTo({top:o,behavior:"smooth"})}}p?.addEventListener("click",()=>c("bootcamp"));u?.addEventListener("click",()=>c("incubator"));g?.addEventListener("click",()=>c("hackathon"));window.addEventListener("DOMContentLoaded",()=>{const e=window.location.hash.substring(1);e==="bootcamp"?c("bootcamp",!0):e==="incubator"?c("incubator",!0):e==="hackathon"?c("hackathon",!0):c("bootcamp",!1)});const d={container:null,ensureContainer(){return this.container||(this.container=document.createElement("div"),this.container.id="c4c-toast-container",this.container.style.cssText=`
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      `,document.body.appendChild(this.container)),this.container},show(e,n,i){const a=this.ensureContainer(),t={success:{bg:"#ecfdf5",border:"#a7f3d0",icon:"#059669",iconBg:"#d1fae5"},error:{bg:"#fef2f2",border:"#fecaca",icon:"#dc2626",iconBg:"#fee2e2"},warning:{bg:"#fffbeb",border:"#fde68a",icon:"#d97706",iconBg:"#fef3c7"},info:{bg:"#ecfeff",border:"#a5f3fc",icon:"#0891b2",iconBg:"#cffafe"}},o={success:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',error:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',warning:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',info:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'},s=t[e],r=document.createElement("div");r.setAttribute("role","alert"),r.style.cssText=`
      background: ${s.bg};
      border: 1px solid ${s.border};
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      max-width: 24rem;
      animation: slideInRight 300ms ease-out;
    `,r.innerHTML=`
      <div style="background: ${s.iconBg}; color: ${s.icon}; padding: 0.375rem; border-radius: 9999px; flex-shrink: 0;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">${o[e]}</svg>
      </div>
      <div style="flex: 1; min-width: 0;">
        ${i?`<p style="font-weight: 600; color: #111827; font-size: 0.875rem; margin: 0 0 0.25rem 0;">${i}</p>`:""}
        <p style="color: #374151; font-size: 0.875rem; margin: 0;">${n}</p>
      </div>
      <button style="flex-shrink: 0; color: #9ca3af; background: none; border: none; cursor: pointer;" aria-label="Dismiss">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;const w=r.querySelector("button"),f=()=>{r.style.opacity="0",r.style.transform="translateX(100%)",r.style.transition="all 200ms ease-out",setTimeout(()=>r.remove(),200)};w?.addEventListener("click",f),setTimeout(f,6e3),a.appendChild(r)},success(e,n){this.show("success",e,n)},error(e,n){this.show("error",e,n)},warning(e,n){this.show("warning",e,n)},info(e,n){this.show("info",e,n)}};async function b(e,n){e.preventDefault();const i=e.target,a=i.querySelector('button[type="submit"]'),t=new FormData(i),o={program:n,name:t.get("name"),email:t.get("email"),whatsapp:t.get("whatsapp"),location:t.get("location"),discord:t.get("discord"),password:t.get("password"),confirmPassword:t.get("confirmPassword")};if(n==="bootcamp"?(o.interests=Array.from(i.querySelectorAll('input[type="checkbox"]:checked')).map(s=>s.nextElementSibling?.textContent),o.motivation=t.get("motivation"),o.technicalExperience=t.get("technicalExperience"),o.commitment=t.get("commitment")):n==="accelerator"&&(o.track=t.get("track"),o.projectName=t.get("projectName"),o.projectDescription=t.get("projectDescription"),o.prototypeLink=t.get("prototypeLink"),o.techStack=t.get("techStack"),o.targetUsers=t.get("targetUsers"),o.productionNeeds=t.get("productionNeeds"),o.technicalExperience=t.get("technicalExperience"),o.teamSize=t.get("teamSize"),o.currentStage=t.get("currentStage"),o.commitment=t.get("commitment"),o.funding=t.get("funding")),o.password!==o.confirmPassword){d.error("Passwords do not match. Please try again.","Validation Error");return}a.disabled=!0,a.textContent="Submitting...";try{const s=await fetch("/api/apply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),r=await s.json();s.ok?(d.success(r.message||"Application submitted! Check your email to verify your account.","Application Received"),i.reset()):d.error(r.error||"Failed to submit application. Please try again.","Submission Failed")}catch(s){console.error("Submission error:",s),d.error("An error occurred. Please try again later.","Error")}finally{a.disabled=!1,a.textContent=n==="bootcamp"?"Submit Bootcamp Application":"Submit Accelerator Application"}}document.getElementById("bootcamp-form")?.addEventListener("submit",e=>b(e,"bootcamp"));document.getElementById("accelerator-form")?.addEventListener("submit",e=>b(e,"accelerator"));
