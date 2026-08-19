import { Injectable, Inject } from '@nestjs/common';
import { SyncAck, SyncPullResponse, ServerDelta, SyncEntityType, SyncAction } from '@lich-viet/contracts';
import { SyncPushDto } from './dto/sync.dto.js';
import { DatabaseService, DbSyncDelta } from '../../db/database.service.js';
import { CalendarService } from '../calendar/calendar.service.js';

@Injectable()
export class SyncService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(CalendarService) private readonly calendarService: CalendarService,
  ) {}

  async processSync(userId: string, pushData: SyncPushDto): Promise<SyncPullResponse> {
    const acks: SyncAck[] = [];
    const now = new Date().toISOString();

    // 1. Record incoming mutations into sync_deltas table and project to domain entities
    const insertStmt = this.db.prepare(
      `INSERT INTO sync_deltas (user_id, entity_type, entity_id, action, payload_json, server_updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );

    for (const m of pushData.mutations) {
      const payloadJson = m.payload ? JSON.stringify(m.payload) : null;
      insertStmt.run(userId, m.entityType, m.entityId, m.action, payloadJson, now);

      // Project mutation into primary domain tables
      if (m.entityType === 'calendar_event') {
        try {
          if (m.action === 'insert' || m.action === 'update') {
            await this.calendarService.upsertEventFromSync(userId, m.entityId, m.payload);
          } else if (m.action === 'delete') {
            await this.calendarService.deleteEvent(userId, m.entityId);
          }
        } catch {
          // Swallow individual domain projection errors to avoid breaking the sync batch
        }
      }

      acks.push({
        mutationId: m.mutationId,
        status: 'applied',
        resolvedPayload: m.payload,
      });
    }

    // 2. Query deltas for this user since clientWatermark, excluding entities just pushed by this client
    const appliedIds = new Set(pushData.mutations.map((m) => m.entityId));
    const clientWatermark = pushData.clientWatermark || '1970-01-01T00:00:00.000Z';

    const rows = this.db
      .prepare<DbSyncDelta>(
        `SELECT * FROM sync_deltas 
         WHERE user_id = ? AND server_updated_at > ?
         ORDER BY server_updated_at ASC`,
      )
      .all(userId, clientWatermark);

    const deltas: ServerDelta[] = rows
      .filter((r) => !appliedIds.has(r.entity_id))
      .map((r) => {
        let payload: Record<string, unknown> | undefined = undefined;
        if (r.payload_json) {
          try {
            payload = JSON.parse(r.payload_json);
          } catch {
            // ignore
          }
        }

        return {
          entityType: r.entity_type as SyncEntityType,
          entityId: r.entity_id,
          action: r.action as SyncAction,
          payload,
          serverUpdatedAt: r.server_updated_at,
        };
      });

    // 3. Periodic compaction: Prune deltas older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
    try {
      this.db.prepare('DELETE FROM sync_deltas WHERE server_updated_at < ?').run(thirtyDaysAgo);
    } catch {
      // ignore compaction errors
    }

    return {
      serverWatermark: now,
      acks,
      deltas,
    };
  }
}
