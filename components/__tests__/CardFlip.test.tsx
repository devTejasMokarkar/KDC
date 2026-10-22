import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardFlip from '@/components/CardFlip';

function setup() {
  const book = vi.fn();
  const user = userEvent.setup();
  const { container } = render(<CardFlip title="Wash" category="wash" subtitle="From ₹100" description="Everyday garment care" features={['Shirts', 'Bedsheets']} onBook={book} />);
  return { book, user, container };
}

describe('responsive service-card flip', () => {
  it('reveals included items and service terms on an explicit click or tap', async () => {
    const { user, container } = setup();
    expect(container.querySelector('.service-card__face--back')).toHaveAttribute('aria-hidden', 'true');
    await user.click(screen.getByRole('button', { name: 'See details for Wash' }));
    expect(container.querySelector('.service-card__faces')).toHaveClass('is-flipped');
    const back = container.querySelector('.service-card__face--back') as HTMLElement;
    expect(back).toHaveAttribute('aria-hidden', 'false');
    expect(within(back).getByText('Bedsheets')).toBeInTheDocument();
    expect(within(back).getByText('Turnaround')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Wash' })).toHaveFocus();
  });

  it('supports keyboard activation, Back, and Escape without losing focus', async () => {
    const { user, container } = setup();
    screen.getByRole('button', { name: 'See details for Wash' }).focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Back to Wash' }));
    expect(screen.getByRole('button', { name: 'See details for Wash' })).toHaveFocus();
    await user.keyboard('{Enter}{Escape}');
    expect(container.querySelector('.service-card__faces')).not.toHaveClass('is-flipped');
    expect(screen.getByRole('button', { name: 'See details for Wash' })).toHaveFocus();
  });

  it('keeps a single booking action usable on either face', async () => {
    const { user, book } = setup();
    await user.click(screen.getByRole('button', { name: 'Book now: Wash' }));
    await user.click(screen.getByRole('button', { name: 'See details for Wash' }));
    expect(screen.getAllByRole('button', { name: 'Book now: Wash' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Book now: Wash' }));
    expect(book).toHaveBeenCalledTimes(2);
  });
});

// jsdom does not supply PointerEvent; preserve the properties used by real gestures.
class TestPointerEvent extends MouseEvent {
  pointerType: string;
  pointerId: number;
  isPrimary: boolean;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
    this.pointerId = init.pointerId ?? 1;
    this.isPrimary = init.isPrimary ?? true;
  }
}

describe('service-card pointer gestures', () => {
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  function gestureSetup() {
    vi.stubGlobal('PointerEvent', TestPointerEvent);
    const result = setup();
    const card = screen.getByRole('article', { name: 'Wash' });
    const surface = result.container.querySelector('.service-card__image') as HTMLElement;
    const faces = result.container.querySelector('.service-card__faces');
    return { ...result, card, surface, faces };
  }

  it('previews on desktop hover without stealing focus or scrolling, and closes on leave', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: query.includes('hover: hover') } as MediaQueryList));
    const { card, faces } = gestureSetup();
    const booking = screen.getByRole('button', { name: 'Book now: Wash' });
    booking.focus();
    const scroll = vi.mocked(Element.prototype.scrollIntoView);
    scroll.mockClear();
    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(faces).toHaveClass('is-flipped');
    expect(booking).toHaveFocus();
    expect(scroll).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Wash' }));
    expect(faces).not.toHaveClass('is-flipped');
    fireEvent.pointerMove(card, { pointerType: 'mouse' });
    expect(faces).not.toHaveClass('is-flipped');
    fireEvent.pointerLeave(card, { pointerType: 'mouse' });
    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(faces).toHaveClass('is-flipped');
    fireEvent.pointerLeave(card, { pointerType: 'mouse' });
    expect(faces).not.toHaveClass('is-flipped');
  });

  it('opens after a touch hold, stays open on release, and suppresses the trailing click', () => {
    const { card, surface, faces, book } = gestureSetup();
    vi.useFakeTimers();
    fireEvent.pointerEnter(card, { pointerType: 'touch' });
    expect(faces).not.toHaveClass('is-flipped');
    fireEvent.pointerDown(surface, { pointerType: 'touch', clientX: 50, clientY: 50 });
    act(() => vi.advanceTimersByTime(400));
    fireEvent.pointerUp(surface, { pointerType: 'touch' });
    expect(faces).toHaveClass('is-flipped');
    fireEvent.click(screen.getByRole('button', { name: 'Book now: Wash' }));
    expect(book).not.toHaveBeenCalled();
    fireEvent.pointerDown(card, { pointerType: 'touch' });
    fireEvent.pointerUp(card, { pointerType: 'touch' });
    fireEvent.click(screen.getByRole('button', { name: 'Back to Wash' }));
    expect(faces).not.toHaveClass('is-flipped');
  });

  it.each(['tap', 'swipe', 'cancel', 'scroll', 'control'])('does not flip on %s', action => {
    const { card, surface, faces } = gestureSetup();
    vi.useFakeTimers();
    const target = action === 'control' ? screen.getByRole('button', { name: 'Book now: Wash' }) : surface;
    fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 50, clientY: 50 });
    if (action === 'tap') fireEvent.pointerUp(target, { pointerType: 'touch' });
    if (action === 'swipe') fireEvent.pointerMove(card, { pointerType: 'touch', clientX: 50, clientY: 70 });
    if (action === 'cancel') fireEvent.pointerCancel(card, { pointerType: 'touch' });
    if (action === 'scroll') fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(500));
    expect(faces).not.toHaveClass('is-flipped');
  });
});
