import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { FallbackPlanet } from './ModelFit';

type Props = {
  children: ReactNode;
  fallbackColor?: string;
  fallbackSize?: number;
};

/** Isolate a single GLB so one bad/heavy model cannot blank the whole scene. */
export function SafeModel({ children, fallbackColor = '#8899aa', fallbackSize = 1 }: Props) {
  return (
    <ErrorBoundary fallback={<FallbackPlanet color={fallbackColor} size={fallbackSize} />}>
      <Suspense fallback={<FallbackPlanet color={fallbackColor} size={fallbackSize} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
