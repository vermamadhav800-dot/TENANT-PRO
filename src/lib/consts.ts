import type { AppState } from '@/lib/types';

export const INITIAL_APP_STATE: AppState = {
  rooms: [],
  tenants: [],
  payments: [],
  electricity: [],
};

export const MOCK_USER = {
  name: 'Madhav Verma',
  email: 'vermamadhav800@gmail.com',
  password: 'jaibabalal123',
};
