const a="c4c-toast-container";function d(){let e=document.getElementById(a);return e||(e=document.createElement("div"),e.id=a,e.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `,document.body.appendChild(e)),e}function c(e){return`
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
  `+{success:"background: #10b981;",error:"background: #ef4444;",warning:"background: #f59e0b;",info:"background: #3b82f6;"}[e]}function l(e){return{success:"✓",error:"✗",warning:"⚠",info:"ℹ"}[e]}function p(e,t="info",s=5e3){const n=d(),o=`toast-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,i=document.createElement("div");return i.id=o,i.style.cssText=c(t),i.innerHTML=`
    <span style="font-size: 18px;">${l(t)}</span>
    <span style="flex: 1;">${e}</span>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      opacity: 0.7;
    ">&times;</button>
  `,n.appendChild(i),s>0&&setTimeout(()=>{i.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>i.remove(),300)},s),o}function f(e){if(e){const t=document.getElementById(e);t&&(t.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>t.remove(),300))}else{const t=document.getElementById(a);t&&(t.innerHTML="")}}function u(e,t="Confirm",s="Cancel"){return new Promise(n=>{const o=document.createElement("div");o.style.cssText=`
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `,o.innerHTML=`
      <div style="
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      ">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937;">${e}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="confirm-cancel" style="
            padding: 10px 20px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">${s}</button>
          <button id="confirm-ok" style="
            padding: 10px 20px;
            border: none;
            background: #10b981;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">${t}</button>
        </div>
      </div>
    `,document.body.appendChild(o);const i=r=>{o.remove(),n(r)};o.querySelector("#confirm-ok")?.addEventListener("click",()=>i(!0)),o.querySelector("#confirm-cancel")?.addEventListener("click",()=>i(!1)),o.addEventListener("click",r=>{r.target===o&&i(!1)})})}function m(e,t,s="Loading..."){const n=typeof e=="string"?document.querySelector(e):e;n&&(t?(n.dataset.originalText=n.textContent||"",n.disabled=!0,n.innerHTML=`
      <span style="display: inline-flex; align-items: center; gap: 8px;">
        <span style="
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        "></span>
        ${s}
      </span>
    `):(n.disabled=!1,n.textContent=n.dataset.originalText||"",delete n.dataset.originalText))}if(typeof document<"u"){const e=document.createElement("style");e.textContent=`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,document.head.appendChild(e)}export{p as a,m as b,f as d,u as s};
