import { SignInOrUpForm } from "app"
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress "AuthUI instance is deleted" errors (React Strict Mode issue)
    if (error.message?.includes("AuthUI instance is deleted")) {
      console.warn("AuthUI error caught and suppressed:", error.message);
      this.setState({ hasError: false, error: null });
      return;
    }
    console.error("Login form error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>Login form encountered an error. Please refresh the page.</p>
          <details className="mt-2 text-sm">
            <summary>Error details</summary>
            <pre>{this.state.error.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Login() {
  return (
    <div className="p-4">
      <h1>Welcome to Invoice My Jobs</h1>
      <ErrorBoundary>
        <SignInOrUpForm signInOptions={{ google: true, emailAndPassword: true }} />
      </ErrorBoundary>
    </div>
  );
};