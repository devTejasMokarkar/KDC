import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingClient from '@/components/BookingClient';
import { BUSINESS } from '@/lib/business';

vi.mock('@/lib/business', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/business')>(),
  BUSINESS: { whatsappNumber: '919000000001', address: 'Test shop address', openingHours: 'Test hours' },
}));

const openSpy = vi.fn();
type User = ReturnType<typeof userEvent.setup>;
const itemsPanel = () => within(document.getElementById('pricing-panel')!);
const total = () => document.querySelector('.summary-total strong');
const currentStep = () => document.querySelector('.booking-progress [aria-current="step"]');

async function addShirt(user: User) {
  await user.click(screen.getByRole('button', { name: 'Add one Shirt (Wash)' }));
}
async function pickupStep(user: User) {
  await user.click(screen.getByRole('button', { name: /Continue to pickup/ }));
}
async function schedule(user: User) {
  await user.click(within(screen.getByRole('group', { name: 'Preferred date' })).getAllByRole('button')[1]);
  await user.click(screen.getByRole('button', { name: '10:00 am' }));
}
async function checkWadi(user: User) {
  await user.selectOptions(screen.getByLabelText('Pickup locality'), 'wadi');
  await user.type(screen.getByLabelText('PIN code'), '440023');
  await user.click(screen.getByRole('button', { name: 'Check pickup area' }));
}
async function finishDropoff(user: User) {
  await pickupStep(user);
  await user.click(screen.getByRole('radio', { name: 'Shop drop-off' }));
  await schedule(user);
  await user.click(screen.getByRole('button', { name: /Continue to review/ }));
}

describe('guided booking', () => {
  beforeEach(() => {
    BUSINESS.whatsappNumber = '919000000001';
    openSpy.mockClear();
    window.localStorage.clear();
    Object.defineProperty(window, 'open', { configurable: true, writable: true, value: openSpy });
  });

  it('starts at Items and prevents skipping empty or incomplete steps', () => {
    render(<BookingClient />);
    expect(currentStep()).toHaveTextContent('Items');
    expect(screen.getByRole('button', { name: /Continue to pickup/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Pickup details/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Review/ })).toBeDisabled();
    expect(screen.queryByRole('radio', { name: 'Home pickup' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send request on WhatsApp/ })).not.toBeInTheDocument();
  });

  it('lets customers expand the compact order summary and continue from the toolbar', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user);
    const toggle = screen.getByRole('button', { name: /Edit items/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: /Hide items/ })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: /Hide items/ }));
    expect(document.getElementById('order-summary-content')).not.toHaveClass('is-expanded');
    await user.click(screen.getByRole('button', { name: 'Continue →' }));
    expect(currentStep()).toHaveTextContent('Pickup details');
    await user.click(screen.getByRole('radio', { name: 'Shop drop-off' }));
    await schedule(user);
    await user.click(screen.getByRole('button', { name: 'Review →' }));
    expect(currentStep()).toHaveTextContent('Review');
    expect(document.getElementById('order-summary-content')).toHaveClass('is-expanded');
  });

  it('reveals times after choosing a date and keeps optional notes between steps', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await pickupStep(user);
    expect(screen.queryByRole('button', { name: '10:00 am' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Shop drop-off' }));
    await user.click(screen.getByText('Add special instructions (optional)'));
    await user.type(screen.getByLabelText('Special instructions'), 'Please check the collar stain');
    await schedule(user);
    await user.click(screen.getByRole('button', { name: /Continue to review/ }));
    expect(document.querySelector('.review-handover')).toHaveTextContent('Please check the collar stain');
    await user.click(screen.getByRole('button', { name: /Edit pickup details/ }));
    expect(screen.getByText('Special instructions added')).toBeInTheDocument();
    await user.click(screen.getByText('Special instructions added'));
    expect(screen.getByLabelText('Special instructions')).toHaveValue('Please check the collar stain');
  });

  it('honours initial categories and changes category and subcategory', async () => {
    const user = userEvent.setup();
    render(<BookingClient initialCategory="dryclean" />);
    expect(itemsPanel().getByText('Formal Shirt (Dry Clean)')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Wash' }));
    await user.click(screen.getByRole('tab', { name: 'Bottoms' }));
    expect(itemsPanel().getByText('Jeans (Wash)')).toBeInTheDocument();
    expect(itemsPanel().queryByText('Shirt (Wash)')).not.toBeInTheDocument();
  });

  it('searches across item types within the selected service', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await user.type(screen.getByRole('searchbox'), 'Jeans');
    expect(itemsPanel().getByText('Jeans (Wash)')).toBeInTheDocument();
    expect(itemsPanel().queryByText('Shirt (Wash)')).not.toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'not-a-garment');
    expect(screen.getByText(/No matching items/)).toBeInTheDocument();
  });

  it('edits quantities directly in the summary and updates persisted totals', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user);
    const quantity = screen.getByRole('spinbutton', { name: 'Order quantity for Shirt (Wash)' });
    await user.clear(quantity);
    await user.type(quantity, '3');
    expect(total()).toHaveTextContent('₹540');
    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('kdc:cart:v1')!)).toEqual({ 'shirt-wash': 3 });
    await user.click(screen.getByRole('button', { name: 'Decrease order quantity for Shirt (Wash)' }));
    expect(total()).toHaveTextContent('₹360');
  });

  it('caps direct quantity input and never stores an empty draft as a removal', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user);
    const quantity = screen.getByRole('spinbutton', { name: 'Order quantity for Shirt (Wash)' });
    await user.clear(quantity);
    expect(total()).toHaveTextContent('₹180');
    await user.type(quantity, '999');
    expect(quantity).toHaveValue('99');
    expect(screen.getByRole('button', { name: 'Increase order quantity for Shirt (Wash)' })).toBeDisabled();
  });

  it('undoes removal and invalidates the undo when another quantity is edited', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user);
    await user.click(screen.getByRole('button', { name: 'Remove Shirt (Wash) from order' }));
    expect(total()).toHaveTextContent('₹0');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(total()).toHaveTextContent('₹180');
    await user.click(screen.getByRole('button', { name: 'Remove Shirt (Wash) from order' }));
    await user.click(screen.getByRole('button', { name: 'Add one T-Shirt (Wash)' }));
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('requires clear-cart confirmation, supports cancellation, and can undo clearing', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user);
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    expect(screen.getByRole('alertdialog', { name: 'Clear your cart?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep items' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(total()).toHaveTextContent('₹180');
    expect(screen.getByRole('button', { name: 'Clear cart' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    await user.click(screen.getByRole('button', { name: 'Yes, clear cart' }));
    expect(screen.getByRole('button', { name: /Continue to pickup/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(total()).toHaveTextContent('₹180');
  });

  it('restores only valid catalog quantities from storage', () => {
    window.localStorage.setItem('kdc:cart:v1', JSON.stringify({ 'shirt-wash': 2, 'tshirt-wash': -3, unknown: 5 }));
    render(<BookingClient />);
    expect(total()).toHaveTextContent('₹360');
    expect(JSON.parse(window.localStorage.getItem('kdc:cart:v1')!)).toEqual({ 'shirt-wash': 2 });
  });

  it('rejects non-Wadi localities even when the PIN matches and offers drop-off', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await pickupStep(user);
    await user.selectOptions(screen.getByLabelText('Pickup locality'), 'outside');
    await user.type(screen.getByLabelText('PIN code'), '440023');
    await user.click(screen.getByRole('button', { name: 'Check pickup area' }));
    expect(screen.getByText(/Pickup is available only within Wadi/)).toBeInTheDocument();
    await schedule(user);
    await user.type(screen.getByLabelText('Pickup address'), 'Example shop, Nagpur');
    await user.click(screen.getByRole('button', { name: /Continue to review/ }));
    expect(currentStep()).toHaveTextContent('Pickup details');
    expect(screen.queryByRole('button', { name: /Send request/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Choose shop drop-off instead/ }));
    await user.click(screen.getByRole('button', { name: /Continue to review/ }));
    expect(currentStep()).toHaveTextContent('Review');
  });

  it('rejects malformed PINs and requires rechecking after a successful check is changed', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await pickupStep(user);
    await user.click(screen.getByRole('button', { name: 'Check pickup area' }));
    expect(screen.getByText(/Enter a valid 6-digit PIN/)).toBeInTheDocument();
    await checkWadi(user);
    expect(screen.getByText(/Wadi pickup can be requested/)).toBeInTheDocument();
    await user.clear(screen.getByLabelText('PIN code'));
    await user.type(screen.getByLabelText('PIN code'), '440001');
    await user.type(screen.getByLabelText('Pickup address'), 'Example house, Wadi');
    await schedule(user);
    await user.click(screen.getByRole('button', { name: /Continue to review/ }));
    expect(screen.getByText(/Check and confirm a Wadi pickup area/)).toBeInTheDocument();
    expect(currentStep()).toHaveTextContent('Pickup details');
  });

  it('preserves pickup details and items when going Back and completes a Wadi request', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await pickupStep(user); await checkWadi(user);
    await user.type(screen.getByLabelText('Pickup address'), 'Example house, Main Road, Wadi');
    await schedule(user);
    await user.click(screen.getByRole('button', { name: '← Back' }));
    expect(currentStep()).toHaveTextContent('Items');
    await pickupStep(user);
    expect(screen.getByLabelText('Pickup address')).toHaveValue('Example house, Main Road, Wadi');
    expect(screen.getByRole('button', { name: '10:00 am' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /Continue to review/ }));
    await user.click(screen.getByRole('button', { name: 'Send request on WhatsApp' }));
    const [url, target, features] = openSpy.mock.calls[0];
    expect(target).toBe('_blank'); expect(features).toBe('noopener,noreferrer');
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('Wadi, Nagpur · 440023');
    expect(text).toContain('1 x Shirt (Wash) — ₹180');
    expect(text).toContain('Pickup charge: Confirmed by the shop');
    expect(text).toContain('Estimated Total: ₹180');
  });

  it('allows shop drop-off without any pickup address or PIN', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await finishDropoff(user);
    expect(currentStep()).toHaveTextContent('Review');
    expect(screen.getByRole('button', { name: 'Send request on WhatsApp' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Send request on WhatsApp' }));
    const text = decodeURIComponent(openSpy.mock.calls[0][0].split('text=')[1]);
    expect(text).toContain('Collection: Shop drop-off');
    expect(text).toContain('Pickup charge: Not applicable for drop-off');
    expect(text).not.toContain('Pickup address:');
  });

  it('returns to Items if the last item is removed during Review and supports undo', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await finishDropoff(user);
    await user.click(screen.getByRole('button', { name: 'Remove Shirt (Wash) from order' }));
    expect(currentStep()).toHaveTextContent('Items');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: /Review/ })).toBeEnabled();
  });

  it('never opens WhatsApp when the shop contact is not configured', async () => {
    BUSINESS.whatsappNumber = null;
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await finishDropoff(user);
    const send = screen.getByRole('button', { name: 'Send request on WhatsApp' });
    expect(send).toBeDisabled();
    await user.click(send);
    expect(openSpy).not.toHaveBeenCalled();
    expect(screen.getByText(/Online requests are not open yet/)).toBeInTheDocument();
  });

  it('does not reset an available time when the selected date is clicked again', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    await addShirt(user); await pickupStep(user); await schedule(user);
    await user.click(within(screen.getByRole('group', { name: 'Preferred date' })).getAllByRole('button')[1]);
    expect(screen.getByRole('button', { name: '10:00 am' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('uses one keyboard tab stop per service tab list', async () => {
    const user = userEvent.setup();
    render(<BookingClient />);
    const wash = screen.getByRole('tab', { name: 'Wash' }); wash.focus();
    await user.keyboard('{ArrowRight}');
    const iron = screen.getByRole('tab', { name: 'Wash & Iron' });
    expect(iron).toHaveFocus(); expect(iron).toHaveAttribute('tabindex', '0'); expect(wash).toHaveAttribute('tabindex', '-1');
  });
});
