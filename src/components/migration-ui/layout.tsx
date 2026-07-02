import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap grid compatibility wrappers: <Container>, <Row>, <Col>.
 *
 * Replicates the 12-column flex grid with gutters:
 *   Row  -> flex flex-wrap with negative gutter margin
 *   Col  -> width fraction per breakpoint + gutter padding; no size = equal flex
 *   Container -> centered, responsive max-widths; `fluid` = full width
 *
 * Column width classes are kept as full literal strings (not template-built) so
 * Tailwind's JIT scanner detects them.
 */

type ColSpan = number | string | boolean

export type ColProps = React.ComponentProps<'div'> & {
  xs?: ColSpan
  sm?: ColSpan
  md?: ColSpan
  lg?: ColSpan
  xl?: ColSpan
  xxl?: ColSpan
  tag?: React.ElementType
}

// Literal width classes per breakpoint (1..12 columns; 12 => full width).
const COL_WIDTH: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', Record<number, string>> = {
  xs: {
    1: 'w-1/12', 2: 'w-2/12', 3: 'w-3/12', 4: 'w-4/12',
    5: 'w-5/12', 6: 'w-6/12', 7: 'w-7/12', 8: 'w-8/12',
    9: 'w-9/12', 10: 'w-10/12', 11: 'w-11/12', 12: 'w-full',
  },
  sm: {
    1: 'sm:w-1/12', 2: 'sm:w-2/12', 3: 'sm:w-3/12', 4: 'sm:w-4/12',
    5: 'sm:w-5/12', 6: 'sm:w-6/12', 7: 'sm:w-7/12', 8: 'sm:w-8/12',
    9: 'sm:w-9/12', 10: 'sm:w-10/12', 11: 'sm:w-11/12', 12: 'sm:w-full',
  },
  md: {
    1: 'md:w-1/12', 2: 'md:w-2/12', 3: 'md:w-3/12', 4: 'md:w-4/12',
    5: 'md:w-5/12', 6: 'md:w-6/12', 7: 'md:w-7/12', 8: 'md:w-8/12',
    9: 'md:w-9/12', 10: 'md:w-10/12', 11: 'md:w-11/12', 12: 'md:w-full',
  },
  lg: {
    1: 'lg:w-1/12', 2: 'lg:w-2/12', 3: 'lg:w-3/12', 4: 'lg:w-4/12',
    5: 'lg:w-5/12', 6: 'lg:w-6/12', 7: 'lg:w-7/12', 8: 'lg:w-8/12',
    9: 'lg:w-9/12', 10: 'lg:w-10/12', 11: 'lg:w-11/12', 12: 'lg:w-full',
  },
  xl: {
    1: 'xl:w-1/12', 2: 'xl:w-2/12', 3: 'xl:w-3/12', 4: 'xl:w-4/12',
    5: 'xl:w-5/12', 6: 'xl:w-6/12', 7: 'xl:w-7/12', 8: 'xl:w-8/12',
    9: 'xl:w-9/12', 10: 'xl:w-10/12', 11: 'xl:w-11/12', 12: 'xl:w-full',
  },
  xxl: {
    1: '2xl:w-1/12', 2: '2xl:w-2/12', 3: '2xl:w-3/12', 4: '2xl:w-4/12',
    5: '2xl:w-5/12', 6: '2xl:w-6/12', 7: '2xl:w-7/12', 8: '2xl:w-8/12',
    9: '2xl:w-9/12', 10: '2xl:w-10/12', 11: '2xl:w-11/12', 12: '2xl:w-full',
  },
}

function spanClass(bp: keyof typeof COL_WIDTH, value: ColSpan | undefined): string | undefined {
  if (value == null || value === false) return undefined
  // `true` or "auto" => let flexbox size it; only a numeric value sets a width.
  if (value === true || value === 'auto') return undefined
  const n = Math.min(12, Math.max(1, Math.round(Number(value))))
  if (Number.isNaN(n)) return undefined
  return COL_WIDTH[bp][n]
}

const Col = React.forwardRef<HTMLDivElement, ColProps>(
  ({ className, xs, sm, md, lg, xl, xxl, tag, ...props }, ref) => {
    const Comp: React.ElementType = tag ?? 'div'
    const widths = [
      spanClass('xs', xs),
      spanClass('sm', sm),
      spanClass('md', md),
      spanClass('lg', lg),
      spanClass('xl', xl),
      spanClass('xxl', xxl),
    ].filter(Boolean)
    const hasWidth = widths.length > 0

    return (
      <Comp
        ref={ref}
        className={cn('px-3', hasWidth ? widths : 'flex-1 basis-0', className)}
        {...props}
      />
    )
  }
)
Col.displayName = 'MigrationCol'

export type RowProps = React.ComponentProps<'div'> & {
  tag?: React.ElementType
  // reactstrap row-cols props — accepted for API parity, not applied.
  xs?: ColSpan
  sm?: ColSpan
  md?: ColSpan
  lg?: ColSpan
  xl?: ColSpan
  xxl?: ColSpan
}

const Row = React.forwardRef<HTMLDivElement, RowProps>(({ className, tag, xs: _xs, sm: _sm, md: _md, lg: _lg, xl: _xl, xxl: _xxl, ...props }, ref) => {
  const Comp: React.ElementType = tag ?? 'div'
  return <Comp ref={ref} className={cn('flex flex-wrap -mx-3', className)} {...props} />
})
Row.displayName = 'MigrationRow'

export type ContainerProps = React.ComponentProps<'div'> & {
  fluid?: boolean
  tag?: React.ElementType
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, fluid = false, tag, ...props }, ref) => {
    const Comp: React.ElementType = tag ?? 'div'
    return (
      <Comp
        ref={ref}
        className={cn(
          'mx-auto w-full px-3',
          !fluid &&
            'sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]',
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = 'MigrationContainer'

export { Container, Row, Col }
