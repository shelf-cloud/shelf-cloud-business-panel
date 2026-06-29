import * as React from 'react'

import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from '@shadcn/ui/card'

/**
 * Bootstrap/reactstrap <Card> family compatibility wrappers.
 *
 * Maps reactstrap names to the shadcn card primitives:
 *   Card -> Card, CardBody -> CardContent, CardHeader -> CardHeader,
 *   CardFooter -> CardFooter, CardTitle -> CardTitle.
 *
 * `tag` (reactstrap polymorphic element) and `className` pass through. The
 * shadcn Card already supplies vertical padding; CardBody therefore drops the
 * extra top padding shadcn CardContent does not add by default.
 */
type DivProps = React.ComponentProps<'div'> & { tag?: React.ElementType }

function Card({ tag: _tag, ...props }: DivProps) {
  return <ShadcnCard {...props} />
}

function CardBody({ tag: _tag, ...props }: DivProps) {
  return <ShadcnCardContent {...props} />
}

function CardHeader({ tag: _tag, ...props }: DivProps) {
  return <ShadcnCardHeader {...props} />
}

function CardFooter({ tag: _tag, ...props }: DivProps) {
  return <ShadcnCardFooter {...props} />
}

function CardTitle({ tag: _tag, ...props }: DivProps) {
  return <ShadcnCardTitle {...props} />
}

export { Card, CardBody, CardHeader, CardFooter, CardTitle }
