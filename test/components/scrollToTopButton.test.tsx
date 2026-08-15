import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollToTopButton } from '../../src/components/shared/ScrollToTopButton';
import { useAppStore } from '../../src/stores/appStore';

describe('ScrollToTopButton Component', () => {
  let scrollListeners: Array<() => void> = [];

  beforeEach(() => {
    useAppStore.setState({ showScrollToTopButton: true });
    scrollListeners = [];
    window.scrollTo = vi.fn();
    window.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'scroll') scrollListeners.push(handler);
    }) as any;
    window.removeEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'scroll') {
        scrollListeners = scrollListeners.filter(l => l !== handler);
      }
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when scroll position is at the top', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    const { container } = render(<ScrollToTopButton threshold={300} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders button and scrolls smoothly to top on click when scrolled past threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTopButton threshold={300} />);

    // Trigger scroll event
    scrollListeners.forEach((fn) => fn());

    const button = screen.getByRole('button', { name: /cuộn lên đầu trang/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('does not render when user disabled the setting in appStore', () => {
    useAppStore.setState({ showScrollToTopButton: false });
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    const { container } = render(<ScrollToTopButton threshold={300} />);
    expect(container.firstChild).toBeNull();
  });
});
