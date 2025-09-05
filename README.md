# EstateFlow - Next-Generation Tenant & Property Management

EstateFlow is a comprehensive, modern web application designed to simplify property management for landlords and provide a seamless experience for tenants. Built with a powerful tech stack, it offers robust tools for tracking tenants, rooms, finances, and documents, all while providing AI-powered insights to maximize profitability.

## Key Features

### Core Management (Standard Plan)
- **Dashboard**: A central hub for a quick overview of your property's status, including occupancy and recent activity.
- **Tenant Management**: Add, edit, and manage all tenant information, including contact details and lease dates.
- **Room Management**: Define rooms with specific capacities and monthly rent. Rent is automatically divided among tenants in a shared room.
- **Payment Tracking**: Manually record rent payments received through various methods (Cash, UPI, Bank Transfer).
- **Tenant Portal**: Individual login for tenants to view their bills, payment history, and submit requests.
- **Request Management**: Handle payment approvals and maintenance requests submitted by tenants.
- **Notice Board**: Post global announcements for all tenants to see.
- **Electricity Billing**: Log electricity meter readings and automatically apply charges to tenant bills.

### Advanced Analytics & Automation (Pro Plan)
- **Expense Tracking**: Record and categorize all property-related expenses to get a clear picture of your outgoings.
- **Financial Insights**: An advanced analytics dashboard with trends for revenue, expenses, and profit over the last 12 months. Includes a visual breakdown of expense categories.
- **AI-Powered Alerts**: Get automated alerts for important events like overdue payments, upcoming lease endings, and high vacancy rates.
- **Automated Payment Reminders**: Automatically send notifications to tenants before their rent is due or when it's overdue.
- **Advanced Data Exports**: Export detailed monthly rent roll reports in both **PDF** and **CSV** formats.
- **Full Data Backup**: Export your entire application data (tenants, payments, etc.) as a single JSON file for complete backup.

### Business & Enterprise (Business Plan)
- **Document & Lease Management**: Securely upload and manage critical documents for each tenant, including their **Profile Photo**, **Aadhaar Card**, and **Lease Agreement**.
- **Centralized Document Hub**: A dedicated page to view and access all uploaded documents across all tenants, organized for easy access.
- *(Coming Soon) AI Financial Analyst*: Chat with an AI to get instant answers to complex financial questions about your property.
- *(Coming Soon) Multi-Property Support*: Manage several properties from a single account.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started in VS Code

Follow these steps to get the project up and running on your local machine.

### 1. Open the Project in VS Code

If you haven't already, open the project folder in VS Code.

### 2. Install Dependencies

Next, you need to install all the project's dependencies listed in `package.json`. Open the integrated terminal in VS Code (`Ctrl` + `\``) and run the following command:

```bash
npm install
```

This command will download and install all the necessary libraries into the `node_modules` folder.

### 3. Run the Development Server

Once the dependencies are installed, you can start the local development server. The project uses Next.js with Turbopack for faster development. Run the following command in the terminal:

```bash
npm run dev
```

This will start the application in development mode.

### 4. View the Application

After the server starts, you will see output in the terminal indicating that the app is ready. It will typically look like this:

```
   ▲ Next.js 15.3.3 (Turbopack)
   - Local:        http://localhost:9002
   - Network:      http://0.0.0.0:9002
```

You can now open your web browser and navigate to **http://localhost:9002** to see your application running live. Any changes you make to the source code will automatically reload the page.
