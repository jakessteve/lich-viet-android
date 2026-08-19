import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  password_hash: string | null;
  salt: string | null;
  tier: string;
  role: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface DbCalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  calendar_type: string;
  solar_date: string;
  lunar_day: number | null;
  lunar_month: number | null;
  lunar_year: number | null;
  is_leap_month: number | null;
  recurrence: string;
  recurrence_end_date: string | null;
  category: string;
  emoji: string | null;
  color: string | null;
  alarm_offsets_minutes: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export interface DbSyncDelta {
  id: number;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  payload_json: string | null;
  server_updated_at: string;
}

export interface TypedPreparedStatement<T> {
  run(...params: (string | number | boolean | null | undefined)[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: (string | number | boolean | null | undefined)[]): T | undefined;
  all(...params: (string | number | boolean | null | undefined)[]): T[];
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db!: DatabaseSync;
  private initialized = false;

  constructor() {
    this.ensureInit();
  }

  onModuleInit() {
    this.ensureInit();
  }

  private ensureInit() {
    if (this.initialized && this.db) {
      return;
    }

    const isTest = process.env.NODE_ENV === 'test';
    const dbPath = process.env.DATABASE_PATH || (isTest ? ':memory:' : './data/lichviet.db');

    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(dbPath);
    this.initSchema();
    this.initialized = true;
    this.logger.log(`📦 Database initialized successfully at ${dbPath}`);
  }

  onModuleDestroy() {
    try {
      if (this.db) {
        this.db.close();
      }
    } catch {
      // ignore
    }
  }

  private initSchema() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        password_hash TEXT,
        salt TEXT,
        tier TEXT NOT NULL DEFAULT 'free',
        role TEXT NOT NULL DEFAULT 'user',
        provider TEXT NOT NULL DEFAULT 'email',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        calendar_type TEXT NOT NULL DEFAULT 'solar',
        solar_date TEXT NOT NULL,
        lunar_day INTEGER,
        lunar_month INTEGER,
        lunar_year INTEGER,
        is_leap_month INTEGER DEFAULT 0,
        recurrence TEXT NOT NULL DEFAULT 'none',
        recurrence_end_date TEXT,
        category TEXT NOT NULL DEFAULT 'personal',
        emoji TEXT,
        color TEXT,
        alarm_offsets_minutes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON calendar_events(user_id, solar_date);

      CREATE TABLE IF NOT EXISTS sync_deltas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload_json TEXT,
        server_updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sync_deltas_user_time ON sync_deltas(user_id, server_updated_at);
    `);

    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    const adminCheck = this.db.prepare('SELECT id FROM users WHERE email = ?').get('admin@lichviet.app');
    if (!adminCheck) {
      this.db
        .prepare(
          `INSERT INTO users (id, email, name, tier, role, provider, password_hash, salt, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          'seed-admin-lich-viet',
          'admin@lichviet.app',
          'Admin',
          'expert',
          'admin',
          'email',
          'ef00af5081263d0c0e72e3f8b98119303d53edc687c02f8b54e220a6b46973d5',
          'lichviet-admin-seed',
          '2026-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z',
        );
    }

    const demoCheck = this.db.prepare('SELECT id FROM users WHERE email = ?').get('demo@lichviet.local');
    if (!demoCheck) {
      this.db
        .prepare(
          `INSERT INTO users (id, email, name, tier, role, provider, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          'demo-user-001',
          'demo@lichviet.local',
          'Nguyễn Văn Demo',
          'curious',
          'user',
          'email',
          '2026-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z',
        );
    }
  }

  // --- Generic query helpers ---
  prepare<T = Record<string, unknown>>(sql: string): TypedPreparedStatement<T> {
    this.ensureInit();
    return this.db.prepare(sql) as unknown as TypedPreparedStatement<T>;
  }

  exec(sql: string) {
    this.ensureInit();
    return this.db.exec(sql);
  }
}
