import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'

const TabsContext = createContext(null)

export const Tabs = ({ defaultValue, children, className }) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-xbox-gray/70 p-1',
        className
      )}
      {...props}
    />
  )
}

export const TabsTrigger = ({ className, value, children }) => {
  const ctx = useContext(TabsContext)
  const isActive = ctx?.value === value
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={cn(
        'px-4 py-2 text-sm font-semibold rounded-md transition-all',
        isActive
          ? 'bg-xbox-green text-white shadow-lg shadow-xbox-green/40'
          : 'text-gray-300 hover:text-white hover:bg-xbox-green/10',
        className
      )}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, className, children }) => {
  const ctx = useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div className={cn(className)}>{children}</div>
}