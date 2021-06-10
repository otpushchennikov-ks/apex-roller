import { FC, useState, useMemo, useCallback } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps } from '@material-ui/lab';
import { v4 as uuid } from 'uuid';


const messageDuration = 3000;
const maxMessagesCount = 3;

const useMessage = () => {
  const [messages, setMessages] = useState<(MessageProps & { id: string })[]>([]);

  const showMessage = useCallback((type: MessageProps['type'], text: MessageProps['text']) => {
    const nextMessage = { isOpen: true, text, type, id: uuid() };

    setMessages(messages => {
      let copy = messages.slice();
      if (copy.length === maxMessagesCount) {
        copy.shift();
      }
      copy.push(nextMessage);

      setTimeout(() => {
        setMessages(messages => messages.filter(({ id }) => id !== nextMessage.id));
      }, messageDuration);

      return copy;
    });
  }, []);

  const messageJsx = useMemo(() => {
    return messages.map((props, i) => {
      return (
        <Message
          index={i}
          key={props.text + props.type + i}
          {...props}
        />
      );
    });
  }, [messages]);

  return {
    messageJsx,
    showMessage,
  };
};

const Message: FC<MessageProps & {  index: number }> = ({ isOpen, text, type, index }) => {
  return (
    <Snackbar
      open={isOpen}
      hidden={true}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      style={{ position: 'absolute', top: 20 + (58 * index) }}
    >
      <Alert severity={type}>
        {text}
      </Alert>
    </Snackbar>
  );
};

type MessageProps = {
  isOpen: boolean
  text: string
  type: AlertProps['severity']
};

export default useMessage;
