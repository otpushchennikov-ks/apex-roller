import { v4 as uuid } from 'uuid';
import { UserIdCodec } from '@packages/shared';


export const getOrCreateUserId = () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', uuid());
  }

  return UserIdCodec.decode(localStorage.getItem('userId')!);
};
