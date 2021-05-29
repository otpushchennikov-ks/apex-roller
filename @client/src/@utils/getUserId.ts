import { v4 as uuid } from 'uuid';


const getUserId = () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', uuid());
  }

  return localStorage.getItem('userId')!;
};

export default getUserId;
