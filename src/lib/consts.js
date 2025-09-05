
// This file contains the initial mock data for the application.
// In a real-world scenario, this data would be fetched from a database.

export const INITIAL_APP_STATE = {
  MOCK_USER_INITIAL: {
    name: 'Prakash Kumar',
    username: 'owner@example.com',
    password: 'password',
    photoURL: 'https://i.pravatar.cc/150?u=prakash'
  },
  defaults: {
    propertyName: "Prakash's PG",
    propertyAddress: "123 Tech Park, Bangalore",
    electricityRatePerUnit: 8,
    upiId: "prakash@exampleupi",
    qrCodeUrl: "https://placehold.co/300x300.png?text=Your+QR+Code",
  },
  rooms: [
    { id: '1', number: '101', capacity: 2, rent: 14000 },
    { id: '2', number: '102', capacity: 3, rent: 18000 },
    { id: '3', number: '201', capacity: 2, rent: 15000 },
  ],
  tenants: [
    {
      id: 't1',
      name: 'Amit Kumar',
      phone: '1234567890',
      username: 'amit@example.com',
      unitNo: '101',
      rentAmount: 7000,
      aadhaar: '123456789012',
      leaseStartDate: '2023-01-15T00:00:00Z',
      leaseEndDate: '2024-01-14T00:00:00Z',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=amit',
      otherCharges: [],
    },
    {
      id: 't2',
      name: 'Priya Sharma',
      phone: '0987654321',
      username: 'priya@example.com',
      unitNo: '101',
      rentAmount: 7000,
      aadhaar: '210987654321',
      leaseStartDate: '2023-02-01T00:00:00Z',
      leaseEndDate: '2024-01-31T00:00:00Z',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=priya',
      otherCharges: [],
    },
     {
      id: 't3',
      name: 'Rohan Verma',
      phone: '1122334455',
      username: 'rohan@example.com',
      unitNo: '102',
      rentAmount: 6000,
      aadhaar: '334455667788',
      leaseStartDate: '2023-03-10T00:00:00Z',
      leaseEndDate: '2024-03-09T00:00:00Z',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=rohan',
      otherCharges: [],
    },
  ],
  payments: [
    { id: 'p1', tenantId: 't1', amount: 7000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), method: 'UPI' },
    { id: 'p2', tenantId: 't2', amount: 7000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), method: 'Cash' },
  ],
  electricity: [],
  expenses: [
    { id: 'e1', description: 'Wifi Bill', category: 'Utilities', amount: 1500, date: new Date(new Date().setMonth(new Date().getMonth() -1)).toISOString() },
    { id: 'e2', description: 'Plumbing Repair in Room 201', category: 'Repairs', amount: 800, date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString() },
  ],
  pendingApprovals: [
     {
      id: 'pa1',
      tenantId: 't3',
      amount: 6000,
      date: new Date().toISOString(),
      screenshotUrl: 'https://placehold.co/600x400.png?text=Payment+Screenshot',
    }
  ],
  maintenanceRequests: [
    {
      id: 'mr1',
      tenantId: 't1',
      unitNo: '101',
      category: 'Electrical',
      description: 'The fan in my room is not working. It makes a loud noise and then stops.',
      status: 'Pending',
      submittedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
      id: 'mr2',
      tenantId: 't3',
      unitNo: '102',
      category: 'Plumbing',
      description: 'The shower head is leaking constantly.',
      status: 'In Progress',
      submittedAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    }
  ],
  notifications: [
    {
      id: 'n1',
      tenantId: 't1',
      message: "Reminder: Your rent payment is due in 3 days.",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      isRead: false,
    },
     {
      id: 'n2',
      tenantId: 't2',
      message: "Your maintenance request for the shower has been marked 'In Progress'.",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
      isRead: true,
    }
  ],
  globalNotices: [
      {
        id: 'gn1',
        title: "Monthly Pest Control",
        message: "Please be informed that the monthly pest control service is scheduled for this Saturday at 10:00 AM. Kindly allow the staff access to your rooms.",
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      },
       {
        id: 'gn2',
        title: "Terrace Cleaning",
        message: "The terrace will be closed for cleaning and maintenance on Sunday from 8 AM to 12 PM. Please avoid using the terrace during this time.",
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      }
  ]
};
