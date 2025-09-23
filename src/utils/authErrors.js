export function normalizeAuthError(err) {
  const code =
    err?.code || err?.error?.message || err?.message || "auth/unknown";

  switch (code) {
    case "auth/not-admin":
      return { message: "Only admins can sign in." };

    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return { message: "Incorrect email or password." };

    case "auth/invalid-email":
      return { message: "Enter a valid email address." };

    case "auth/too-many-requests":
      return { message: "Too many attempts. Try again later." };

    case "auth/network-request-failed":
      return { message: "Network error. Check your connection and try again." };

    case "auth/user-disabled":
      return { message: "This account has been disabled." };

    default:
      return { message: "Sign-in failed. Please try again." };
  }
}
