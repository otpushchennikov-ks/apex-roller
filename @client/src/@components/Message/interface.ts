import { AlertProps } from '@material-ui/lab';


export interface IMessageProps {
  isOpen: boolean
  text: string
  onClose: () => void
  type: AlertProps['severity']
}
