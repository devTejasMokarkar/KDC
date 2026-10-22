import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

const location = window.location as { href: string };

describe('HomePage', () => {
  beforeEach(() => {
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

  it('renders all service categories', () => {
    render(<HomePage />);

    for (const label of ['Wash', 'Wash & Iron', 'Dry Clean', 'Colour Restore', 'Rafoo (Mending)']) {
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

  it('renders contact links and actions', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /Open in Google Maps/ })).toHaveAttribute(
      'href',
      expect.stringContaining('maps.google.com')
    );
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
