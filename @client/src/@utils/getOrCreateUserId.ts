import { v4 as uuid } from 'uuid';
import { UserIdCodec } from '@apex-roller/shared';


const getOrCreateUserId = () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', uuid());
  }

  return UserIdCodec.decode(localStorage.getItem('userId')!);
};

export default getOrCreateUserId;
