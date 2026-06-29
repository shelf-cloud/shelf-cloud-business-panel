import * as React from 'react'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@shadcn/ui/field'
import { Input } from '@shadcn/ui/input'
import { Textarea } from '@shadcn/ui/textarea'
import { getIn } from 'formik'

/**
 * Formik <-> shadcn Field adapter — the locked convention for migrating forms.
 *
 * The app is Formik-driven (~57 files) while shadcn's Field docs assume
 * react-hook-form. This adapter bridges the two: pass the Formik instance and a
 * field `name`, and it wires value/onChange/onBlur, touched/error state,
 * `aria-invalid`, and the FieldError message using Formik's `getIn` (so dotted
 * and nested names work).
 *
 * Usage:
 *   const validation = useFormik({ ... })
 *   <FieldGroupForm>
 *     <FormikField formik={validation} name="title" label="Title" />
 *     <FormikField formik={validation} name="notes" label="Notes" as="textarea" />
 *   </FieldGroupForm>
 *
 * For controls the adapter does not cover (custom selects, switches), use the
 * exported Field primitives directly and read state via `getFieldState`.
 */
export type AnyFormik = {
  values: Record<string, unknown>
  errors: Record<string, unknown>
  touched: Record<string, unknown>
  handleChange: React.ChangeEventHandler
  handleBlur: React.FocusEventHandler
}

export function getFieldState(formik: AnyFormik, name: string) {
  const value = getIn(formik.values, name)
  const error = getIn(formik.errors, name) as string | undefined
  const touched = getIn(formik.touched, name) as boolean | undefined
  const invalid = Boolean(touched && error)
  return { value, error, touched, invalid }
}

type ControlProps = React.ComponentProps<'input'> & Pick<React.ComponentProps<'textarea'>, 'rows'>

export type FormikFieldProps = Omit<ControlProps, 'name'> & {
  formik: AnyFormik
  name: string
  label?: React.ReactNode
  description?: React.ReactNode
  as?: 'input' | 'textarea'
  className?: string
  inputClassName?: string
}

export function FormikField({ formik, name, label, description, as = 'input', className, inputClassName, type = 'text', ...props }: FormikFieldProps) {
  const { value, error, invalid } = getFieldState(formik, name)
  const common = {
    id: name,
    name,
    value: (value as string | number | undefined) ?? '',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    'aria-invalid': invalid || undefined,
    className: inputClassName,
  }

  return (
    <Field className={className} data-invalid={invalid || undefined}>
      {label ? <FieldLabel htmlFor={name}>{label}</FieldLabel> : null}
      {as === 'textarea' ? (
        <Textarea {...common} {...(props as React.ComponentProps<'textarea'>)} />
      ) : (
        <Input type={type} {...common} {...props} />
      )}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {invalid ? <FieldError errors={[{ message: String(error) }]} /> : null}
    </Field>
  )
}

// Re-export the shadcn Field primitives so migrated forms import structure and
// adapter from one place.
export { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle }
