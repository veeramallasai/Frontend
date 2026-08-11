import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React rendering error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-12 flex flex-col items-center justify-center text-center space-y-3">
          <h2 className="text-xl font-black text-slate-800">Something went wrong</h2>
          <p className="text-xs text-slate-500">Please refresh the page or try again.</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-6 py-2.5 rounded-xl bg-[#009b5a] text-white text-xs font-black shadow-md cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
