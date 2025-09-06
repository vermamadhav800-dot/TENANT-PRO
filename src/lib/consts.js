

// This file contains the initial mock data for the application.
// In a real-world scenario, this data would be fetched from a database.

export const INITIAL_APP_STATE = {
  MOCK_USER_INITIAL: null,
  defaults: {
    propertyName: "My Property",
    propertyAddress: "123 Main St, Anytown",
    electricityRatePerUnit: 8,
    upiId: "",
    qrCodeUrl: null,
    reminderSettings: {
      enabled: false,
      beforeDays: 3, // Days before due date
      overdueDays: 3, // Every x days when overdue
    },
    lastReminderCheck: null,
    subscriptionPlan: 'standard', // 'standard', 'pro', or 'business'
    maxProperties: 1, // Based on subscription
  },
  rooms: [],
  tenants: [],
  payments: [],
  electricity: [],
  expenses: [],
  pendingApprovals: [],
  updateRequests: [],
  maintenanceRequests: [],
  notifications: [],
  globalNotices: []
};

export const ownerPlanFeatures = [
    { feature: "Tenant & Room Management", standard: true, pro: true, business: true },
    { feature: "Payment Tracking", standard: true, pro: true, business: true },
    { feature: "Tenant Portal", standard: true, pro: true, business: true },
    { feature: "Expense Tracking", standard: true, pro: true, business: true },
    { feature: "Automated Reminders", standard: false, pro: true, business: true },
    { feature: "Advanced Data Exports (PDF, CSV)", standard: false, pro: true, business: true },
    { feature: "AI-Powered Rent Optimization", standard: false, pro: true, business: true },
    { feature: "All Pro Features", standard: false, pro: false, business: true},
    { feature: "Document & Lease Management", standard: false, pro: false, business: true },
    { feature: "AI Financial Analyst Chat", standard: false, pro: false, business: true },
];

export const tenantPlanFeatures = [
    { feature: "View Bills & Pay Rent", free: true, plus: true, premium: true },
    { feature: "Submit Maintenance Requests", free: true, plus: true, premium: true },
    { feature: "Access Notice Board", free: true, plus: true, premium: true },
    { feature: "Download Detailed Receipts", free: false, plus: true, premium: true },
    { feature: "View Full Payment History", free: false, plus: true, premium: true },
    { feature: "Access All Your Documents", free: false, pro: false, premium: true },
];

export const tenantPlans = {
    free: { id: 'free', name: 'Basic', price: 'Free', priceSuffix: '', description: 'Essential features for every tenant.', cta: 'Your Current Plan', priceAmount: 0 },
    plus: { id: 'plus', name: 'Plus', price: '49', priceSuffix: '/mo', description: 'Get better tracking of your payments and documents.', cta: 'Upgrade to Plus', priceAmount: 49 },
    premium: { id: 'premium', name: 'Premium', price: '99', priceSuffix: '/mo', description: 'Unlock all features for the ultimate convenience.', cta: 'Upgrade to Premium', priceAmount: 99 }
};

export const ownerPlans = {
    standard: { id: 'standard', name: 'Standard', price: 'Free', priceSuffix: '', description: 'Perfect for getting started with basics', cta: 'Get Started', priceAmount: 0 },
    pro: { id: 'pro', name: 'Pro', price: '499', priceSuffix: '/mo', description: 'For property owners needing automation', cta: 'Upgrade to Pro', priceAmount: 499 },
    business: { id: 'business', name: 'Business', price: '999', priceSuffix: '/mo', description: 'Scaling your property business', cta: 'Scale with Business', priceAmount: 999 }
};
