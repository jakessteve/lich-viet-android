import React from 'react';

type Tone = 'gold' | 'purple' | 'indigo' | 'emerald' | 'astral';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  icon?: string;
  shortLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  tone?: Tone;
  className?: string;
}

const activeTone: Record<Tone, string> = {
  gold: 'bg-gradient-to-r from-gold via-gold-light to-amber-500 text-white shadow-md shadow-gold/20',
  purple: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20',
  indigo: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20',
  astral: 'bg-astral-primary text-white shadow-md shadow-astral-glow',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20',
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  tone = 'gold',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cx('surface-card p-1.5 flex gap-1 overflow-x-auto hide-scrollbar flex-nowrap', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(option.id)}
            className={cx(
              'flex-1 min-w-max flex-shrink-0 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-11 active:scale-[0.98]',
              active
                ? activeTone[tone]
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-container-low dark:hover:bg-white/5',
            )}
          >
            {option.icon && <span className="material-icons-round text-base">{option.icon}</span>}
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden text-xs">{option.shortLabel ?? option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  iconClassName?: string;
}

export function IconButton({ icon, label, iconClassName, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg text-text-secondary-light dark:text-text-secondary-dark transition-colors hover:bg-surface-container-low dark:hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-gold/35 dark:focus:ring-gold-dark/30',
        className,
      )}
      aria-label={label}
      {...props}
    >
      <span
        className={cx(
          'material-icons-round block text-xl leading-none transition-transform duration-300',
          iconClassName,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
    </button>
  );
}

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({
  icon,
  variant = 'primary',
  className,
  children,
  type = 'button',
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 btn-interact',
        variant === 'primary'
          ? 'bg-gradient-to-r from-mystery-deep to-indigo-950 text-gold-light ring-1 ring-gold/20 hover:shadow-xl hover:shadow-mystery-deep/20 dark:from-gold dark:to-amber-500 dark:text-indigo-950 dark:ring-0 dark:hover:shadow-gold-dark/25'
          : 'text-text-secondary-light/70 hover:text-text-primary-light dark:text-text-secondary-dark/70 dark:hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
      {icon && (
        <span className="material-icons-round text-lg" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, id, className, disabled = false }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative w-14 h-8 min-h-11 rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed',
        checked
          ? 'bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-500 shadow-sm shadow-gold/20 dark:shadow-gold-dark/25'
          : 'bg-gray-200 dark:bg-gray-600',
        className,
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out',
          checked ? 'translate-x-6' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export interface SettingRowProps {
  icon: string;
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingRow({ icon, label, description, children, className }: SettingRowProps) {
  return (
    <div
      className={cx(
        'flex items-center justify-between gap-4 py-3.5 border-b border-border-light/20 dark:border-border-dark/20 last:border-0',
        className,
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-0.5 shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, options, id, className, disabled = false }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cx(
        'text-xs px-3 py-1.5 rounded-lg bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/40 text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-gold/30 dark:focus:ring-gold-dark/30 outline-none transition-all disabled:opacity-40',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export interface SectionCardProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ icon, title, children, className }: SectionCardProps) {
  return (
    <div className={cx('surface-card p-5 sm:p-6 rounded-2xl', className)}>
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light/40 dark:border-border-dark/40">
        <span className="material-icons-round text-xl text-gold dark:text-gold-dark">{icon}</span>
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}
