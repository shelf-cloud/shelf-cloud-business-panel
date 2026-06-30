/**
 * migration-ui: app-owned, Bootstrap/reactstrap-compatible primitives that
 * render Tailwind/shadcn internally.
 *
 * Purpose: swap `from 'reactstrap'` imports to `from '@/components/migration-ui'`
 * one screen at a time, without rewriting markup or props. Only the prop
 * patterns the app actually uses are supported — this is not full reactstrap
 * API coverage.
 *
 * See ./README.md for the supported prop surface and mappings.
 */
export { Button, buttonVariants, type ButtonProps } from './button'
export { Badge, badgeVariants, type BadgeProps } from './badge'
export { Spinner, type SpinnerProps } from './spinner'
export { Card, CardBody, CardHeader, CardFooter, CardTitle } from './card'
export { Container, Row, Col, type ContainerProps, type RowProps, type ColProps } from './layout'
export { Input, type InputProps } from './input'
export { Label, type LabelProps } from './label'
export { Alert, type AlertProps } from './alert'
export { InputGroup, InputGroupText, type InputGroupProps, type InputGroupTextProps } from './input-group'
export { Switch, type SwitchProps } from './switch'
export { Modal, ModalHeader, ModalBody, ModalFooter, type ModalProps, type ModalSectionProps } from './modal'
export { Offcanvas, OffcanvasHeader, OffcanvasBody, type OffcanvasProps, type OffcanvasSectionProps } from './offcanvas'
export { Form, FormGroup, FormFeedback, type FormProps, type FormGroupProps, type FormFeedbackProps } from './form'
export {
  UncontrolledDropdown,
  Dropdown,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  type DropdownRootProps,
  type DropdownToggleProps,
  type DropdownMenuProps,
  type DropdownItemProps,
  type ButtonGroupProps,
} from './dropdown'
export { Collapse, type CollapseProps } from './collapse'
export { UncontrolledTooltip, type UncontrolledTooltipProps } from './tooltip'
export {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  type NavProps,
  type NavItemProps,
  type NavLinkProps,
  type TabContentProps,
  type TabPaneProps,
} from './tabs'
export {
  FormikField,
  getFieldState,
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
  type FormikFieldProps,
  type AnyFormik,
} from './formik-field'
