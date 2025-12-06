import{j as i}from"../assets/jsx-runtime.D_zvdyIk.js";import{r as h}from"../assets/index.GIa-TyKg.js";import"../assets/_commonjsHelpers.D6-XlEtG.js";import"../assets/index.CMF_dOlt.js";var v="clover",y=function(e){return e===3?"v3":e},b="https://js.stripe.com",S="".concat(b,"/").concat(v,"/stripe.js"),j=/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,E=/^https:\/\/js\.stripe\.com\/(v3|[a-z]+)\/stripe\.js(\?.*)?$/;var L=function(e){return j.test(e)||E.test(e)},P=function(){for(var e=document.querySelectorAll('script[src^="'.concat(b,'"]')),t=0;t<e.length;t++){var n=e[t];if(L(n.src))return n}return null},g=function(e){var t="",n=document.createElement("script");n.src="".concat(S).concat(t);var a=document.head||document.body;if(!a)throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");return a.appendChild(n),n},k=function(e,t){!e||!e._registerWrapper||e._registerWrapper({name:"stripe-js",version:"8.5.2",startTime:t})},d=null,m=null,f=null,N=function(e){return function(t){e(new Error("Failed to load Stripe.js",{cause:t}))}},C=function(e,t){return function(){window.Stripe?e(window.Stripe):t(new Error("Stripe.js not available"))}},I=function(e){return d!==null?d:(d=new Promise(function(t,n){if(typeof window>"u"||typeof document>"u"){t(null);return}if(window.Stripe){t(window.Stripe);return}try{var a=P();if(!(a&&e)){if(!a)a=g(e);else if(a&&f!==null&&m!==null){var c;a.removeEventListener("load",f),a.removeEventListener("error",m),(c=a.parentNode)===null||c===void 0||c.removeChild(a),a=g(e)}}f=C(t,n),m=N(n),a.addEventListener("load",f),a.addEventListener("error",m)}catch(r){n(r);return}}),d.catch(function(t){return d=null,Promise.reject(t)}))},R=function(e,t,n){if(e===null)return null;var a=t[0],c=a.match(/^pk_test/),r=y(e.version),s=v;c&&r!==s&&console.warn("Stripe.js@".concat(r," was loaded on the page, but @stripe/stripe-js@").concat("8.5.2"," expected Stripe.js@").concat(s,". This may result in unexpected behavior. For more information, see https://docs.stripe.com/sdks/stripejs-versioning"));var l=e.apply(void 0,t);return k(l,n),l},p,x=!1,w=function(){return p||(p=I(null).catch(function(e){return p=null,Promise.reject(e)}),p)};Promise.resolve().then(function(){return w()}).catch(function(o){x||console.warn(o)});var T=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];x=!0;var a=Date.now();return w().then(function(c){return R(c,t,a)})};T("pk_test_...your-publishable-key");const B=()=>{const[o,e]=h.useState("monthly"),[t,n]=h.useState(null);h.useEffect(()=>{const r=s=>{e(s.detail)};return window.addEventListener("billing-interval-change",r),()=>{window.removeEventListener("billing-interval-change",r)}},[]);const a=[{id:"free",name:"Free",price:0,interval:null,features:["Access to free courses","Community forum access","Basic progress tracking","Course certificates"],cta:"Get Started"},{id:"pro",name:"Pro",price:o==="monthly"?29:290,interval:o==="monthly"?"month":"year",priceId:o==="monthly"?"price_...monthly-price-id":"price_...yearly-price-id",popular:!0,features:["All free features","Access to all premium courses","Cohort-based learning","Priority support","Downloadable resources","Advanced progress analytics","Course certificates",o==="yearly"?"2 months free (17% discount)":""].filter(Boolean),cta:"Start Free Trial"},{id:"enterprise",name:"Enterprise",price:"Custom",interval:null,isEnterprise:!0,features:["All Pro features","Custom cohort creation","White-label option","Dedicated account manager","Custom integrations","Team management (5+ seats)","API access"],cta:"Contact Sales"}],c=async r=>{if(r.isEnterprise){window.location.href="/contact?subject=Enterprise Plan";return}if(r.id==="free"){window.location.href="/apply";return}n(r.id);try{const s=localStorage.getItem("sb-access-token");if(!s){window.location.href="/login?redirect=/pricing";return}const u=await(await fetch("/api/payments/create-checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify({type:"subscription",priceId:r.priceId,metadata:{planName:r.name,billingInterval:r.interval,trialDays:14}})})).json();if(!u.success)throw new Error(u.error||"Failed to create checkout session");u.sessionUrl&&(window.location.href=u.sessionUrl)}catch(s){console.error("Checkout error:",s),alert(s instanceof Error?s.message:"Failed to start checkout. Please try again."),n(null)}};return i.jsxs("div",{className:"pricing-table",children:[a.map(r=>i.jsxs("div",{className:`pricing-card ${r.popular?"popular":""}`,children:[r.popular&&i.jsx("div",{className:"popular-badge",children:"Most Popular"}),i.jsxs("div",{className:"card-header",children:[i.jsx("h3",{className:"plan-name",children:r.name}),i.jsx("div",{className:"price-container",children:typeof r.price=="number"?i.jsxs(i.Fragment,{children:[i.jsx("span",{className:"currency",children:"$"}),i.jsx("span",{className:"price",children:r.price}),r.interval&&i.jsxs("span",{className:"interval",children:["/",r.interval]})]}):i.jsx("span",{className:"price custom",children:r.price})}),o==="yearly"&&r.id==="pro"&&i.jsxs("p",{className:"billing-note",children:["Billed annually at $",r.price]})]}),i.jsx("ul",{className:"features-list",children:r.features.map((s,l)=>i.jsxs("li",{className:"feature-item",children:[i.jsx("svg",{className:"check-icon",viewBox:"0 0 20 20",fill:"currentColor",children:i.jsx("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})}),i.jsx("span",{children:s})]},l))}),i.jsx("button",{className:`cta-button ${r.popular?"primary":"secondary"}`,onClick:()=>c(r),disabled:t===r.id,children:t===r.id?"Loading...":r.cta})]},r.id)),i.jsx("style",{children:`
        .pricing-table {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .pricing-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .pricing-card.popular {
          border: 3px solid #3182ce;
          transform: scale(1.05);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .plan-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 1rem;
        }

        .price-container {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25rem;
        }

        .currency {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4a5568;
        }

        .price {
          font-size: 3.5rem;
          font-weight: 800;
          color: #2d3748;
        }

        .price.custom {
          font-size: 2.5rem;
        }

        .interval {
          font-size: 1.125rem;
          color: #718096;
        }

        .billing-note {
          font-size: 0.875rem;
          color: #718096;
          margin-top: 0.5rem;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem 0;
          flex-grow: 1;
        }

        .feature-item {
          display: flex;
          align-items: start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          color: #4a5568;
        }

        .check-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #48bb78;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .cta-button {
          width: 100%;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .cta-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
        }

        .cta-button.secondary {
          background: white;
          color: #3182ce;
          border: 2px solid #3182ce;
        }

        .cta-button.secondary:hover:not(:disabled) {
          background: #3182ce;
          color: white;
        }

        .cta-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .pricing-table {
            grid-template-columns: 1fr;
          }

          .pricing-card.popular {
            transform: scale(1);
          }

          .price {
            font-size: 2.5rem;
          }
        }
      `})]})};export{B as default};
