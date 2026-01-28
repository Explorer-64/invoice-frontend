import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import * as React from "react";
import { useMemo, useRef, useEffect, useState } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
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

const constructSignInOptions = (signInOptions: Props["signInOptions"]) => {
  const options: firebaseui.auth.Config["signInOptions"] = [];

  if (signInOptions.google) {
    options.push(GoogleAuthProvider.PROVIDER_ID);
  }

  if (signInOptions.facebook) {
    options.push(FacebookAuthProvider.PROVIDER_ID);
  }

  if (signInOptions.github) {
    options.push(GithubAuthProvider.PROVIDER_ID);
  }

  if (signInOptions.twitter) {
    options.push(TwitterAuthProvider.PROVIDER_ID);
  }

  if (signInOptions.emailAndPassword) {
    options.push(EmailAuthProvider.PROVIDER_ID);
  }

  if (signInOptions.magicLink) {
    options.push(EmailAuthProvider.PROVIDER_ID);
  }

  return options;
};

declare const __APP_BASE_PATH__: string;

export const SignInOrUpForm = (props: Props) => {
  const [mounted, setMounted] = useState(false);

  // Small delay to ensure Firebase is fully initialized before rendering AuthUI
  // This helps avoid React Strict Mode double-render issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const signInOptions = useMemo(
    () => constructSignInOptions(props.signInOptions),
    [props.signInOptions],
  );

  const signInSuccessUrl = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextUrl = searchParams.get("next");
    const otherParams = new URLSearchParams();

    for (const [key, value] of searchParams.entries()) {
      if (key !== "next") {
        otherParams.append(key, value);
      }
    }

    const successUrl = nextUrl
      ? `${nextUrl}${otherParams.toString() ? `?${otherParams.toString()}` : ""}`
      : `${config.signInSuccessUrl}`;

    return `${__APP_BASE_PATH__}/${successUrl}`.replace(/\/+/g, "/");
  }, []);

  const openPrivacyPolicyUrl = config.privacyPolicyLink
    ? () => {
        const privacyPolicyLink = config.privacyPolicyLink?.startsWith("/")
          ? `${__APP_BASE_PATH__}/${config.privacyPolicyLink}`
          : config.privacyPolicyLink;

        window.open(privacyPolicyLink, "_blank");
      }
    : undefined;

  const openTosUrl = config.tosLink
    ? () => {
        const tosLink = config.tosLink?.startsWith("/")
          ? `${__APP_BASE_PATH__}/${config.tosLink}`
          : config.tosLink;

        window.open(tosLink, "_blank");
      }
    : undefined;

  // Add error boundary for AuthUI errors (common in React Strict Mode)
  const uiConfig = useMemo(() => ({
    signInFlow: "popup" as const,
    autoUpgradeAnonymousUsers: true,
    signInOptions,
    signInSuccessUrl,
    siteName: config.siteName,
    tosUrl: openTosUrl,
    privacyPolicyUrl: openPrivacyPolicyUrl,
    callbacks: {
      signInFailure: (error: Error) => {
        // Suppress "AuthUI instance is deleted" error in development (React Strict Mode issue)
        if (error.message?.includes("AuthUI instance is deleted")) {
          console.warn("AuthUI error suppressed (React Strict Mode):", error.message);
          return;
        }
        throw error;
      },
    },
  }), [signInOptions, signInSuccessUrl, openPrivacyPolicyUrl, openTosUrl]);

  if (!mounted) {
    return <div>Loading login form...</div>;
  }

  return (
    <div id="firebase-auth-container">
      <StyledFirebaseAuth
        key="firebase-auth-ui" // Force remount to handle Strict Mode
        firebaseAuth={firebaseAuth}
        uiConfig={uiConfig}
      />
    </div>
  );
};
