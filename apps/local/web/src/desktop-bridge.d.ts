import type { PtlDesktopBridge } from './desktop-config';

declare global {
  interface Window {
    ptlDesktop?: PtlDesktopBridge;
  }
}

export {};
