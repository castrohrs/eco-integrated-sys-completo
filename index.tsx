import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './hooks/useAppStore';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import './styles/theme.css';

// --- EMERGENCY ERROR BOUNDARY ---
// Isso impede que o app fique em tela branca se houver erro de script

// FIX: Define explicit interfaces for Props and State to resolve 'state' and 'props' visibility issues and required children errors
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// FIX: Use explicit Component extension with generic parameters from react to ensure 'state' and 'props' are correctly typed and visible
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Initialize state as a class property to ensure proper type inference and resolve missing property errors
  state: ErrorBoundaryState = { hasError: false, error: null };
  // FIX: Explicitly declare props to ensure visibility in environments with inheritance inference issues, matching the state fix above
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // FIX: Initialize props property to satisfy local declaration if inheritance is failing to provide it
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // FIX: Correctly typed static lifecycle method
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
  }

  render() {
    // FIX: Accessing this.state now works correctly because the class properly extends typed Component
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          background: '#0f172a', 
          color: '#ef4444', 
          height: '100vh', 
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️ FALHA DE INICIALIZAÇÃO DO SISTEMA</h1>
          <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>Ocorreu um erro crítico que impediu a montagem do React.</p>
          <pre style={{ 
            background: '#1e293b', 
            padding: '20px', 
            borderRadius: '8px', 
            maxWidth: '800px', 
            overflow: 'auto',
            border: '1px solid #ef4444' 
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            REINICIAR SISTEMA (F5)
          </button>
        </div>
      );
    }

    // FIX: Access this.props directly as it is correctly inherited from Component<ErrorBoundaryProps, ErrorBoundaryState>
    return this.props.children || null;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("FATAL: Elemento 'root' não encontrado no HTML.");
}

const root = ReactDOM.createRoot(rootElement);

// Montagem protegida
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);