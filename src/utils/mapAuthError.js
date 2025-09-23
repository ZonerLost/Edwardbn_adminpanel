export function mapAuthError(err) {
  // Works for both Firebase SDK (auth/...) and REST ({error:{message:"..."}})
  const raw =
    err?.code ||
    err?.error?.message ||
    err?.message ||
    "";

  const code = String(raw).toLowerCase();

  if (
    code.includes("invalid-login-credentials") ||
    code.includes("auth/wrong-password") ||
    code.includes("auth/invalid-credential")
  ) return "The email or password is incorrect.";

  if (code.includes("auth/user-not-found")) return "No account exists with that email.";
  if (code.includes("auth/user-disabled")) return "This account has been disabled.";
  if (code.includes("auth/too-many-requests")) return "Too many attempts. Try again later or reset your password.";
  if (code.includes("auth/invalid-email")) return "Enter a valid email address.";
  if (code.includes("operation-not-allowed")) return "Email/password sign-in is not enabled for this project.";
  if (code.includes("network-request-failed")) return "Network error. Check your connection and try again.";
  if (code.includes("invalid-api-key")) return "Auth is misconfigured (invalid API key).";

  return "Couldn't sign you in. Please try again.";
}
