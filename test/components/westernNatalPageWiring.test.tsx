import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WesternChartView } from '@/components/Astrology/Western/WesternChartView';
import { WesternMarkdownExport } from '@/components/Astrology/WesternMarkdownExport';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { createWesternNatalFixture } from '../fixtures/westernNatalFixture';

describe('Western natal page wiring', () => {
  afterEach(() => act(() => useAstrologyStore.getState().clearResults()));

  it('shows the normalized standalone chart instead of the legacy Western wheel', () => {
    const fixture = createWesternNatalFixture();
    act(() =>
      useAstrologyStore.setState({
        westernNatalResult: fixture,
        westernResult: fixture.legacyResult,
        isCalculating: false,
        error: null,
      }),
    );

    const { container } = render(<WesternChartView />);

    expect(screen.getByRole('img', { name: /Lá số chiêm tinh Tây phương/i })).not.toBeNull();
    expect(container.querySelector('[data-western-natal-chart]')).not.toBeNull();
    expect(container.querySelector('[data-western-wheel]')).toBeNull();
  });

  it('offers accessible Markdown copy button for Western and Vedic systems', () => {
    const fixture = createWesternNatalFixture();
    act(() =>
      useAstrologyStore.setState({
        westernNatalResult: fixture,
        westernResult: fixture.legacyResult,
        vedicResult: fixture.legacyResult,
      }),
    );

    const western = render(<WesternMarkdownExport system="western" />);
    expect(screen.getByRole('button', { name: /Sao chép/i })).not.toBeNull();
    western.unmount();

    render(<WesternMarkdownExport system="vedic" />);
    expect(screen.getByRole('button', { name: /Sao chép/i })).not.toBeNull();
  });

  it('renders Copy Markdown button inside WesternNatalChartDisplay and VedicChartDisplay', async () => {
    const fixture = createWesternNatalFixture();
    act(() =>
      useAstrologyStore.setState({
        westernNatalResult: fixture,
        westernResult: fixture.legacyResult,
        vedicResult: fixture.legacyResult,
        isCalculating: false,
        error: null,
      }),
    );

    const { WesternNatalChartDisplay } = await import('@/components/Astrology/Western/WesternNatalChartDisplay');
    const { VedicChartDisplay } = await import('@/components/Astrology/Vedic/VedicChartDisplay');

    const westernDisplay = render(<WesternNatalChartDisplay />);
    expect(screen.getByRole('button', { name: /Sao chép Luận Giải \(Markdown\)/i })).not.toBeNull();
    westernDisplay.unmount();

    const vedicDisplay = render(<VedicChartDisplay result={fixture.legacyResult} />);
    expect(screen.getByRole('button', { name: /Sao chép Luận Giải \(Markdown\)/i })).not.toBeNull();
    vedicDisplay.unmount();
  });
});

