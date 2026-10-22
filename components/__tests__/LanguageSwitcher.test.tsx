import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LanguageProvider } from '@/lib/i18n';

describe('language menu keyboard interactions', () => {
  it('opens with ArrowDown, selects a language, and restores trigger focus', async () => {
    window.localStorage.clear();
    const user = userEvent.setup();
    render(<LanguageProvider><LanguageSwitcher /></LanguageProvider>);
    const trigger = screen.getByRole('button', { name: 'Change language' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'English' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(document.documentElement.lang).toBe('mr');
    expect(screen.getByRole('button', { name: 'भाषा बदला' })).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape and permits tabbing away', async () => {
    window.localStorage.clear();
    const user = userEvent.setup();
    render(<><LanguageProvider><LanguageSwitcher /></LanguageProvider><button>Next control</button></>);
    const trigger = screen.getByRole('button', { name: 'Change language' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next control' })).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
