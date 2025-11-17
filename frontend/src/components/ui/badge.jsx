import React from 'react'
import { cn } from '../../lib/utils'

export const Badge = ({ className, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        className
      )}
      {...props}
    />
  )
}