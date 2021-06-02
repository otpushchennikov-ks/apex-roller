import { useState, FC, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input } from 'antd';
import { HomeOutlined, EnterOutlined } from '@ant-design/icons';
import RowStyled from '@styled/RowStyled';
import highlitedMixin from '@styled/highlitedMixin';
import { margin } from '@styled/constants';


const Search: FC = () => {
  const inputRef = useRef<Input>(null);
  const history = useHistory();
  const [roomIdInput, setRoomIdInput] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <RowStyled style={{ marginBottom: margin }} css={highlitedMixin}>
      <Button
        onClick={() => {
          setRoomIdInput('');
          history.push('');
        }}
      >
        <HomeOutlined />
      </Button>
      <Input
        ref={inputRef}
        placeholder="Enter room id"
        allowClear={true}
        value={roomIdInput}
        style={{ width: '100%', marginLeft: 10, marginRight: 10 }}
        onChange={({ target: { value }}) => setRoomIdInput(value)}
        onPressEnter={() => history.push(roomIdInput)}
      />
      <Button onClick={() => history.push(roomIdInput)}>
        <EnterOutlined />
      </Button>
    </RowStyled>
  );
}

export default Search;
