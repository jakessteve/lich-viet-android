import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GieoQueView from '@/components/GieoQue/GieoQueView';
import { ensureHexagramsLoaded } from '@/utils/maiHoaEngine';
import { synthesizeTamThuc } from '@/utils/tamThucSynthesis';

describe('Gieo Quẻ (Mai Hoa & Tam Thức) E2E User Flow', () => {
  beforeAll(async () => {
    await ensureHexagramsLoaded();
  });

  it('renders Gieo Quẻ view with both Mai Hoa and Tam Thức tabs', async () => {
    render(
      <MemoryRouter initialEntries={['/app/gieo-que']}>
        <GieoQueView />
      </MemoryRouter>
    );

    // Both tabs present
    expect(screen.getByRole('tab', { name: /Mai Hoa/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tam Thức/i })).toBeInTheDocument();
  });

  it('navigates directly to Tam Thức method via ?method=tam-thuc deep link', async () => {
    render(
      <MemoryRouter initialEntries={['/app/gieo-que?method=tam-thuc']}>
        <GieoQueView />
      </MemoryRouter>
    );

    // Tam Thức tab is active
    const tamThucTab = screen.getByRole('tab', { name: /Tam Thức/i });
    expect(tamThucTab).toHaveAttribute('data-state', 'active');
  });

  it('completes full Tam Thức synthesis end-to-end', () => {
    const testDate = new Date(2025, 5, 15, 10, 30);
    const synthesis = synthesizeTamThuc(testDate, 4); // Thìn hour

    expect(synthesis).toBeDefined();
    expect(synthesis.methods.qmdj).toBeDefined();
    expect(synthesis.methods.lucNham).toBeDefined();
    expect(synthesis.methods.thaiAt).toBeDefined();

    // Verify QMDJ details
    expect(synthesis.methods.qmdj.name).toContain('Kỳ Môn');
    expect(['cat', 'hung', 'trungBinh']).toContain(synthesis.methods.qmdj.verdict);

    // Verify Lục Nhâm details
    expect(synthesis.methods.lucNham.name).toContain('Lục Nhâm');
    expect(['cat', 'hung', 'trungBinh']).toContain(synthesis.methods.lucNham.verdict);

    // Verify Thái Ất details
    expect(synthesis.methods.thaiAt.name).toContain('Thái Ất');
    expect(['cat', 'hung', 'trungBinh']).toContain(synthesis.methods.thaiAt.verdict);

    // Combined consensus agreement
    expect(synthesis.agreementCount).toBeGreaterThanOrEqual(1);
    expect(synthesis.combinedLabel).toBeDefined();
    expect(synthesis.narrative.length).toBeGreaterThan(10);
  });
});
