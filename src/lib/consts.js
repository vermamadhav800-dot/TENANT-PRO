
export const INITIAL_APP_STATE = {
  rooms: [],
  tenants: [],
  payments: [],
  electricity: [],
  expenses: [],
  pendingApprovals: [],
  notifications: [],
  defaults: {
    electricityRatePerUnit: 8,
    upiId: '',
    propertyAddress: '[Your Full Property Address]',
    propertyName: 'Happy Homes PG',
  },
};

export const MOCK_USER_INITIAL = {
  name: 'Admin',
  username: 'admin',
  password: 'password123',
};
