import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingClient from '@/components/BookingClient';

const openSpy = vi.fn();

function findBtnIn(container: HTMLElement, selector: string, index: number) {
  return container.querySelectorAll<HTMLButtonElement>(selector)[index];
}

describe('BookingClient', () => {
  beforeEach(() => {
    openSpy.mockClear();
    Object.defineProperty(window, 'open', {
      writable: true,
      configurable: true,
      value: openSpy,
    });
  });

  it('renders the default Wash category with its items', () => {
    const { container } = render(<BookingClient />);
    expect(screen.getByText('T-Shirt (Wash)')).toBeInTheDocument();
    expect(screen.getByText('Shirt (Wash)')).toBeInTheDocument();
    expect(container.querySelector('.svc-tab.active')).toHaveTextContent('Wash');
  });

  it('respects the initialCategory prop', () => {
    render(<BookingClient initialCategory="dryclean" />);
    expect(screen.getByText('Formal Shirt (Dry Clean)')).toBeInTheDocument();
    const activeTab = document.querySelector('.svc-tab.active');
    expect(activeTab).toHaveTextContent('Dry Clean');
  });

  it('switches category tabs and resets the active subcategory', async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingClient />);
    expect(screen.getByText('T-Shirt (Wash)')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Dry Clean' }));
    expect(screen.getByText('Formal Shirt (Dry Clean)')).toBeInTheDocument();
    expect(screen.queryByText('T-Shirt (Wash)')).not.toBeInTheDocument();

    const activeSub = container.querySelector('.svc-subtab.active');
    expect(activeSub).toHaveTextContent('Tops & Shirts');
  });

  it('switches subcategory and filters items', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await user.click(screen.getByRole('tab', { name: 'Bottoms' }));
    expect(screen.getByText('Jeans (Wash)')).toBeInTheDocument();
    expect(screen.queryByText('T-Shirt (Wash)')).not.toBeInTheDocument();
  });

  it('adds and removes quantities and updates the total', async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingClient />);
    const total = () => container.querySelector('.summary-total strong');

    await user.click(screen.getByRole('button', { name: 'Add one T-Shirt (Wash)' }));
    expect(total()).toHaveTextContent('₹200');
    expect(screen.getByText('1 items')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add one T-Shirt (Wash)' }));
    expect(total()).toHaveTextContent('₹400');
    expect(screen.getByText('2 items')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove one T-Shirt (Wash)' }));
    expect(total()).toHaveTextContent('₹200');
    expect(screen.getByText('1 items')).toBeInTheDocument();
  });

  it('removes an item from the order summary', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);

    await user.click(screen.getByRole('button', { name: 'Add one Shirt (Wash)' }));
    expect(screen.getByText('1 items')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Shirt (Wash) from order' }));
    expect(screen.queryByText('1 items')).not.toBeInTheDocument();
    expect(screen.getByText('0 items')).toBeInTheDocument();
    expect(screen.getByText('Add items to build your order.')).toBeInTheDocument();
  });

  it('disables confirm until an item, date, and time are selected', async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingClient />);
    const confirm = screen.getByRole('button', { name: /Confirm Booking on WhatsApp/ });

    expect(confirm).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add one T-Shirt (Wash)' }));
    expect(confirm).toBeDisabled();

    await user.click(findBtnIn(container, '.date-grid button', 0));
    expect(confirm).toBeDisabled();

    await user.click(findBtnIn(container, '.time-grid button', 0));
    expect(confirm).toBeEnabled();
  });

  it('opens WhatsApp with a message summarising the order', async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingClient />);

    await user.click(screen.getByRole('button', { name: 'Add one T-Shirt (Wash)' }));
    await user.click(screen.getByRole('button', { name: 'Add one Shirt (Wash)' }));
    await user.click(findBtnIn(container, '.date-grid button', 0));
    await user.click(findBtnIn(container, '.time-grid button', 0));

    await user.click(screen.getByRole('button', { name: /Confirm Booking on WhatsApp/ }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target, features] = openSpy.mock.calls[0];
    expect(url).toContain('https://wa.me/919876543210?text=');
    expect(target).toBe('_blank');
    expect(features).toBe('noopener,noreferrer');

    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('Collection: Home collection');
    expect(text).toContain('1 x T-Shirt (Wash) — ₹200');
    expect(text).toContain('1 x Shirt (Wash) — ₹180');
    expect(text).toContain('Estimated Total: ₹380');
  });

  it('shows selected date and time in the summary', async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingClient />);

    await user.click(findBtnIn(container, '.date-grid button', 0));
    await user.click(findBtnIn(container, '.time-grid button', 2));

    const datetime = container.querySelectorAll('.summary-details__row strong')[1];
    expect(datetime).toHaveTextContent(/12:00 pm/);
  });
});
