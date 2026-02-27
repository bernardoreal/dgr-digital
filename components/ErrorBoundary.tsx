import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-8">
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="text-center mb-4">An unexpected error occurred in the application. Please try refreshing the page.</p>
          <details className="bg-white p-4 rounded-lg border border-red-200 w-full max-w-2xl">
            <summary className="font-bold cursor-pointer">Error Details</summary>
            <pre className="mt-2 text-xs text-left whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.state.hasError ? null : this.props.children;
  }
}

export default ErrorBoundary;
