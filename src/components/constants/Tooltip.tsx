import { UncontrolledTooltip } from '@/components/migration-ui'

type Props = {
  target: string
  text: string
}

const TooltipComponent = ({ target, text }: Props) => {
  return (
    <UncontrolledTooltip placement='top' target={target}>
      {text}
    </UncontrolledTooltip>
  )
}

export default TooltipComponent
