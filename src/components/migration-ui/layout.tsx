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
    1: 'tw:w-1/12', 2: 'tw:w-2/12', 3: 'tw:w-3/12', 4: 'tw:w-4/12',
    5: 'tw:w-5/12', 6: 'tw:w-6/12', 7: 'tw:w-7/12', 8: 'tw:w-8/12',
    9: 'tw:w-9/12', 10: 'tw:w-10/12', 11: 'tw:w-11/12', 12: 'tw:w-full',
  },
  sm: {
    1: 'tw:sm:w-1/12', 2: 'tw:sm:w-2/12', 3: 'tw:sm:w-3/12', 4: 'tw:sm:w-4/12',
    5: 'tw:sm:w-5/12', 6: 'tw:sm:w-6/12', 7: 'tw:sm:w-7/12', 8: 'tw:sm:w-8/12',
    9: 'tw:sm:w-9/12', 10: 'tw:sm:w-10/12', 11: 'tw:sm:w-11/12', 12: 'tw:sm:w-full',
  },
  md: {
    1: 'tw:md:w-1/12', 2: 'tw:md:w-2/12', 3: 'tw:md:w-3/12', 4: 'tw:md:w-4/12',
    5: 'tw:md:w-5/12', 6: 'tw:md:w-6/12', 7: 'tw:md:w-7/12', 8: 'tw:md:w-8/12',
    9: 'tw:md:w-9/12', 10: 'tw:md:w-10/12', 11: 'tw:md:w-11/12', 12: 'tw:md:w-full',
  },
  lg: {
    1: 'tw:lg:w-1/12', 2: 'tw:lg:w-2/12', 3: 'tw:lg:w-3/12', 4: 'tw:lg:w-4/12',
    5: 'tw:lg:w-5/12', 6: 'tw:lg:w-6/12', 7: 'tw:lg:w-7/12', 8: 'tw:lg:w-8/12',
    9: 'tw:lg:w-9/12', 10: 'tw:lg:w-10/12', 11: 'tw:lg:w-11/12', 12: 'tw:lg:w-full',
  },
  xl: {
    1: 'tw:xl:w-1/12', 2: 'tw:xl:w-2/12', 3: 'tw:xl:w-3/12', 4: 'tw:xl:w-4/12',
    5: 'tw:xl:w-5/12', 6: 'tw:xl:w-6/12', 7: 'tw:xl:w-7/12', 8: 'tw:xl:w-8/12',
    9: 'tw:xl:w-9/12', 10: 'tw:xl:w-10/12', 11: 'tw:xl:w-11/12', 12: 'tw:xl:w-full',
  },
  xxl: {
    1: 'tw:2xl:w-1/12', 2: 'tw:2xl:w-2/12', 3: 'tw:2xl:w-3/12', 4: 'tw:2xl:w-4/12',
    5: 'tw:2xl:w-5/12', 6: 'tw:2xl:w-6/12', 7: 'tw:2xl:w-7/12', 8: 'tw:2xl:w-8/12',
    9: 'tw:2xl:w-9/12', 10: 'tw:2xl:w-10/12', 11: 'tw:2xl:w-11/12', 12: 'tw:2xl:w-full',
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
        className={cn('tw:px-3', hasWidth ? widths : 'tw:flex-1 tw:basis-0', className)}
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
  return <Comp ref={ref} className={cn('tw:flex tw:flex-wrap tw:-mx-3', className)} {...props} />
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
          'tw:mx-auto tw:w-full tw:px-3',
          !fluid &&
            'tw:sm:max-w-[540px] tw:md:max-w-[720px] tw:lg:max-w-[960px] tw:xl:max-w-[1140px] tw:2xl:max-w-[1320px]',
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = 'MigrationContainer'

export { Container, Row, Col }
