import type { AppState } from '@/lib/types';

export const INITIAL_APP_STATE: AppState = {
  rooms: [],
  tenants: [],
  payments: [],
  electricity: [],
};

export const MOCK_USER = {
  name: 'Admin',
  username: 'admin',
  password: 'password',
};
