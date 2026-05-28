import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LaBanPage } from '@/components/FengShui/LaBanPage';
import { useAuthStore } from '@/stores/authStore';
import { useTuViStore } from '@/stores/tuviStore';

vi.mock('@/hooks/useIsPhone', () => ({
  useIsPhone: () => true,
}));

vi.mock('@/hooks/useCompassSensor', () => ({
  useCompassSensor: () => ({
    headingDeg: null,
    magneticHeadingDeg: null,
    trueHeadingDeg: null,
    accuracyDeg: null,
    permissionState: 'prompt',
    calibrationState: 'unknown',
    source: 'manual',
    supported: true,
    listening: false,
    message: undefined,
    start: vi.fn().mockResolvedValue(true),
    stop: vi.fn(),
  }),
}));

const savedUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  provider: 'email' as const,
  createdAt: '2026-05-27T00:00:00.000Z',
  birthday: '1990-01-01',
  profile: {
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 8,
    birthMinute: 0,
    gender: 'male' as const,
  },
  extendedProfile: {
    birthLocation: {
      lat: 21.028511,
      lng: 105.804817,
      city: 'Hà Nội',
      countryCode: 'VN',
      countryName: 'Việt Nam',
    },
  },
};

beforeEach(() => {
  act(() => {
    useAuthStore.setState({ user: savedUser, isAuthenticated: true, isLoading: false });
    useTuViStore.setState({ chart: null });
  });
});

afterEach(() => {
  act(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    useTuViStore.setState({ chart: null });
  });
});

describe('LaBanPage', () => {
  it('renders the compass surface and controls', () => {
    const { container } = render(
      <MemoryRouter>
        <LaBanPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/La bàn Phong Thủy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hướng thủ công/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Năm xây công trình/i)).toBeInTheDocument();
    expect(screen.getByText('Cảm biến điện thoại')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cho phép cảm biến/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bật la bàn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Dừng/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Bát trạch cá nhân/i)).toBeInTheDocument();
    expect(screen.getByText(/Khảm · Đông Tứ Mệnh/i)).toBeInTheDocument();
    const phiTinhSummary = screen.getByText(/Phi tinh/i, { selector: 'p' });
    expect(phiTinhSummary.closest('details')?.hasAttribute('open')).toBe(false);

    const needleLine = container.querySelector('line[stroke="rgb(212,174,96)"]');
    expect(needleLine?.getAttribute('x1')).toBe('500');
    expect(needleLine?.getAttribute('x2')).toBe('500');
    expect(container.querySelector('line[stroke="rgba(190,18,60,0.72)"]')).toBeNull();

    const circles = Array.from(container.querySelectorAll('circle[cx="500"][cy="500"][r="238"]'));
    const centerRing = circles.find((circle) => circle.getAttribute('stroke') === 'rgba(212,174,96,0.18)');
    expect(centerRing).toBeTruthy();
  });
});
