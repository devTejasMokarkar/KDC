import { describe, expect, it } from 'vitest';
import {
  SERVICE_CATEGORIES,
  SERVICE_ITEMS,
  SERVICE_SUBCATS,
  TIME_SLOTS,
  formatDateString,
  subsFor,
  toLocalDateString,
} from '@/lib/service-data';

describe('service-data integrity', () => {
  it('has unique item ids', () => {
    const ids = SERVICE_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique category ids matching SERVICE_CATEGORIES', () => {
    const catIds = SERVICE_CATEGORIES as readonly string[];
    expect(new Set(catIds).size).toBe(catIds.length);
  });

  it('only references existing categories', () => {
    const catIds = new Set<string>(SERVICE_CATEGORIES as readonly string[]);
    for (const item of SERVICE_ITEMS) {
      expect(catIds.has(item.main), `unknown main "${item.main}"`).toBe(true);
    }
  });

  it('only references existing subcategories', () => {
    const subIds = new Set<string>(SERVICE_SUBCATS.map((sub) => sub.id));
    for (const item of SERVICE_ITEMS) {
      expect(subIds.has(item.sub), `unknown sub "${item.sub}"`).toBe(true);
    }
  });

  it('has positive prices', () => {
    for (const item of SERVICE_ITEMS) {
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it('has every category covered by at least one item', () => {
    for (const cat of SERVICE_CATEGORIES) {
      expect(SERVICE_ITEMS.some((item) => item.main === cat)).toBe(true);
    }
  });

  it('exposes non-empty time slots', () => {
    expect(TIME_SLOTS.length).toBeGreaterThan(0);
  });
});

describe('subsFor', () => {
  it('returns subcategories ordered by SERVICE_SUBCATS', () => {
    const subs = subsFor('wash');
    const expected = ['tops', 'bottoms', 'ethnic', 'home', 'dress'];
    expect(subs.map((s) => s.id)).toEqual(expected);
  });

  it('returns an empty array for an unknown category', () => {
    expect(subsFor('nope')).toEqual([]);
  });
});

describe('date helpers', () => {
  it('formats a date into a local yyyy-mm-dd string', () => {
    expect(toLocalDateString(new Date(2026, 7, 2))).toBe('2026-08-02');
  });

  it('pads months and days with zeroes', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('round-trips a yyyy-mm-dd string back to a readable date', () => {
    const out = formatDateString('2026-08-02');
    expect(out).toMatch(/^[A-Za-z]{3}, Aug 2$/);
  });
});
