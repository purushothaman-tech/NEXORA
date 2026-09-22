import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, HeartHandshake } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  sectionName?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const section = this.props.sectionName || 'Application';
    console.info(`[ErrorBoundary]\nComponent error caught\nSection: ${section}\nAction: graceful recovery`);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 rounded-3xl bg-amber-50/90 border border-amber-200 text-slate-800 shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-slate-900">
                {this.props.fallbackTitle || 'Service Temporarily Interrupted'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {this.props.fallbackDescription ||
                  'A temporary issue occurred while rendering this service. Your patient intake, queue status, and active records remain safe.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2.5">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span>Refresh Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
