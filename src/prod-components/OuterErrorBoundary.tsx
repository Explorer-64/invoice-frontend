import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: ReactNode;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 560 }}>
      <h1 style={{ margin: "0 0 8px 0", fontSize: "1.25rem" }}>Something went wrong</h1>
      <p style={{ color: "#666", margin: "0 0 12px 0" }}>Check the browser console (F12) for details.</p>
      <details style={{ fontSize: "0.875rem" }}>
        <summary>Error</summary>
        <pre style={{ overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 4 }}>{error?.message ?? "Unknown"}</pre>
      </details>
    </div>
  );
}

export const OuterErrorBoundary = ({ children }: Props) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ErrorFallback error={error} />}
      onError={(error) => {
        console.error("Caught error in AppWrapper", error.message, error.stack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
