import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import { BUSINESS } from '@/lib/business';

vi.mock('@/lib/business', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/business')>(),
  BUSINESS: { ...((await importOriginal<typeof import('@/lib/business')>()).BUSINESS), phoneE164: null, whatsappNumber: null, email: null, address: null, openingHours: null, mapsUrl: null, mapsEmbedUrl: null },
}));

const location = window.location as { href: string };

describe('HomePage', () => {
  beforeEach(() => {
    BUSINESS.mapsUrl = null; BUSINESS.mapsEmbedUrl = null;
    location.href = 'http://localhost/';
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the main page sections', () => {
    render(<HomePage />);

    expect(document.getElementById('the-process')).toBeInTheDocument();
    expect(document.getElementById('services')).toBeInTheDocument();
    expect(document.getElementById('testimonials')).toBeInTheDocument();
    expect(document.getElementById('fabric-care')).toBeInTheDocument();
    expect(document.getElementById('contact-us')).toBeInTheDocument();
    expect(document.getElementById('book')).toBeInTheDocument();
  });

  it('places the compact care section between services and booking', () => {
    render(<HomePage />);
    const sections = Array.from(document.querySelectorAll('main > section')).map(section => section.id);
    expect(sections.indexOf('fabric-care')).toBeGreaterThan(sections.indexOf('services'));
    expect(sections.indexOf('fabric-care')).toBeLessThan(sections.indexOf('book'));
    expect(document.querySelector('.care-more')).not.toHaveAttribute('open');
  });

  it('renders all service categories', () => {
    render(<HomePage />);

    for (const label of ['Wash', 'Wash & Iron', 'Dry Clean', 'Colour Restore', 'Rafoo (Mending)', 'Home & Bedding']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('scrolls to the booking section and preselects the category on a service card click', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: 'Book now: Dry Clean' }));

    expect(location.href).toBe('http://localhost/');
    const activeTab = document.querySelector('#book .svc-tab.active');
    expect(activeTab).toHaveTextContent('Dry Clean');
  });

  it('preselects the category when a service card is activated by keyboard', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const card = screen.getByRole('button', { name: 'Book now: Wash' });
    card.focus();
    await user.keyboard('{Enter}');

    const activeTab = document.querySelector('#book .svc-tab.active');
    expect(activeTab).toHaveTextContent('Wash');
  });

  it('opens bedding prices from another category and supports selecting the card again', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: 'Book now: Dry Clean' }));
    await user.click(screen.getByRole('button', { name: 'Book now: Home & Bedding' }));
    expect(screen.getByRole('tab', { name: 'Wash' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Home & Bedding' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('spinbutton', { name: 'Quantity for Bedsheet (Wash)' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Tops & Shirts' }));
    await user.click(screen.getByRole('button', { name: 'Book now: Home & Bedding' }));
    expect(screen.getByRole('tab', { name: 'Home & Bedding' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'Book now: Wash' }));
    expect(screen.getByRole('tab', { name: 'Tops & Shirts' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not display sample contacts, reviews, or an unconfigured map', () => {
    render(<HomePage />);
    expect(screen.queryByText(/98765 43210/)).not.toBeInTheDocument();
    expect(screen.queryByText('4.8/5')).not.toBeInTheDocument();
    expect(screen.queryByText('12+')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open in Google Maps/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Map' })).toBeDisabled();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(document.querySelector('a[href^="https://wa.me/"]')).toBeNull();
  });

  it('reselects the same service card after booking tabs were changed manually', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: 'Book now: Dry Clean' }));
    await user.click(screen.getByRole('tab', { name: 'Wash' }));
    await user.click(screen.getByRole('button', { name: 'Book now: Dry Clean' }));
    expect(screen.getByRole('tab', { name: 'Dry Clean' })).toHaveAttribute('aria-selected', 'true');
  });

  it('focuses and closes the map dialog and restores the view-map button', async () => {
    BUSINESS.mapsUrl = 'https://maps.google.com/?q=Test+shop';
    BUSINESS.mapsEmbedUrl = 'https://www.google.com/maps/embed?pb=test';
    const user = userEvent.setup();
    render(<HomePage />);
    const trigger = screen.getByRole('button', { name: 'View Map' });
    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Close map' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Find us on the map' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

});
