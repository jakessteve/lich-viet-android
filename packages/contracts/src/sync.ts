export type SyncEntityType = 'dam_gio' | 'user_note' | 'calendar_event';
export type SyncAction = 'insert' | 'update' | 'delete';

export interface SyncMutation {
  mutationId: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  payload?: Record<string, unknown> | undefined;
  clientUpdatedAt: string; // ISO 8601 string
}

export interface SyncPushRequest {
  clientWatermark: string; // ISO timestamp
  mutations: SyncMutation[];
}

export interface SyncAck {
  mutationId: string;
  status: 'applied' | 'conflict_resolved' | 'rejected';
  resolvedPayload?: Record<string, unknown> | undefined;
}

export interface ServerDelta {
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  payload?: Record<string, unknown> | undefined;
  serverUpdatedAt: string;
}

export interface SyncPullResponse {
  serverWatermark: string;
  acks: SyncAck[];
  deltas: ServerDelta[];
}
