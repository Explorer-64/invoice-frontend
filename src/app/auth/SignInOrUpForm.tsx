import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "./config";
import { firebaseAuth } from "./firebase";

interface Props {
  signInOptions: {
    google?: boolean;
    facebook?: boolean;
    github?: boolean;
    twitter?: boolean;
    emailAndPassword?: boolean;
    magicLink?: boolean;
  };
}

declare const __APP_BASE_PATH__: string;

export const SignInOrUpForm = (props: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const successUrl = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextUrl = searchParams.get("next");
    const otherParams = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (key !== "next") {
        otherParams.append(key, value);
      }
    }
    const url = nextUrl
      ? `${nextUrl}${otherParams.toString() ? `?${otherParams.toString()}` : ""}`
      : `${config.signInSuccessUrl}`;
    return `${__APP_BASE_PATH__}/${url}`.replace(/\/+/g, "/");
  }, []);

  const handleSuccess = useCallback(() => {
    navigate(successUrl, { replace: true });
  }, [navigate, successUrl]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
      await signInWithPopup(firebaseAuth, provider);
      handleSuccess();
    } catch (e: any) {
      if (e.code === "auth/popup-closed-by-user") return;
      if (e.code === "auth/cancelled-popup-request") return;
      setError(e.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  }, [handleSuccess]);

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      }
      handleSuccess();
    } catch (e: any) {
      const messages: Record<string, string> = {
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/invalid-email": "Invalid email address",
        "auth/email-already-in-use": "An account with this email already exists",
        "auth/weak-password": "Password should be at least 6 characters",
        "auth/invalid-credential": "Invalid email or password",
        "auth/too-many-requests": "Too many attempts. Please try again later",
      };
      setError(messages[e.code] || e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, [email, password, isSignUp, handleSuccess]);

  return (
    <div className="max-w-sm mx-auto mt-8 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {props.signInOptions.google && (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      )}

      {props.signInOptions.google && props.signInOptions.emailAndPassword && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
      )}

      {props.signInOptions.emailAndPassword && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
            disabled={loading}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in with email"}
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
          </button>
        </form>
      )}

      {(config.tosLink || config.privacyPolicyLink) && (
        <p className="text-xs text-center text-gray-500 mt-4">
          By signing in, you agree to our{" "}
          {config.tosLink && (
            <a href={config.tosLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Terms of Service
            </a>
          )}
          {config.tosLink && config.privacyPolicyLink && " and "}
          {config.privacyPolicyLink && (
            <a href={config.privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          )}
        </p>
      )}
    </div>
  );
};
