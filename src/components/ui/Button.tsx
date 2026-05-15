import React from 'react'
import { Link, type LinkProps } from 'react-router-dom'

/**
 * Site-wide button. Three variants — three is enough (DESIGN.md §5.1).
 *
 *   primary — gold fill; the single main action per page
 *   ghost   — bordered, transparent; secondary actions
 *   text    — inline link style; tertiary actions
 *
 * All variants share: 8px radius, 200ms standard ease, scale(0.98) on press,
 * gold focus ring, identical typography.
 */

type Variant = 'primary' | 'ghost' | 'text'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gold text-bg-base hover:bg-gold-hover ' +
    'active:scale-[0.98] active:duration-fast ' +
    'disabled:bg-gold/40 disabled:cursor-not-allowed disabled:active:scale-100',
  ghost:
    'bg-transparent text-fg-primary border border-white/12 ' +
    'hover:border-white/24 hover:bg-white/[0.03] ' +
    'active:scale-[0.98] active:duration-fast ' +
    'disabled:opacity-40 disabled:cursor-not-allowed',
  text:
    'bg-transparent text-gold underline-offset-4 hover:underline ' +
    'px-0 py-0 active:opacity-70 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-caption rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-body rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-body-lg rounded-lg gap-2',
}

// `text` variant ignores size paddings; it's an inline link.
const TEXT_SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-caption gap-1',
  md: 'text-body gap-1.5',
  lg: 'text-body-lg gap-2',
}

const BASE =
  'inline-flex items-center justify-center font-semibold ' +
  'transition-[background,border-color,color,transform,opacity] duration-base ease-standard ' +
  'select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'

// ─────────────────────────────────────────────────────────────────────────────

type CommonProps = {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

function composeClassName(
  variant: Variant,
  size: Size,
  fullWidth: boolean,
  extra?: string
) {
  const sizeClass = variant === 'text' ? TEXT_SIZE_CLASSES[size] : SIZE_CLASSES[size]
  return [
    BASE,
    VARIANT_CLASSES[variant],
    sizeClass,
    fullWidth ? 'w-full' : '',
    extra || '',
  ].join(' ')
}

// ── <Button> (renders a <button>) ────────────────────────────────────────────

export type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & CommonProps

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={composeClassName(variant, size, fullWidth, className)}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  )
}

// ── <ButtonLink> (renders a react-router <Link>) ─────────────────────────────

export type ButtonLinkProps =
  Omit<LinkProps, 'children' | 'className'> & CommonProps

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={composeClassName(variant, size, fullWidth, className)}>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </Link>
  )
}
