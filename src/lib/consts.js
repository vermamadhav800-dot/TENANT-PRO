

export const INITIAL_APP_STATE = {
  rooms: [
    { id: "1", number: "101", capacity: 2, rent: 12000, createdAt: "2023-01-01T00:00:00.000Z" }
  ],
  tenants: [
    { 
      id: "1", 
      name: "Madhav", 
      phone: "madhav123", 
      username: "madhav",
      unitNo: "101",
      rentAmount: 6000,
      dueDate: new Date().toISOString(),
      aadhaar: "123456789012",
      profilePhotoUrl: `https://i.pravatar.cc/150?u=madhav`,
      createdAt: "2023-01-10T00:00:00.000Z"
    }
  ],
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
