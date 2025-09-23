export const ALL_PERMS = [
  "manage_contracts",
  "manage_faqs",
  "manage_users",
  "view_reports",
];
export const ROLES = ["admin", "staff"];
export const STATUSES = ["active", "disabled"];

export const isValidEmail = (e = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e));
export const isValidE164 = (s = "") => /^\+\d{7,15}$/.test(String(s));

export function validateUser(form, { creating }) {
  if (!String(form.displayName || "").trim()) {
    return "Full name is required.";
  }
  if (!isValidEmail(form.email)) {
    return "Enter a valid email.";
  }
  // if (!form.password || form.password.length < 6) {
  //   return "Password must be at least 6 characters.";
  // }
  if (form.phoneNumber && !isValidE164(form.phoneNumber)) {
    // not a hard error — we’ll ignore the phone on submit
  }
  if (!ROLES.includes(form.role)) {
    return "Select role (admin or staff).";
  }
  if (!STATUSES.includes(form.status)) {
    return "Select status.";
  }
  if (creating && form.password && String(form.password).length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}
