import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../app/ThemeContext';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return <button className="icon-button" onClick={toggleTheme} aria-pressed={dark} aria-label={dark ? 'Usar tema claro' : 'Usar tema oscuro'}>
    {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
  </button>;
}
