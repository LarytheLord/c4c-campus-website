import { Resend } from "resend";
import { renderers } from "../../renderers.mjs";
const resend = new Resend("***REMOVED***");
const POST = async ({ request }) => {
  try {
    const formData = await request.json();
    const { name, email, subject, message } = formData;
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data, error } = await resend.emails.send({
      from: "C4C Campus <contact@updates.codeforcompassion.com>",
      to: ["info@codeforcompassion.com"],
      replyTo: email,
      subject: `[C4C Contact Form] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `
    });
    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again or email us directly at info@codeforcompassion.com" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
        emailId: data?.id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
