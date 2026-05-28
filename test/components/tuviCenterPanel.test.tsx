import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TuViCenterPanel } from '../../src/components/TuVi/TuViCenterPanel';
import type { TuViCenterInfo } from '../../src/types/tuvi';

const centerInfo: TuViCenterInfo = {
  hoTen: 'Test Person',
  gioiTinh: 'Nam',
  amDuongLabel: 'Dương Nam',
  duongLich: '1990-01-01',
  schoolLabel: 'Thiên Lương',
  amLich: '1/1/1990',
  canChiYear: 'Giáp Tý',
  canChiMonth: 'Ất Sửu',
  canChiDay: 'Bính Dần',
  canChiHour: 'Đinh Mão',
  menhNapAm: 'Hải Trung Kim',
  cuc: 'Thủy Nhị Cục',
  cucNumber: 2,
  saoChuCuc: 'Lộc Tồn',
  menhChu: 'Tử Vi',
  thanChu: 'Thiên Phủ',
  laiNhanCung: 'Quan Lộc',
  nguyenThan: 'Tử Vi',
  menhCung: 'Mệnh cư Tý',
  thanCung: 'Thân cư Dần',
  thanCungLabel: 'Thân cư Tài Bạch',
};

describe('TuViCenterPanel', () => {
  it('shows four birth rows in the center body and keeps the title clean', () => {
    const { container } = render(<TuViCenterPanel centerInfo={centerInfo} />);

    expect(screen.getByRole('heading', { name: 'Test Person' })).toBeTruthy();
    expect(container.querySelector('.tuvi-center-title p')).toBeNull();
    expect(container.querySelector('.tuvi-center-row .tuvi-center-label')?.textContent).toBe('Trường phái');
    expect(screen.getByText('NĂM SINH')).toBeTruthy();
    expect(screen.getByText('Giáp Tý')).toBeTruthy();
    expect(screen.getByText('THÁNG SINH')).toBeTruthy();
    expect(screen.getByText('Ất Sửu')).toBeTruthy();
    expect(screen.getByText('NGÀY SINH')).toBeTruthy();
    expect(screen.getByText('Bính Dần')).toBeTruthy();
    expect(screen.getByText('GIỜ SINH')).toBeTruthy();
    expect(screen.getByText('Đinh Mão')).toBeTruthy();
    expect(screen.getByText('Dương Nam')).toBeTruthy();
  });
});
