

export const INITIAL_APP_STATE = {
  rooms: [
    { id: "1", number: "101", capacity: 2, rent: 12000, createdAt: "2023-01-01T00:00:00.000Z" },
    { id: "2", number: "102", capacity: 1, rent: 8000, createdAt: "2023-01-01T00:00:00.000Z" }
  ],
  tenants: [],
  payments: [],
  electricity: [],
  expenses: [],
  defaults: {
    electricityRatePerUnit: 8,
  },
};

export const MOCK_USER_INITIAL = {
  name: 'jaibabalal',
  username: 'jaibabalal',
  password: 'jaibabalal123',
};
