import { describe, it, expect } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileDrawer from '@/components/layout/MobileDrawer';
import { useAuthStore } from '@/stores/authStore';

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

    // Check header and home navigation link
    expect(screen.getByText('LỊCH VIỆT')).toBeInTheDocument();
    expect(screen.getByTitle('Về Trang chủ Lịch Việt')).toBeInTheDocument();

    // Check other groups
    expect(screen.getByText('Âm Lịch')).toBeInTheDocument();
    expect(screen.getByText('Ngày Tốt & Dụng Sự')).toBeInTheDocument();
    expect(screen.getByText('Mai Hoa & Tam Thức')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
    expect(screen.getByText('Nâng cấp tài khoản')).toBeInTheDocument();
  });

  it('hides Nâng cấp tài khoản when user is admin or premium', () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@lichviet.app',
        displayName: 'Admin User',
        accessTier: 'admin',
        provider: 'email',
        createdAt: '2026-01-01',
      },
    });

    render(
      <MemoryRouter initialEntries={['/app/am-lich']}>
        <MobileDrawer isOpen={true} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
    expect(screen.queryByText('Nâng cấp tài khoản')).not.toBeInTheDocument();

    // Reset store
    useAuthStore.setState({ user: null });
  });
});
