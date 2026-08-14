import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WesternNatalTechnicalDisplay } from '@/components/Astrology/Western/WesternNatalTechnicalDisplay';
import { createWesternNatalFixture } from '../fixtures/westernNatalFixture';

describe('WesternNatalTechnicalDisplay', () => {
  it('shows the complete normalized technical contract', () => {
    const result = createWesternNatalFixture();
    result.aspects = Array.from({ length: 15 }, (_, index) => ({
      ...result.aspects[index % result.aspects.length],
      objectBId: `${result.aspects[index % result.aspects.length].objectBId}-${index}`,
    }));
    const { container } = render(<WesternNatalTechnicalDisplay result={result} />);

    const disclosure = screen.getByRole('button', { name: /Dữ liệu kỹ thuật/i });
    expect(disclosure.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelectorAll('[data-technical-object]')).toHaveLength(0);
    fireEvent.click(disclosure);
    expect(disclosure.getAttribute('aria-expanded')).toBe('true');

    expect(container.querySelectorAll('[data-technical-object]')).toHaveLength(20);
    expect(container.querySelectorAll('[data-technical-house]')).toHaveLength(12);
    expect(container.querySelectorAll('[data-technical-angle]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-technical-aspect]')).toHaveLength(12);
    expect(container.textContent).toContain('2451544.708333');
    expect(container.textContent).toContain('fixed-utc-offset-v1');
    expect(container.textContent).toContain('western-natal-20-v1');
    expect(container.textContent).toContain('258');
    expect(container.querySelector('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Xem tất cả/i }));
    expect(container.querySelectorAll('[data-technical-aspect]')).toHaveLength(result.aspects.length);
    expect(screen.getByRole('button', { name: /Thu gọn góc chiếu/i })).not.toBeNull();
  });
});
