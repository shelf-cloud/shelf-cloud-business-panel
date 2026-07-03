import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'

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
