import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { emailSignIn, resetPassword } from "../features/db/auth/api";
import { mapAuthError } from "../utils/mapAuthError";
import { useAuth } from "../auth/AuthContext"; // assumes you already have this
import { normalizeAuthError } from "../utils/authErrors";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth(); // <- optional early redirect
  const redirectTo = useMemo(
    () => location.state?.redirectTo || "/",
    [location.state]
  );

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already signed in, skip login screen
  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, user, navigate, redirectTo]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !pass) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    const t = toast.loading("Signing you in…");
    try {
      await emailSignIn(email.trim().toLowerCase(), pass);
      toast.dismiss(t);
      toast.success("Signed in successfully.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // DON'T console.error here unless you really want to.
      const { message } = normalizeAuthError(err);
      toast.dismiss(t);
      toast.error(message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    if (!email) {
      toast.error("Enter your email above first.");
      return;
    }
    await toast.promise(resetPassword(email.trim()), {
      loading: "Sending reset link...",
      success: "Password reset email sent (if the account exists).",
      error: (e) => mapAuthError(e),
    });
  };

  // While AuthContext determines current user, show nothing (or a splash)
  if (authLoading) return null;

  return (
    <div className="h-screen">
      <div className="h-full w-full relative">
        <img
          className="h-full w-full object-cover"
          alt="background"
          src="https://images.pexels.com/photos/65911/winter-nature-season-trees-65911.jpeg"
          loading="eager"
        />
        <div className="absolute inset-0">
          <div className="w-full h-full backdrop-blur-3xl bg-black/0">
            <div className="w-full h-full flex justify-center items-center p-4">
              <div
                className="max-w-md w-full p-5 md:py-10 space-y-3 md:space-y-5
                           bg-white/10 border-2 border-gray-500/30 rounded-md shadow-xl"
                role="form"
                aria-busy={loading}
              >
                <h1 className="text-center text-4xl font-bold text-gray-950">
                  Xplore Rentals
                </h1>

                <h2 className="text-xl font-medium tracking-tight text-gray-900 md:text-2xl">
                  Sign in to your account
                </h2>

                <form
                  className="space-y-4 md:space-y-6"
                  onSubmit={onSubmit}
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Your email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent outline-none border focus:ring-1 border-gray-500/30
                                 text-gray-900 placeholder:text-gray-700 sm:text-sm rounded-lg
                                 focus:ring-gray-250 focus:border-gray-250 block w-full p-2.5"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent outline-none border focus:ring-1 border-gray-500/30
                                   text-gray-900 placeholder:text-gray-700 sm:text-sm rounded-lg
                                   focus:ring-gray-250 focus:border-gray-250 block w-full p-2.5 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="absolute inset-y-0 right-2 my-auto text-gray-700 text-sm"
                        aria-label={show ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {show ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3">
                    <span />
                    <button
                      type="button"
                      onClick={onForgot}
                      className="text-sm font-medium text-blue-600 hover:underline"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !pass}
                    className="w-full text-white bg-primary hover:bg-gray-150 disabled:opacity-60
                               focus:ring-1 focus:outline-none focus:ring-gray-250 font-semibold
                               rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                  <Link
                    to="/"
                    className="block text-center text-sm text-gray-700 hover:underline"
                  >
                    Back to home
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
