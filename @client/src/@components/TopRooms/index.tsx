import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { TopRoomsCodec, RoomId } from '@apex-roller/shared';
import { isLeft } from 'fp-ts/Either';
import { message as noty, Typography, Button } from 'antd';
import { PathReporter } from 'io-ts/lib/PathReporter';
import useCurrentUri from '@hooks/useCurrentUri';
import { TopRoomsStyled } from './styled';
import { useHistory } from 'react-router';
import { highlitedMixin, RowStyled } from '@styled';
import { EnterOutlined, RedoOutlined } from '@ant-design/icons';
import { gap, margin } from '@styled/constants';


const { Text } = Typography;

const TopRoomsComponent: FC = () => {
  const history = useHistory();
  const uri = useCurrentUri();

  const [topRooms, setTopRooms] = useState<RoomId[]>([]);

  const fetchTopRooms = useCallback((): Promise<RoomId[]> => {
    return axios.get('/api/topRooms')
      .then(res => res.data)
      .then(data => {
        const maybeTopRooms = TopRoomsCodec.decode(data);
        if (isLeft(maybeTopRooms)) {
          console.log(PathReporter.report(maybeTopRooms));
          return [];
        }

        return maybeTopRooms.right.topRooms;
      })
      .catch(() => {
        noty.error(`Network error: can't load top rooms`);
        return [];
      });
  }, []);

  useEffect(() => {
    fetchTopRooms().then(setTopRooms);
  }, [fetchTopRooms]);

  const topRoomsSlice = useMemo(() => topRooms.filter(roomId => roomId !== uri), [topRooms, uri]);

  return (
    <>
      {Boolean(topRoomsSlice.length) &&
        <TopRoomsStyled css={highlitedMixin}>
          <RowStyled style={{ justifyContent: 'center', marginBottom: margin }}>
            <Text strong={true}>Top rooms</Text>
            <Button
              style={{ marginLeft: gap }}
              size="small"
              onClick={() => fetchTopRooms().then(setTopRooms)}
            >
              <RedoOutlined />
            </Button>
          </RowStyled>
          <div>
            {topRoomsSlice.map(roomId => {
              return (
                <RowStyled
                  key={roomId}
                  style={{
                    marginBottom: gap,
                    minWidth: 100,
                    maxWidth: 250,
                  }}
                >
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      flexGrow: 2,
                    }}
                  >
                    {roomId}
                  </div>
                  <Button
                    size="small"
                    style={{ marginLeft: gap }}
                    onClick={() => history.push(`/${roomId}`)}
                  >
                    <EnterOutlined />
                  </Button>
                </RowStyled>
              );
            })}
          </div>
        </TopRoomsStyled>
      }
    </>
  );
};

export default TopRoomsComponent;
