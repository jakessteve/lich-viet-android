import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/appStore';

describe('appStore', () => {
  beforeEach(() => {
    // We can't fully reset without side effects, but we can test state transitions
    localStorage.clear();
  });

  describe('Initial state', () => {
    it('has correct defaults', () => {
      const state = useAppStore.getState();
      expect(state.selectedDate).toBeInstanceOf(Date);
      expect(state.dayData).toBeDefined();
      expect(state.dayData.solarDate).toBeDefined();
      expect(state.isDark).toBe(false);
      expect(state.fontSize).toBe('normal');
    });
  });

  describe('setSelectedDate()', () => {
    it('updates date and dayData', () => {
      const store = useAppStore.getState();
      const newDate = new Date(2024, 1, 10);
      store.setSelectedDate(newDate);

      const state = useAppStore.getState();
      expect(state.selectedDate.getFullYear()).toBe(2024);
      expect(state.selectedDate.getMonth()).toBe(1);
      expect(state.selectedDate.getDate()).toBe(10);
      expect(state.dayData).toBeDefined();
      expect(state.dayData.solarDate).toBe('2024-02-10');
    });

    it('clamps year below 1900', () => {
      const store = useAppStore.getState();
      store.setSelectedDate(new Date(1800, 0, 1));
      const state = useAppStore.getState();
      expect(state.selectedDate.getFullYear()).toBe(1900);
    });

    it('clamps year above 2199', () => {
      const store = useAppStore.getState();
      store.setSelectedDate(new Date(2300, 0, 1));
      const state = useAppStore.getState();
      expect(state.selectedDate.getFullYear()).toBe(2199);
    });
  });

  describe('toggleDarkMode()', () => {
    it('toggles dark mode', () => {
      const store = useAppStore.getState();
      const initialDark = store.isDark;
      store.toggleDarkMode();
      const state = useAppStore.getState();
      expect(state.isDark).toBe(!initialDark);
    });

    it('toggles back to original state', () => {
      const store = useAppStore.getState();
      const initialDark = store.isDark;
      store.toggleDarkMode();
      store.toggleDarkMode();
      const state = useAppStore.getState();
      expect(state.isDark).toBe(initialDark);
    });
  });

  describe('cycleFontSize()', () => {
    it('cycles through font sizes', () => {
      const store = useAppStore.getState();
      store.setFontSizeLevel('small');
      store.cycleFontSize();
      expect(useAppStore.getState().fontSize).toBe('normal');

      store.cycleFontSize();
      expect(useAppStore.getState().fontSize).toBe('large');

      store.cycleFontSize();
      expect(useAppStore.getState().fontSize).toBe('small');
    });
  });

});
