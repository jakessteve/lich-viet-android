import { describe, it, expect } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileDrawer from '@/components/layout/MobileDrawer';

describe('MobileDrawer Component', () => {
  it('renders all separate astrology sub-items when opened via custom event', () => {
    render(
      <MemoryRouter initialEntries={['/app/am-lich']}>
        <MobileDrawer />
      </MemoryRouter>,
    );

    // Trigger open event inside act
    act(() => {
      document.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
    });

    // Check header
    expect(screen.getByText('LỊCH VIỆT')).toBeInTheDocument();

    // Check Group 2 separate items
    expect(screen.getByText('Tử Vi')).toBeInTheDocument();
    expect(screen.getByText('Chiêm Tinh Tây Phương')).toBeInTheDocument();
    expect(screen.getByText('Chiêm Tinh Ấn Độ (Vedic)')).toBeInTheDocument();
    expect(screen.getByText('Hợp Lá Số (Synastry)')).toBeInTheDocument();

    // Check Home item
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Giới thiệu & Tổng quan Lịch Việt')).toBeInTheDocument();

    // Check other groups
    expect(screen.getByText('Âm lịch')).toBeInTheDocument();
    expect(screen.getByText('Ngày Tốt')).toBeInTheDocument();
    expect(screen.getByText('Gieo quẻ')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
  });
});
