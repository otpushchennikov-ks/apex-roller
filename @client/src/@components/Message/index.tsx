import { FC } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab'; 
import { IMessageProps } from './interface';


const Message: FC<IMessageProps> = ({ text, isOpen, onClose, type }) => {
  return (
    <Snackbar
      open={isOpen}
      onClose={onClose}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={type}>
        {text}
      </Alert>
    </Snackbar>
  );
};

export default Message;
