import type { ReactNode } from 'react';
import { FeedbackProvider } from '../feedback';

export function AppProviders({ children }: { children: ReactNode }) {
  return <FeedbackProvider>{children}</FeedbackProvider>;
}
