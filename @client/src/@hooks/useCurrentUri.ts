import { useLocation } from 'react-use';


// TODO: Переделать этот хук в useCurrentRoomId
export default function useCurrentUri() {
  const uri = useLocation()?.pathname?.slice(1)
  return !uri ? uri : window.decodeURI(uri);
}
