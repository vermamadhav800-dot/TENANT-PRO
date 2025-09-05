
export const INITIAL_APP_STATE = {
  rooms: [],
  tenants: [],
  payments: [],
  electricity: [],
  expenses: [],
  pendingApprovals: [],
  notifications: [],
  maintenanceRequests: [],
  globalNotices: [],
  defaults: {
    electricityRatePerUnit: 8,
    upiId: '',
    propertyAddress: '[Your Full Property Address]',
    propertyName: 'Happy Homes PG',
  },
  MOCK_USER_INITIAL: {
    name: 'Owner',
    username: 'owner@example.com',
    password: 'password123',
  },
};

// This is only used if there's no owner in appState yet
export const MOCK_USER_INITIAL = {
  name: 'Owner',
  username: 'owner@example.com',
  password: 'password123',
};
