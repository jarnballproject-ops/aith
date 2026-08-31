import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm ' +
  'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none ' +
  'disabled:bg-slate-50 disabled:text-slate-400'

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function TextField({ label, hint, className, ...props }: TextFieldProps) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} className={cn(controlClass, className)} {...props} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}

export function SelectField({ label, className, children, ...props }: SelectFieldProps) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={cn(controlClass, className)} {...props}>
        {children}
      </select>
    </div>
  )
}
