import { afterEach, describe, expect, it, vi } from 'vitest';
import { cancelSectionScroll, scrollToSection } from '@/lib/navigation';

afterEach(() => { cancelSectionScroll(); vi.restoreAllMocks(); });

describe('anchor navigation', () => {
  it('uses immediate scrolling for reduced motion and focuses the skip-link target', () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ ...matchMedia(query), matches: true }));
    const target = document.createElement('main');
    target.id = 'main-content';
    document.body.append(target);
    vi.mocked(window.scrollTo).mockClear();
    expect(scrollToSection('#main-content')).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    expect(target).toHaveFocus();
    target.remove();
  });

  it('ignores absent targets and external URLs', () => {
    expect(scrollToSection('#missing')).toBe(false);
    expect(scrollToSection('https://example.com')).toBe(false);
  });
});


describe('smooth anchor animation', () => {
  function animationSetup() {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(5000);
    vi.mocked(window.scrollTo).mockClear();
    const target = document.createElement('section');
    target.id = 'animation-target';
    target.style.scrollMarginTop = '20px';
    target.getBoundingClientRect = () => ({ top: 1200 } as DOMRect);
    document.body.append(target);
    return { frames, target };
  }
  it('eases to the target offset and finishes without stacking native smooth scrolling', () => {
    const { frames, target } = animationSetup();
    scrollToSection('#animation-target');
    frames.shift()!(0);
    frames.shift()!(210);
    const middle = vi.mocked(window.scrollTo).mock.calls.at(-1)![0] as ScrollToOptions;
    expect(middle.top).toBeGreaterThan(0);
    expect(middle.top).toBeLessThan(1180);
    frames.shift()!(1000);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1180, behavior: 'instant' });
    target.remove();
  });
  it.each(['wheel', 'touchstart', 'pointerdown'])('lets %s cancel the running animation', event => {
    const { frames, target } = animationSetup();
    scrollToSection('#animation-target');
    frames.shift()!(0);
    window.dispatchEvent(new Event(event));
    const calls = vi.mocked(window.scrollTo).mock.calls.length;
    frames.shift()!(1000);
    expect(window.scrollTo).toHaveBeenCalledTimes(calls);
    target.remove();
  });
});
