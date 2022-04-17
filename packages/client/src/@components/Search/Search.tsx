import { useState, FC } from 'react';
import { useHistory } from 'react-router-dom';
import { RowStyled, margin, padding } from '@styled';
import { Button, TextField, Tooltip } from '@material-ui/core';
import { HomeOutlined, KeyboardReturnOutlined } from '@material-ui/icons';


export const Search: FC = () => {
  const history = useHistory();
  const [roomIdInput, setRoomIdInput] = useState('');

  return (
    <RowStyled style={{ marginBottom: margin, padding }}>
      <Tooltip title="Private room">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setRoomIdInput('');
            history.push('');
          }}
        >
          <HomeOutlined fontSize="small" />
        </Button>
      </Tooltip>
      <TextField
        autoFocus={true}
        placeholder="Enter room id"
        value={roomIdInput}
        style={{ width: '100%', marginLeft: 10, marginRight: 10 }}
        onChange={({ target: { value } }) => setRoomIdInput(value)}
        onKeyPress={({ key }) => key === 'Enter' && history.push(roomIdInput)}
      />
      <Button
        color="primary"
        variant="contained"
        onClick={() => history.push(roomIdInput)}
      >
        <KeyboardReturnOutlined fontSize="small" />
      </Button>
    </RowStyled>
  );
}
