import { f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
/* empty css                                  */
import { renderers } from "../renderers.mjs";
loadStripe(
  "pk_test_...your-publishable-key"
);
const PricingTable = () => {
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [loading, setLoading] = useState(null);
  useEffect(() => {
    const handleIntervalChange = (event) => {
      setBillingInterval(event.detail);
    };
    window.addEventListener("billing-interval-change", handleIntervalChange);
    return () => {
      window.removeEventListener("billing-interval-change", handleIntervalChange);
    };
  }, []);
  const tiers = [
    {
      id: "free",
      name: "Free",
      price: 0,
      interval: null,
      features: [
        "Access to free courses",
        "Community forum access",
        "Basic progress tracking",
        "Course certificates"
      ],
      cta: "Get Started"
    },
    {
      id: "pro",
      name: "Pro",
      price: billingInterval === "monthly" ? 29 : 290,
      interval: billingInterval === "monthly" ? "month" : "year",
      priceId: billingInterval === "monthly" ? "price_...monthly-price-id" : "price_...yearly-price-id",
      popular: true,
      features: [
        "All free features",
        "Access to all premium courses",
        "Cohort-based learning",
        "Priority support",
        "Downloadable resources",
        "Advanced progress analytics",
        "Course certificates",
        billingInterval === "yearly" ? "2 months free (17% discount)" : ""
      ].filter(Boolean),
      cta: "Start Free Trial"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      interval: null,
      isEnterprise: true,
      features: [
        "All Pro features",
        "Custom cohort creation",
        "White-label option",
        "Dedicated account manager",
        "Custom integrations",
        "Team management (5+ seats)",
        "API access"
      ],
      cta: "Contact Sales"
    }
  ];
  const handleCheckout = async (tier) => {
    if (tier.isEnterprise) {
      window.location.href = "/contact?subject=Enterprise Plan";
      return;
    }
    if (tier.id === "free") {
      window.location.href = "/apply";
      return;
    }
    setLoading(tier.id);
    try {
      const token = localStorage.getItem("sb-access-token");
      if (!token) {
        window.location.href = "/login?redirect=/pricing";
        return;
      }
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "subscription",
          priceId: tier.priceId,
          metadata: {
            planName: tier.name,
            billingInterval: tier.interval,
            trialDays: 14
            // 14-day free trial
          }
        })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to start checkout. Please try again."
      );
      setLoading(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "pricing-table", children: [
    tiers.map((tier) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `pricing-card ${tier.popular ? "popular" : ""}`,
        children: [
          tier.popular && /* @__PURE__ */ jsx("div", { className: "popular-badge", children: "Most Popular" }),
          /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
            /* @__PURE__ */ jsx("h3", { className: "plan-name", children: tier.name }),
            /* @__PURE__ */ jsx("div", { className: "price-container", children: typeof tier.price === "number" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "currency", children: "$" }),
              /* @__PURE__ */ jsx("span", { className: "price", children: tier.price }),
              tier.interval && /* @__PURE__ */ jsxs("span", { className: "interval", children: [
                "/",
                tier.interval
              ] })
            ] }) : /* @__PURE__ */ jsx("span", { className: "price custom", children: tier.price }) }),
            billingInterval === "yearly" && tier.id === "pro" && /* @__PURE__ */ jsxs("p", { className: "billing-note", children: [
              "Billed annually at $",
              tier.price
            ] })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "features-list", children: tier.features.map((feature, index) => /* @__PURE__ */ jsxs("li", { className: "feature-item", children: [
            /* @__PURE__ */ jsx("svg", { className: "check-icon", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx(
              "path",
              {
                fillRule: "evenodd",
                d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                clipRule: "evenodd"
              }
            ) }),
            /* @__PURE__ */ jsx("span", { children: feature })
          ] }, index)) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `cta-button ${tier.popular ? "primary" : "secondary"}`,
              onClick: () => handleCheckout(tier),
              disabled: loading === tier.id,
              children: loading === tier.id ? "Loading..." : tier.cta
            }
          )
        ]
      },
      tier.id
    )),
    /* @__PURE__ */ jsx("style", { children: `
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
      ` })
  ] });
};
const $$Pricing = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Pricing - C4C Campus", "data-astro-cid-lmkygsfs": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="pricing-page" data-astro-cid-lmkygsfs> <!-- Hero Section --> <section class="pricing-hero" data-astro-cid-lmkygsfs> <div class="container" data-astro-cid-lmkygsfs> <h1 class="hero-title" data-astro-cid-lmkygsfs>Choose Your Learning Path</h1> <p class="hero-subtitle" data-astro-cid-lmkygsfs>
Transparent pricing, no hidden fees. Cancel anytime.
</p> <div class="billing-toggle" data-astro-cid-lmkygsfs> <button id="monthly-toggle" class="toggle-btn active" data-astro-cid-lmkygsfs>Monthly</button> <button id="yearly-toggle" class="toggle-btn" data-astro-cid-lmkygsfs>Yearly <span class="badge" data-astro-cid-lmkygsfs>Save 17%</span></button> </div> </div> </section> <!-- Pricing Tiers --> <section class="pricing-tiers" data-astro-cid-lmkygsfs> <div class="container" data-astro-cid-lmkygsfs> ${renderComponent($$result2, "PricingTable", PricingTable, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/a0/Desktop/c4c-website/src/components/payments/PricingTable", "client:component-export": "default", "data-astro-cid-lmkygsfs": true })} </div> </section> <!-- Social Proof --> <section class="social-proof" data-astro-cid-lmkygsfs> <div class="container" data-astro-cid-lmkygsfs> <p class="proof-text" data-astro-cid-lmkygsfs>Join 2,500+ students already learning on C4C Campus</p> <div class="stats" data-astro-cid-lmkygsfs> <div class="stat" data-astro-cid-lmkygsfs> <span class="stat-number" data-astro-cid-lmkygsfs>2,500+</span> <span class="stat-label" data-astro-cid-lmkygsfs>Active Students</span> </div> <div class="stat" data-astro-cid-lmkygsfs> <span class="stat-number" data-astro-cid-lmkygsfs>50+</span> <span class="stat-label" data-astro-cid-lmkygsfs>Expert Teachers</span> </div> <div class="stat" data-astro-cid-lmkygsfs> <span class="stat-number" data-astro-cid-lmkygsfs>200+</span> <span class="stat-label" data-astro-cid-lmkygsfs>Courses Available</span> </div> <div class="stat" data-astro-cid-lmkygsfs> <span class="stat-number" data-astro-cid-lmkygsfs>4.8/5</span> <span class="stat-label" data-astro-cid-lmkygsfs>Average Rating</span> </div> </div> </div> </section> <!-- FAQ Section --> <section class="faq-section" data-astro-cid-lmkygsfs> <div class="container" data-astro-cid-lmkygsfs> <h2 class="section-title" data-astro-cid-lmkygsfs>Frequently Asked Questions</h2> <div class="faq-grid" data-astro-cid-lmkygsfs> <div class="faq-item" data-astro-cid-lmkygsfs> <h3 class="faq-question" data-astro-cid-lmkygsfs>Can I switch plans anytime?</h3> <p class="faq-answer" data-astro-cid-lmkygsfs>
Yes! You can upgrade or downgrade your plan at any time. If you upgrade,
              you'll be charged a prorated amount. If you downgrade, the change will
              take effect at the end of your current billing period.
</p> </div> <div class="faq-item" data-astro-cid-lmkygsfs> <h3 class="faq-question" data-astro-cid-lmkygsfs>Do you offer refunds?</h3> <p class="faq-answer" data-astro-cid-lmkygsfs>
We offer a 30-day money-back guarantee for all course purchases and
              subscriptions. If you're not satisfied, contact us for a full refund.
</p> </div> <div class="faq-item" data-astro-cid-lmkygsfs> <h3 class="faq-question" data-astro-cid-lmkygsfs>What's included in the Pro plan?</h3> <p class="faq-answer" data-astro-cid-lmkygsfs>
The Pro plan includes unlimited access to all premium courses, cohort-based
              learning, priority support, downloadable resources, and course certificates.
</p> </div> <div class="faq-item" data-astro-cid-lmkygsfs> <h3 class="faq-question" data-astro-cid-lmkygsfs>Are there any hidden fees?</h3> <p class="faq-answer" data-astro-cid-lmkygsfs>
No hidden fees! The price you see is the price you pay. Sales tax may
              be added based on your location.
</p> </div> <div class="faq-item" data-astro-cid-lmkygsfs> <h3 class="faq-question" data-astro-cid-lmkygsfs>Can I purchase individual courses?</h3> <p class="faq-answer" data-astro-cid-lmkygsfs>
Yes! You can purchase individual courses without a subscription. Course
              prices range from $49 to $499 depending on the level and content.
</p> </div> <div class="faq-item" data-astro-cid-lmkygsfs> <h3 class="faq-question" data-astro-cid-lmkygsfs>Do you offer student discounts?</h3> <p class="faq-answer" data-astro-cid-lmkygsfs>
Yes! We offer a 50% discount for students from underrepresented communities.
              Contact us with proof of enrollment to apply.
</p> </div> </div> </div> </section> <!-- Money-Back Guarantee --> <section class="guarantee-section" data-astro-cid-lmkygsfs> <div class="container" data-astro-cid-lmkygsfs> <div class="guarantee-box" data-astro-cid-lmkygsfs> <svg class="guarantee-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-astro-cid-lmkygsfs> <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-lmkygsfs></path> </svg> <h3 data-astro-cid-lmkygsfs>30-Day Money-Back Guarantee</h3> <p data-astro-cid-lmkygsfs>
Not satisfied? Get a full refund within 30 days of purchase. No questions asked.
</p> </div> </div> </section> </div> ` })}  ${renderScript($$result, "/Users/a0/Desktop/c4c-website/src/pages/pricing.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/a0/Desktop/c4c-website/src/pages/pricing.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/pricing.astro";
const $$url = "/pricing";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Pricing,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
