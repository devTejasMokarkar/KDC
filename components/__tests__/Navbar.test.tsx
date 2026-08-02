import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/Navbar';

const location = window.location as { href: string };

describe('Navbar', () => {
  beforeEach(() => {
    location.href = 'http://localhost/';
    window.scrollTo = vi.fn();
    vi.clearAllMocks();
  });

  it('renders the wordmark and primary navigation links', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Rakesh Dry Cleaners – home' })).toBeInTheDocument();

    for (const label of ['The Process', 'Services', 'Fabric Care', 'Contact Us', 'Billing']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0);
    }
  });

  it('opens and closes the mobile drawer via the toggle', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    await user.click(toggle);

    const drawer = screen.getByRole('dialog', { name: 'Navigation menu' });
    expect(drawer).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  it('scrolls to an in-page section that exists', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    const el = document.createElement('section');
    el.id = 'services';
    document.body.appendChild(el);

    render(<Navbar />);
    await user.click(screen.getAllByRole('link', { name: 'Services' })[0]);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    el.remove();
  });

  it('routes to the homepage section when the target section is not on the page', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getAllByRole('link', { name: 'Fabric Care' })[0]);
    expect(location.href).toBe('http://localhost/#fabric-care');
  });

  it('closes the drawer before navigating to a route', async () => {
    const user = userEvent.setup();
    const { container } = render(<Navbar />);

    const drawer = container.querySelector('.mobile-menu');
    expect(drawer).toHaveAttribute('aria-hidden', 'true');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(drawer).toHaveAttribute('aria-hidden', 'false');

    await user.click(screen.getAllByRole('link', { name: 'Billing' })[0]);

    expect(location.href).toBe('http://localhost/#book');
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  it('scrolls to top when the wordmark is clicked', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(<Navbar />);
    await user.click(screen.getByRole('link', { name: 'Rakesh Dry Cleaners – home' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
