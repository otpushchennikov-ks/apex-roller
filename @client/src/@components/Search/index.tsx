import { useState, FC, useRef, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input, message as noty } from 'antd';
import { HomeOutlined, EnterOutlined } from '@ant-design/icons';
import RowStyled from '@styled/RowStyled';
import highlitedMixin from '@styled/highlitedMixin';
import { margin } from '@styled/constants';
import { RoomIdCodec } from '@apex-roller/shared';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';


const Search: FC = () => {
  const inputRef = useRef<Input>(null);
  const history = useHistory();
  const [roomIdInput, setRoomIdInput] = useState('');

  useEffect(() => inputRef.current?.focus(), []);

  const handleChangeRootId = useCallback((input: string) => {
    const maybeRoomId = RoomIdCodec.decode(input);
    if (isLeft(maybeRoomId)) {
      console.log(PathReporter.report(maybeRoomId));
      noty.error(PathReporter.report(maybeRoomId));
      return;
    }

    history.push(maybeRoomId.right);
  }, [history]);

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
        onPressEnter={() => handleChangeRootId(roomIdInput)}
      />
      <Button onClick={() => handleChangeRootId(roomIdInput)}>
        <EnterOutlined />
      </Button>
    </RowStyled>
  );
}

export default Search;
