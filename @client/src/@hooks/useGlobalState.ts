import GlobalStateContext from '@context/GlobalState';
import { useContext } from 'react';


export default function useGlobalState() {
  return useContext(GlobalStateContext);
}
