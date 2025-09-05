// This file is now largely deprecated as state is managed in Firestore.
// It can be removed in a future cleanup.

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
    geminiApiKey: '',
  },
  MOCK_USER_INITIAL: {
    name: 'Owner',
    username: 'owner@example.com',
    password: 'password123',
  },
};
