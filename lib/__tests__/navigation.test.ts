import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollToSection } from '@/lib/navigation';

afterEach(() => vi.restoreAllMocks());

describe('anchor navigation', () => {
  it('uses immediate scrolling for reduced motion and focuses the skip-link target', () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ ...matchMedia(query), matches: true }));
    const target = document.createElement('main');
    target.id = 'main-content';
    document.body.append(target);
    const scroll = vi.spyOn(target, 'scrollIntoView');
    expect(scrollToSection('#main-content')).toBe(true);
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(target).toHaveFocus();
    target.remove();
  });

  it('ignores absent targets and external URLs', () => {
    expect(scrollToSection('#missing')).toBe(false);
    expect(scrollToSection('https://example.com')).toBe(false);
  });
});
