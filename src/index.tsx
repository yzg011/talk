import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import App from "./app";
import "./index.css";

// 简单的错误渲染组件，替代 lark-apaas 的 ErrorRender
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>出错了</h2>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        重试
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={process.env.CLIENT_BASE_PATH || "/"}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
        )}
      >
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
