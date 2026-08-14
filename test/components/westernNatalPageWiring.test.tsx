import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WesternChartView } from '@/components/Astrology/Western/WesternChartView';
import { WesternMarkdownExport } from '@/components/Astrology/WesternMarkdownExport';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { createWesternNatalFixture } from '../fixtures/westernNatalFixture';

describe('Western natal page wiring', () => {
  afterEach(() => act(() => useAstrologyStore.getState().clearResults()));

  it('shows the normalized standalone chart instead of the legacy Western wheel', () => {
    const fixture = createWesternNatalFixture();
    act(() => useAstrologyStore.setState({
        westernNatalResult: fixture,
        westernResult: fixture.legacyResult,
        isCalculating: false,
        error: null,
      }));

    const { container } = render(<WesternChartView />);

    expect(screen.getByRole('img', { name: /Lá số chiêm tinh Tây phương/i })).not.toBeNull();
    expect(container.querySelector('[data-western-natal-chart]')).not.toBeNull();
    expect(container.querySelector('[data-western-wheel]')).toBeNull();
  });

  it('offers one accessible Western chart download menu while retaining Vedic image export', () => {
    const fixture = createWesternNatalFixture();
    act(() => useAstrologyStore.setState({
        westernNatalResult: fixture,
        westernResult: fixture.legacyResult,
        vedicResult: fixture.legacyResult,
      }));

    const western = render(<WesternMarkdownExport system="western" />);
    const trigger = screen.getByRole('button', { name: /Tải lá số/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('menuitem', { name: /SVG/i })).toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /SVG/i }));
    expect(screen.getByRole('menuitem', { name: /PNG/i })).not.toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: /SVG/i })).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menuitem', { name: /SVG/i })).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole('button', { name: /^Tải ảnh$/i })).toBeNull();
    western.unmount();

    render(<WesternMarkdownExport system="vedic" />);
    expect(screen.getByRole('button', { name: /^Tải ảnh$/i })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Tải lá số/i })).toBeNull();
  });
});
