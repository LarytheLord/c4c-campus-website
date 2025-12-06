import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, al as defineScriptVars, m as maybeRenderHead } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
/* empty css                                     */
import { renderers } from "../../renderers.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://c4ccampus.org");
const $$Success = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Success;
  const sessionId = Astro2.url.searchParams.get("session_id");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Payment Successful - C4C Campus", "data-astro-cid-yuu2fj7j": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", `<div class="success-page" data-astro-cid-yuu2fj7j> <div class="container" data-astro-cid-yuu2fj7j> <div id="loading-state" class="loading-state" data-astro-cid-yuu2fj7j> <div class="spinner" data-astro-cid-yuu2fj7j></div> <p data-astro-cid-yuu2fj7j>Verifying your payment...</p> </div> <div id="success-state" class="success-state" style="display: none;" data-astro-cid-yuu2fj7j> <div class="success-icon" data-astro-cid-yuu2fj7j> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-yuu2fj7j> <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-yuu2fj7j></path> </svg> </div> <h1 class="success-title" data-astro-cid-yuu2fj7j>Payment Successful!</h1> <p class="success-message" id="success-message" data-astro-cid-yuu2fj7j></p> <div class="details-card" id="details-card" style="display: none;" data-astro-cid-yuu2fj7j> <h3 data-astro-cid-yuu2fj7j>Order Details</h3> <div class="details-content" id="details-content" data-astro-cid-yuu2fj7j></div> </div> <div class="actions" data-astro-cid-yuu2fj7j> <a href="/dashboard" class="btn btn-primary" data-astro-cid-yuu2fj7j>Go to Dashboard</a> <a href="/courses" class="btn btn-secondary" data-astro-cid-yuu2fj7j>Browse Courses</a> </div> <div class="next-steps" data-astro-cid-yuu2fj7j> <h3 data-astro-cid-yuu2fj7j>What's Next?</h3> <ul data-astro-cid-yuu2fj7j> <li data-astro-cid-yuu2fj7j>Check your email for payment confirmation</li> <li data-astro-cid-yuu2fj7j>Access your courses from the dashboard</li> <li data-astro-cid-yuu2fj7j>Join our community forum to connect with other students</li> <li data-astro-cid-yuu2fj7j>Explore cohort-based learning opportunities</li> </ul> </div> </div> <div id="error-state" class="error-state" style="display: none;" data-astro-cid-yuu2fj7j> <div class="error-icon" data-astro-cid-yuu2fj7j> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-yuu2fj7j> <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-yuu2fj7j></path> </svg> </div> <h1 class="error-title" data-astro-cid-yuu2fj7j>Verification Failed</h1> <p class="error-message" id="error-message" data-astro-cid-yuu2fj7j></p> <a href="/pricing" class="btn btn-primary" data-astro-cid-yuu2fj7j>Back to Pricing</a> </div> </div> </div> <script>(function(){`, `
    async function verifyPayment() {
      if (!sessionId) {
        showError('No session ID provided');
        return;
      }

      try {
        const token = localStorage.getItem('sb-access-token');

        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!data.success || !data.verified) {
          showError(data.error || 'Payment verification failed');
          return;
        }

        showSuccess(data);
      } catch (error) {
        console.error('Verification error:', error);
        showError('Failed to verify payment. Please contact support.');
      }
    }

    function showSuccess(data) {
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('success-state').style.display = 'block';

      const messageEl = document.getElementById('success-message');
      const detailsCard = document.getElementById('details-card');
      const detailsContent = document.getElementById('details-content');

      if (data.type === 'course_purchase' && data.course) {
        messageEl.textContent = \`You've successfully enrolled in \${data.course.title}!\`;

        detailsCard.style.display = 'block';
        detailsContent.innerHTML = \`
          <div class="detail-row">
            <span class="detail-label">Course:</span>
            <span class="detail-value">\${data.course.title}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="detail-value">$\${(data.amountTotal / 100).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value success-badge">Confirmed</span>
          </div>
        \`;
      } else if (data.type === 'subscription' && data.subscription) {
        messageEl.textContent = \`Welcome to C4C Campus \${data.subscription.planType.toUpperCase()} plan!\`;

        detailsCard.style.display = 'block';
        detailsContent.innerHTML = \`
          <div class="detail-row">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">\${data.subscription.planType} (\${data.subscription.status})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Next Billing Date:</span>
            <span class="detail-value">\${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </div>
        \`;
      } else {
        messageEl.textContent = 'Your payment was processed successfully!';
      }
    }

    function showError(message) {
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('error-state').style.display = 'block';
      document.getElementById('error-message').textContent = message;
    }

    // Verify payment on page load
    verifyPayment();
  })();<\/script>  `], [" ", `<div class="success-page" data-astro-cid-yuu2fj7j> <div class="container" data-astro-cid-yuu2fj7j> <div id="loading-state" class="loading-state" data-astro-cid-yuu2fj7j> <div class="spinner" data-astro-cid-yuu2fj7j></div> <p data-astro-cid-yuu2fj7j>Verifying your payment...</p> </div> <div id="success-state" class="success-state" style="display: none;" data-astro-cid-yuu2fj7j> <div class="success-icon" data-astro-cid-yuu2fj7j> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-yuu2fj7j> <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-yuu2fj7j></path> </svg> </div> <h1 class="success-title" data-astro-cid-yuu2fj7j>Payment Successful!</h1> <p class="success-message" id="success-message" data-astro-cid-yuu2fj7j></p> <div class="details-card" id="details-card" style="display: none;" data-astro-cid-yuu2fj7j> <h3 data-astro-cid-yuu2fj7j>Order Details</h3> <div class="details-content" id="details-content" data-astro-cid-yuu2fj7j></div> </div> <div class="actions" data-astro-cid-yuu2fj7j> <a href="/dashboard" class="btn btn-primary" data-astro-cid-yuu2fj7j>Go to Dashboard</a> <a href="/courses" class="btn btn-secondary" data-astro-cid-yuu2fj7j>Browse Courses</a> </div> <div class="next-steps" data-astro-cid-yuu2fj7j> <h3 data-astro-cid-yuu2fj7j>What's Next?</h3> <ul data-astro-cid-yuu2fj7j> <li data-astro-cid-yuu2fj7j>Check your email for payment confirmation</li> <li data-astro-cid-yuu2fj7j>Access your courses from the dashboard</li> <li data-astro-cid-yuu2fj7j>Join our community forum to connect with other students</li> <li data-astro-cid-yuu2fj7j>Explore cohort-based learning opportunities</li> </ul> </div> </div> <div id="error-state" class="error-state" style="display: none;" data-astro-cid-yuu2fj7j> <div class="error-icon" data-astro-cid-yuu2fj7j> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-yuu2fj7j> <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-yuu2fj7j></path> </svg> </div> <h1 class="error-title" data-astro-cid-yuu2fj7j>Verification Failed</h1> <p class="error-message" id="error-message" data-astro-cid-yuu2fj7j></p> <a href="/pricing" class="btn btn-primary" data-astro-cid-yuu2fj7j>Back to Pricing</a> </div> </div> </div> <script>(function(){`, `
    async function verifyPayment() {
      if (!sessionId) {
        showError('No session ID provided');
        return;
      }

      try {
        const token = localStorage.getItem('sb-access-token');

        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \\\`Bearer \\\${token}\\\`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!data.success || !data.verified) {
          showError(data.error || 'Payment verification failed');
          return;
        }

        showSuccess(data);
      } catch (error) {
        console.error('Verification error:', error);
        showError('Failed to verify payment. Please contact support.');
      }
    }

    function showSuccess(data) {
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('success-state').style.display = 'block';

      const messageEl = document.getElementById('success-message');
      const detailsCard = document.getElementById('details-card');
      const detailsContent = document.getElementById('details-content');

      if (data.type === 'course_purchase' && data.course) {
        messageEl.textContent = \\\`You've successfully enrolled in \\\${data.course.title}!\\\`;

        detailsCard.style.display = 'block';
        detailsContent.innerHTML = \\\`
          <div class="detail-row">
            <span class="detail-label">Course:</span>
            <span class="detail-value">\\\${data.course.title}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="detail-value">$\\\${(data.amountTotal / 100).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value success-badge">Confirmed</span>
          </div>
        \\\`;
      } else if (data.type === 'subscription' && data.subscription) {
        messageEl.textContent = \\\`Welcome to C4C Campus \\\${data.subscription.planType.toUpperCase()} plan!\\\`;

        detailsCard.style.display = 'block';
        detailsContent.innerHTML = \\\`
          <div class="detail-row">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">\\\${data.subscription.planType} (\\\${data.subscription.status})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Next Billing Date:</span>
            <span class="detail-value">\\\${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </div>
        \\\`;
      } else {
        messageEl.textContent = 'Your payment was processed successfully!';
      }
    }

    function showError(message) {
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('error-state').style.display = 'block';
      document.getElementById('error-message').textContent = message;
    }

    // Verify payment on page load
    verifyPayment();
  })();<\/script>  `])), maybeRenderHead(), defineScriptVars({ sessionId })) })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/payment/success.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/payment/success.astro";
const $$url = "/payment/success";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Success,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
