

export const INITIAL_APP_STATE = {
  rooms: [
    { id: "1", number: "101", capacity: 2, rent: 12000, createdAt: "2023-01-01T00:00:00.000Z" },
    { id: "2", number: "102", capacity: 1, rent: 8000, createdAt: "2023-01-01T00:00:00.000Z" }
  ],
  tenants: [
    {
        id: "tenant-1",
        name: "Madhav",
        phone: "1234567890",
        username: "madhav",
        password: "madhav123",
        unitNo: "101",
        rentAmount: 6000,
        dueDate: "2024-08-05T00:00:00.000Z",
        aadhaar: "123456789012",
        profilePhotoUrl: `https://picsum.photos/seed/madhav/200`,
        createdAt: "2023-02-01T00:00:00.000Z",
        leaseStartDate: "2023-02-01T00:00:00.000Z",
        leaseEndDate: "2025-01-31T00:00:00.000Z"
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
