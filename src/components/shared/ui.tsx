import React from 'react';

type Tone = 'gold' | 'purple';

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
    <div className={cx('surface-card p-1.5 flex gap-1', className)} role="tablist" aria-label={ariaLabel}>
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
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-11',
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
        className={cx('material-icons-round block text-xl leading-none transition-transform duration-300', iconClassName)}
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

export function ActionButton({ icon, variant = 'primary', className, children, type = 'button', ...props }: ActionButtonProps) {
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
