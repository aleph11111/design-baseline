"use client";
import { Component, type ErrorInfo, type ReactNode } from 'react';
import type * as React from 'react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Button } from './button';
import { logger } from '../../utils/logger';
import { BaselineLabelsContext } from '../../lib/labels';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Default-copy overrides, winning over the `BaselineLabelsProvider` preset. */
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static override contextType = BaselineLabelsContext;
  declare context: React.ContextType<typeof BaselineLabelsContext>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('UI Component Error:', error);
    logger.error('Component Stack:', errorInfo.componentStack);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>{this.props.title ?? this.context.errorTitle}</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              {this.props.description ?? (this.state.error?.message || this.context.errorUnexpected)}
            </p>
            <Button onClick={this.resetError} variant="outline">
              {this.props.retryLabel ?? this.context.retry}
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
