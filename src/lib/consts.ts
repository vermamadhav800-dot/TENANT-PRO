
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

// This is no longer the source of truth for the user.
export const MOCK_USER_INITIAL: User = {
  name: 'Test User',
  email: 'test@example.com',
};
