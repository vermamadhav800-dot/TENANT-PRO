export interface Room {
  id: string;
  number: string;
  capacity: number;
  rent: number;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  aadhaar: string;
  address: string;
  roomId: string;
  rentPerPerson: number;
  profilePhotoUrl?: string;
  aadhaarPhotoUrl?: string;
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

export interface AppState {
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  electricity: ElectricityReading[];
}
