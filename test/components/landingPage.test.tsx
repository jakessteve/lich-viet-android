import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '@/components/pages/LandingPage';
import MoonPhaseSVG from '@/components/pages/LandingPage/MoonPhaseSVG';

describe('LandingPage Component', () => {
  it('renders all 5 core features and updated stats', { timeout: 15000 }, () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // Check heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Check 5 core features are rendered in the grid
    expect(screen.getByRole('heading', { name: 'Âm Lịch' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ngày Tốt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tử Vi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chiêm Tinh' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gieo Quẻ' })).toBeInTheDocument();

    // Check CTA button
    expect(screen.getByRole('button', { name: /Trải nghiệm ngay/i })).toBeInTheDocument();
  });
});

describe('MoonPhaseSVG Component', () => {
  it('renders a full moon circle on lunar day 15', () => {
    const { container } = render(<MoonPhaseSVG lunarDay={15} />);
    const circles = container.querySelectorAll('circle');
    // Glow circle, dark base circle, and full illuminated circle
    expect(circles.length).toBeGreaterThanOrEqual(2);
    // Should have moonSurface circle when full
    const surfaceCircle = Array.from(circles).find((c) => c.getAttribute('fill') === 'url(#moonSurface)');
    expect(surfaceCircle).toBeTruthy();
  });

  it('renders crescent/gibbous path for intermediate lunar days', () => {
    const { container } = render(<MoonPhaseSVG lunarDay={8} />);
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('fill')).toBe('url(#moonSurface)');
  });
});
