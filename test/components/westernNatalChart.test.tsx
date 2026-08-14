import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WesternNatalChartDisplay } from '@/components/Astrology/Western/WesternNatalChartDisplay';
import { useAppStore } from '@/stores/appStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { createWesternNatalFixture } from '../fixtures/westernNatalFixture';

describe('WesternNatalChartDisplay', () => {
  afterEach(() => {
    act(() => {
      useAppStore.setState({ isDark: false });
      useAstrologyStore.setState({ westernNatalResult: null });
    });
  });

  it('renders the normalized store result with the live light/dark preference', () => {
    act(() => {
      useAppStore.setState({ isDark: true });
      useAstrologyStore.setState({ westernNatalResult: createWesternNatalFixture() });
    });
    const { container } = render(<WesternNatalChartDisplay />);

    expect(screen.getByRole('img', { name: /Lá số chiêm tinh Tây phương/i })).not.toBeNull();
    expect(container.querySelector('svg')?.getAttribute('data-theme')).toBe('dark');
    expect(container.querySelectorAll('[data-role="object"]')).toHaveLength(20);
    const viewport = container.querySelector('[data-western-chart-viewport]');
    const stage = container.querySelector('[data-western-chart-stage]');
    const svg = container.querySelector('svg');
    expect(viewport?.getAttribute('data-zoom')).toBe('1');
    expect(stage?.getAttribute('style')).toContain('width: 100%');
    expect(svg?.classList.contains('w-full')).toBe(true);
    expect(svg?.classList.contains('h-auto')).toBe(true);
  });

  it('zooms through bounded layout sizes and resets when a new result arrives', () => {
    act(() => useAstrologyStore.setState({ westernNatalResult: createWesternNatalFixture() }));
    const { container } = render(<WesternNatalChartDisplay />);

    const zoomOut = screen.getByRole('button', { name: /Thu nhỏ lá số/i });
    const zoomIn = screen.getByRole('button', { name: /Phóng to lá số/i });
    const fit = screen.getByRole('button', { name: /Vừa màn hình/i });
    expect((zoomOut as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(zoomIn);
    expect(container.querySelector('[data-western-chart-viewport]')?.getAttribute('data-zoom')).toBe('1.25');
    expect(container.querySelector('[data-western-chart-stage]')?.getAttribute('style')).toContain('width: 125%');
    fireEvent.click(fit);
    expect((zoomOut as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector('[data-western-chart-viewport]')?.getAttribute('data-zoom')).toBe('1');

    const replacement = createWesternNatalFixture();
    replacement.birth.utc = '2001-01-01T05:00:00.000Z';
    fireEvent.click(zoomIn);
    act(() => useAstrologyStore.setState({ westernNatalResult: replacement }));
    expect(container.querySelector('[data-western-chart-viewport]')?.getAttribute('data-zoom')).toBe('1');
  });

  it('renders nothing until a normalized result is available', () => {
    const { container } = render(<WesternNatalChartDisplay />);

    expect(container.firstChild).toBeNull();
  });
});
