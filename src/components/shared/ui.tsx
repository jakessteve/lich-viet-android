import React from 'react';
import { cn } from '@/lib/utils';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconButton as ShadcnIconButton, type IconButtonProps as ShadcnIconButtonProps } from '@/components/ui/icon-button';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import { Badge, type BadgeProps } from '@/components/ui/badge';

export { Badge };
export type { BadgeProps };

export interface SegmentedOption<T extends string = string> {
  id: T;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode | string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: readonly SegmentedOption<T>[] | SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
  tone?: 'gold' | 'indigo' | 'purple' | 'emerald' | 'astral';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  tone = 'gold',
}: SegmentedControlProps<T>) {
  const activeTone = {
    gold: 'bg-gold/15 dark:bg-gold-dark/15 text-amber-950 dark:text-gold-dark font-semibold shadow-xs border border-gold/30 dark:border-gold-dark/30',
    indigo:
      'bg-indigo-500/15 dark:bg-indigo-400/15 text-indigo-950 dark:text-indigo-300 font-semibold shadow-xs border border-indigo-500/30 dark:border-indigo-400/30',
    astral:
      'bg-indigo-500/15 dark:bg-indigo-400/15 text-indigo-950 dark:text-indigo-300 font-semibold shadow-xs border border-indigo-500/30 dark:border-indigo-400/30',
    purple:
      'bg-purple-500/15 dark:bg-purple-400/15 text-purple-950 dark:text-purple-300 font-semibold shadow-xs border border-purple-500/30 dark:border-purple-400/30',
    emerald:
      'bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-950 dark:text-emerald-300 font-semibold shadow-xs border border-emerald-500/30 dark:border-emerald-400/30',
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex rounded-2xl p-1.5 bg-surface-subtle-light/80 dark:bg-surface-subtle-dark/70 border border-border-light/50 dark:border-border-dark/50 gap-1 overflow-x-auto scrollbar-none',
        className,
      )}
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
            className={cn(
              'flex-1 min-w-0 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-200 min-h-11 spring-press',
              active
                ? activeTone[tone]
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-container-low dark:hover:bg-white/5',
            )}
          >
            {renderDynamicIcon(option.icon, 'h-4 w-4 shrink-0')}
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden text-xs">{option.shortLabel ?? option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export type IconButtonProps = ShadcnIconButtonProps;

export function IconButton(props: IconButtonProps) {
  return <ShadcnIconButton {...props} />;
}

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode | string;
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
    <ShadcnButton
      type={type}
      variant={variant === 'primary' ? 'primary' : 'ghost'}
      className={cn('rounded-2xl px-6 py-3 text-sm font-bold gap-2', className)}
      {...props}
    >
      {children}
      {renderDynamicIcon(icon, 'h-4 w-4 shrink-0')}
    </ShadcnButton>
  );
}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean, event?: React.MouseEvent) => void;
  id: string;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, id, className, disabled = false }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => onChange(!checked, e)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 dark:focus:ring-offset-surface-dark disabled:cursor-not-allowed disabled:opacity-40 min-h-11 min-w-11 items-center justify-center p-0 spring-press',
        checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600',
        className,
      )}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-2.5' : '-translate-x-2.5',
        )}
      />
    </button>
  );
}

export interface SettingRowProps {
  icon?: React.ReactNode | string;
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingRow({ icon, label, description, children, className }: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3.5 border-b border-border-light/20 dark:border-border-dark/20 last:border-0',
        className,
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-0.5 shrink-0">
            {renderDynamicIcon(icon, 'h-4 w-4 shrink-0')}
          </div>
        )}
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
      className={cn(
        'text-xs px-3 py-1.5 rounded-lg bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/40 text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-gold/30 dark:focus:ring-gold-dark/30 outline-none transition-colors disabled:opacity-40 spring-press',
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
  icon?: React.ReactNode | string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ icon, title, children, className }: SectionCardProps) {
  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light/40 dark:border-border-dark/40">
        {icon && (
          <div className="text-gold dark:text-gold-dark shrink-0">
            {renderDynamicIcon(icon, 'h-5 w-5 shrink-0')}
          </div>
        )}
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
      </div>
      <div>{children}</div>
    </Card>
  );
}
