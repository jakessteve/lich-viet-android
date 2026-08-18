import { Injectable } from '@nestjs/common';
import { SyncAck, SyncPullResponse, ServerDelta, SyncEntityType, SyncAction } from '@lich-viet/contracts';
import { SyncPushDto } from './dto/sync.dto.js';

interface StoredServerDelta {
  userId: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  payload?: Record<string, unknown>;
  serverUpdatedAt: string;
}

@Injectable()
export class SyncService {
  private serverDeltas: StoredServerDelta[] = [];

  async processSync(userId: string, pushData: SyncPushDto): Promise<SyncPullResponse> {
    const acks: SyncAck[] = [];
    const now = new Date().toISOString();

    for (const m of pushData.mutations) {
      // Record server delta
      this.serverDeltas.push({
        userId,
        entityType: m.entityType,
        entityId: m.entityId,
        action: m.action,
        payload: m.payload,
        serverUpdatedAt: now,
      });

      acks.push({
        mutationId: m.mutationId,
        status: 'applied',
        resolvedPayload: m.payload,
      });
    }

    // Pull deltas from other sessions/devices since clientWatermark
    const clientTimestamp = new Date(pushData.clientWatermark).getTime();
    const appliedIds = new Set(pushData.mutations.map((m) => m.entityId));

    const deltas: ServerDelta[] = this.serverDeltas
      .filter((d) => {
        if (d.userId !== userId) return false;
        if (appliedIds.has(d.entityId)) return false;
        const deltaTimestamp = new Date(d.serverUpdatedAt).getTime();
        return isNaN(clientTimestamp) || deltaTimestamp > clientTimestamp;
      })
      .map((d) => ({
        entityType: d.entityType,
        entityId: d.entityId,
        action: d.action,
        payload: d.payload,
        serverUpdatedAt: d.serverUpdatedAt,
      }));

    return {
      serverWatermark: now,
      acks,
      deltas,
    };
  }
}
