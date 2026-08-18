import { RuntimeContext } from './index.js';
import { createDemoRuntime } from './demo/index.js';
import { createRemoteRuntime } from './remote/index.js';

let activeRuntime: RuntimeContext | null = null;

export function getRuntime(): RuntimeContext {
  if (!activeRuntime) {
    const isRemote = typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_RUNTIME === 'remote';
    activeRuntime = isRemote ? createRemoteRuntime() : createDemoRuntime();
  }
  return activeRuntime;
}

export function setRuntime(runtime: RuntimeContext | null): void {
  activeRuntime = runtime;
}
