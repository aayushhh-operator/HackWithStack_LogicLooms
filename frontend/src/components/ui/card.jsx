import React from 'react'
import { cn } from '../../lib/utils'

export const Card = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-xbox-green/20 bg-xbox-gray/70 backdrop-blur',
        className
      )}
      {...props}
    />
  )
}

export const CardHeader = ({ className, ...props }) => {
  return (
    <div className={cn('p-4 pb-2 flex flex-col gap-1', className)} {...props} />
  )
}

export const CardTitle = ({ className, ...props }) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
}

export const CardDescription = ({ className, ...props }) => {
  return (
    <p
      className={cn('text-sm text-gray-400 leading-relaxed', className)}
      {...props}
    />
  )
}

export const CardContent = ({ className, ...props }) => {
  return <div className={cn('p-4 pt-0', className)} {...props} />
}