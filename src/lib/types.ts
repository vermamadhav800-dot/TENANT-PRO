

export interface Room {
  id: string;
  number: string;
  capacity: number;
  rent: number;
  createdAt: string;
}

export interface Tenant {
  id:string;
  name: string;
  phone: string;
  username: string;
  unitNo: string;
  rentAmount: number;
  dueDate: string;
  aadhaar: string;
  aadhaarCardUrl?: string | null;
  profilePhotoUrl?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'UPI' | 'Bank Transfer';
  notes?: string;
}

export interface ElectricityReading {
  id: string;
  roomId: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  ratePerUnit: number;
  totalAmount: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Maintenance' | 'Repairs' | 'Utilities' | 'Taxes' | 'Other';
  amount: number;
  date: string;
}

export interface AppState {
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  electricity: ElectricityReading[];
  expenses: Expense[];
  defaults?: {
    electricityRatePerUnit?: number;
  };
}

export interface User {
  name: string;
  username: string;
  password?: string; // This will be handled by Supabase Auth now
}
