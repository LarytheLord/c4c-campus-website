import DOMPurify from "isomorphic-dompurify";
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidUUID(uuid) {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
function validateRequest(data, rules) {
  const errors = [];
  for (const rule of rules) {
    const value = data[rule.field];
    if (rule.required && (value === void 0 || value === null || value === "")) {
      errors.push(`${rule.field} is required`);
      continue;
    }
    if (value === void 0 || value === null || value === "") {
      continue;
    }
    if (rule.type) {
      if (rule.type === "email") {
        if (!isValidEmail(String(value))) {
          errors.push(`${rule.field}: Invalid email format`);
        }
      } else if (rule.type === "uuid") {
        if (!isValidUUID(String(value))) {
          errors.push(`${rule.field}: Invalid UUID format`);
        }
      } else if (typeof value !== rule.type) {
        errors.push(`${rule.field}: Must be of type ${rule.type}`);
      }
    }
    if (typeof value === "string") {
      if (rule.minLength !== void 0 && value.length < rule.minLength) {
        errors.push(`${rule.field}: Must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength !== void 0 && value.length > rule.maxLength) {
        errors.push(`${rule.field}: Must be at most ${rule.maxLength} characters`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${rule.field}: Invalid format`);
      }
    }
    if (typeof value === "number") {
      if (rule.min !== void 0 && value < rule.min) {
        errors.push(`${rule.field}: Must be at least ${rule.min}`);
      }
      if (rule.max !== void 0 && value > rule.max) {
        errors.push(`${rule.field}: Must be at most ${rule.max}`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function isStrongPassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Must be at least 8 characters");
  if (!/[a-z]/.test(password)) errors.push("Must contain lowercase letter");
  if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain number");
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("Must contain special character");
  return { valid: errors.length === 0, errors };
}
function sanitizeHTML(html, allowedTags) {
  const config = allowedTags ? { ALLOWED_TAGS: allowedTags } : {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "ul", "ol", "li", "a", "code", "pre"],
    ALLOWED_ATTR: ["href", "title", "target"]
  };
  return DOMPurify.sanitize(html, config);
}
export {
  isStrongPassword as i,
  sanitizeHTML as s,
  validateRequest as v
};
