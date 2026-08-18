import { Injectable, NotFoundException } from '@nestjs/common';
import { DamGioRecord } from '@lich-viet/contracts';
import { CreateDamGioDto, UpdateDamGioDto } from './dto/dam-gio.dto.js';

@Injectable()
export class DamGioService {
  private records: Map<string, DamGioRecord> = new Map();

  constructor() {
    // Seed initial records for testing
    this.createDamGio('demo-user-001', {
      deceasedName: 'Cụ Tổ Khởi Nghiệp',
      relationship: 'Cụ Ông',
      lunarDay: 15,
      lunarMonth: 7,
      isLeapMonth: false,
      notes: 'Lễ cúng Vu Lan và tảo mộ',
      alarmLeadDays: [1, 3],
    });
  }

  async listDamGio(userId: string): Promise<DamGioRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.userId === userId || userId === 'demo-user-001');
  }

  async createDamGio(userId: string, dto: CreateDamGioDto): Promise<DamGioRecord> {
    const id = `dg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const record: DamGioRecord = {
      id,
      userId,
      deceasedName: dto.deceasedName,
      relationship: dto.relationship,
      lunarDay: dto.lunarDay,
      lunarMonth: dto.lunarMonth,
      isLeapMonth: dto.isLeapMonth ?? false,
      notes: dto.notes,
      alarmLeadDays: dto.alarmLeadDays ?? [1],
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(id, record);
    return record;
  }

  async updateDamGio(userId: string, id: string, dto: UpdateDamGioDto): Promise<DamGioRecord> {
    const record = this.records.get(id);
    if (!record) {
      throw new NotFoundException(`Đám Giỗ record #${id} not found`);
    }

    const updated: DamGioRecord = {
      ...record,
      ...(dto.deceasedName !== undefined ? { deceasedName: dto.deceasedName } : {}),
      ...(dto.relationship !== undefined ? { relationship: dto.relationship } : {}),
      ...(dto.lunarDay !== undefined ? { lunarDay: dto.lunarDay } : {}),
      ...(dto.lunarMonth !== undefined ? { lunarMonth: dto.lunarMonth } : {}),
      ...(dto.isLeapMonth !== undefined ? { isLeapMonth: dto.isLeapMonth } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      ...(dto.alarmLeadDays !== undefined ? { alarmLeadDays: dto.alarmLeadDays } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.records.set(id, updated);
    return updated;
  }

  async deleteDamGio(userId: string, id: string): Promise<void> {
    if (!this.records.has(id)) {
      throw new NotFoundException(`Đám Giỗ record #${id} not found`);
    }
    this.records.delete(id);
  }
}
