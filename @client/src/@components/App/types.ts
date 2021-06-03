export type Mode =
  | { type: 'initializing' }
  | { type: 'private' }
  | { type: 'host' }
  | { type: 'client' }
  | { type: 'disconnected' }
  | { type: 'error', text: string };
