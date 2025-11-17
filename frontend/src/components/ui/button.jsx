import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Button = forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xbox-green disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default:
        'bg-xbox-green text-white hover:bg-xbox-green-light glow-border',
      outline:
        'border-2 border-xbox-green text-xbox-green hover:bg-xbox-green/10',
      ghost: 'hover:bg-xbox-green/10 text-xbox-green',
      link: 'text-xbox-green underline-offset-4 hover:underline',
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }