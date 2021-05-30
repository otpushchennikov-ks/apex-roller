import { v4 as uuid } from 'uuid';


const getOrCreateUserId = () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', uuid());
  }

  return localStorage.getItem('userId')!;
};

export default getOrCreateUserId;
