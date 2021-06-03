import axios from 'axios';
import { restHost } from '@utils/constants';
import { message as noty } from 'antd';


axios.defaults.baseURL = restHost;
noty.config({ maxCount: 3 });
