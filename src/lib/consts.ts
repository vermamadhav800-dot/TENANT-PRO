
import type { AppState, User } from '@/lib/types';

export const INITIAL_APP_STATE: AppState = {
  rooms: [],
  tenants: [],
  payments: [],
  electricity: [],
  defaults: {
    electricityRatePerUnit: 8,
  },
};

export const MOCK_USER_INITIAL: User = {
  name: 'jaibabalal',
  email: 'jaibabalal',
  password: 'jaibabalal123',
};
