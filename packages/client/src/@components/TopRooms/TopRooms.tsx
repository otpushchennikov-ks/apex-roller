import { FC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { TopRoomsCodec, RoomId } from '@packages/shared';
import { isLeft } from 'fp-ts/Either';
import { Button, Typography, SwipeableDrawer, Tooltip } from '@material-ui/core';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { useCurrentRoomId, useMessage } from '@hooks';
import { useHistory } from 'react-router';
import { ReplayOutlined, KeyboardReturnOutlined, AccountCircleOutlined } from '@material-ui/icons';
import { gap, margin, padding, RowStyled, ColumnStyled } from '@styled';
import { useLatest } from 'react-use';


export const TopRooms: FC = () => {
  const { messageJsx, showMessage } = useMessage();
  const stableShowMessage = useLatest(showMessage);

  const history = useHistory();
  const { maybeRoomId } = useCurrentRoomId();

  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
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
        stableShowMessage.current('error', 'Network error: can\'t load top rooms');
        return [];
      });
  }, [stableShowMessage]);

  useEffect(() => {
    fetchTopRooms().then(setTopRooms);
  }, [fetchTopRooms]);

  const topRoomsSlice = isLeft(maybeRoomId) ? topRooms : topRooms.filter(roomId => roomId !== maybeRoomId.right);

  return (
    <>
      <Button
        variant="text"
        style={{ position: 'absolute', top: 20, left: 20 }}
        onClick={() => setDrawerIsOpen(true)}
      >
        <AccountCircleOutlined />
      </Button>
      <SwipeableDrawer
        anchor="left"
        open={drawerIsOpen}
        onOpen={() => setDrawerIsOpen(true)}
        onClose={() => setDrawerIsOpen(false)}
      >
        <ColumnStyled style={{ padding }}>
          <RowStyled style={{ justifyContent: 'center', marginBottom: margin }}>
            <Typography style={{ fontWeight: 'bold' }}>Top rooms</Typography>
            <Tooltip title="Update rooms">
              <Button
                size="small"
                variant="text"
                style={{ marginLeft: gap }}
                onClick={() => fetchTopRooms().then(setTopRooms)}
              >
                <ReplayOutlined fontSize="small" />
              </Button>
            </Tooltip>
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
                    variant="text"
                    style={{ marginLeft: gap }}
                    onClick={() => history.push(`/${roomId}`)}
                  >
                    <KeyboardReturnOutlined fontSize="small" />
                  </Button>
                </RowStyled>
              );
            })}
          </div>
        </ColumnStyled>
      </SwipeableDrawer>
      {messageJsx}
    </>
  );
};
