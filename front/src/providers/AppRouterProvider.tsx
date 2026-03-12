import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { AuthGuard } from "@/providers";
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/modules/auth/index";
import NotFoundPage from "@/pages/PageNotFounded";
import { MISLayout } from "@/components";
import { Dashboard } from "@/modules/dashboard";
import { GeneralSettings, SettingsOverview, UserManagement } from "@settings/index";
import { UserProfile } from "@/modules/profile";
import { EmployeeDetailPage, EmployeeFormPage, EmployeesListPage } from "@/modules/employees";
import { CustomerDetailPage, CustomerFormPage, CustomersListPage } from "@/modules/customers";
import {
  PartnerDetailPage,
  PartnerFormPage,
  PartnersListPage,
  PartnersProvider,
} from "@/modules/partners";
import {
  FuelsListPage,
  FuelFormPage,
  FuelDetailPage,
  TankStoragesListPage,
  TankStorageFormPage,
  TankStorageDetailPage,
  MotorsListPage,
  MotorFormPage,
  MotorDetailPage,
  PricesListPage,
  PriceFormPage,
  PriceDetailPage,
  TransactionsListPage,
  TransactionFormPage,
  TransactionDetailPage,
} from "@/modules/inventory";
import {
  AccountFormPage,
  AccountsListPage,
  CurrenciesListPage,
  CurrencyFormPage,
  CurrencyRateFormPage,
  CurrencyRatesListPage,
  ExpenseDetailPage,
  ExpenseFormPage,
  ExpensesListPage,
  FinancialTransactionDetailPage,
  FinancialTransactionFormPage,
  FinancialTransactionsListPage,
  PartnerDebtDetailPage,
  PartnerDebtFormPage,
  PartnerDebtsListPage,
  SalaryDetailPage,
  SalaryFormPage,
  SalariesListPage,
} from "@/modules/financial";
import {
  OrderPurchaseDetailPage,
  OrderPurchaseFormPage,
  OrderPurchasesListPage,
  PurchaseDetailPage,
  PurchaseFormPage,
  PurchasesListPage,
  SupplierDetailPage,
  SupplierFormPage,
  SuppliersListPage,
} from "@/modules/purchasing";
import {
  LendingFormPage,
  LendingsListPage,
  SaleFormPage,
  SalesListPage,
} from "@/modules/sales";
import { SalesReportsPage, InventoryReportsPage, FinanceReportsPage } from "@/modules/reports";

function LegacyCustomerDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/employees/customers/${id}` : "/employees/customers"} replace />;
}

function LegacyCustomerEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/employees/customers/${id}/edit` : "/employees/customers"} replace />;
}

function LegacyPartnerDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/employees/partners/${id}` : "/employees/partners"} replace />;
}

function LegacyPartnerEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/employees/partners/${id}/edit` : "/employees/partners"} replace />;
}

function AppRouterProvider() {
  const router = createBrowserRouter([
    // Public Website Routes (CMS)
    {
      path: "/",
      element: (
        <AuthGuard>
          <MISLayout />
        </AuthGuard>
      ),
      errorElement: <NotFoundPage />,
      children: [
        // Dashboard
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        // Settings
        { path: "settings", element: <SettingsOverview /> },
        { path: "settings/general", element: <GeneralSettings /> },
        { path: "settings/users", element: <UserManagement /> },

        // Profile
        { path: "profile", element: <UserProfile /> },

        // Employees
        { path: "employees", element: <EmployeesListPage /> },
        { path: "employees/new", element: <EmployeeFormPage /> },
        { path: "employees/:id", element: <EmployeeDetailPage /> },
        { path: "employees/:id/edit", element: <EmployeeFormPage /> },

        // Customers
        { path: "employees/customers", element: <CustomersListPage /> },
        { path: "employees/customers/new", element: <CustomerFormPage /> },
        { path: "employees/customers/:id", element: <CustomerDetailPage /> },
        { path: "employees/customers/:id/edit", element: <CustomerFormPage /> },

        // Partners
        {
          path: "employees/partners",
          element: (
            <PartnersProvider>
              <PartnersListPage />
            </PartnersProvider>
          ),
        },
        {
          path: "employees/partners/new",
          element: (
            <PartnersProvider>
              <PartnerFormPage />
            </PartnersProvider>
          ),
        },
        {
          path: "employees/partners/:id",
          element: (
            <PartnersProvider>
              <PartnerDetailPage />
            </PartnersProvider>
          ),
        },
        {
          path: "employees/partners/:id/edit",
          element: (
            <PartnersProvider>
              <PartnerFormPage />
            </PartnersProvider>
          ),
        },

        // Fuel/Inventory
        { path: "fuel/fuels", element: <FuelsListPage /> },
        { path: "fuel/fuels/new", element: <FuelFormPage /> },
        { path: "fuel/fuels/:id", element: <FuelDetailPage /> },
        { path: "fuel/fuels/:id/edit", element: <FuelFormPage /> },
        { path: "fuel/tanks", element: <TankStoragesListPage /> },
        { path: "fuel/tanks/new", element: <TankStorageFormPage /> },
        { path: "fuel/tanks/:id", element: <TankStorageDetailPage /> },
        { path: "fuel/tanks/:id/edit", element: <TankStorageFormPage /> },
        { path: "fuel/motors", element: <MotorsListPage /> },
        { path: "fuel/motors/new", element: <MotorFormPage /> },
        { path: "fuel/motors/:id", element: <MotorDetailPage /> },
        { path: "fuel/motors/:id/edit", element: <MotorFormPage /> },
        { path: "fuel/prices", element: <PricesListPage /> },
        { path: "fuel/prices/new", element: <PriceFormPage /> },
        { path: "fuel/prices/:id", element: <PriceDetailPage /> },
        { path: "fuel/prices/:id/edit", element: <PriceFormPage /> },
        { path: "fuel/transactions", element: <TransactionsListPage /> },
        { path: "fuel/transactions/new", element: <TransactionFormPage /> },
        { path: "fuel/transactions/:id", element: <TransactionDetailPage /> },
        { path: "fuel/transactions/:id/edit", element: <TransactionFormPage /> },
        { path: "fuel", element: <Navigate to="/fuel/fuels" replace /> },

        // Finance
        { path: "finance/accounts", element: <AccountsListPage /> },
        { path: "finance/accounts/new", element: <AccountFormPage /> },
        { path: "finance/accounts/:id/edit", element: <AccountFormPage /> },
        { path: "finance/currencies", element: <CurrenciesListPage /> },
        { path: "finance/currencies/new", element: <CurrencyFormPage /> },
        { path: "finance/currencies/:id/edit", element: <CurrencyFormPage /> },
        { path: "finance/currency-rates", element: <CurrencyRatesListPage /> },
        { path: "finance/currency-rates/new", element: <CurrencyRateFormPage /> },
        { path: "finance/currency-rates/:id/edit", element: <CurrencyRateFormPage /> },
        { path: "finance/salaries", element: <SalariesListPage /> },
        { path: "finance/salaries/new", element: <SalaryFormPage /> },
        { path: "finance/salaries/:id", element: <SalaryDetailPage /> },
        { path: "finance/salaries/:id/edit", element: <SalaryFormPage /> },
        { path: "finance/expenses", element: <ExpensesListPage /> },
        { path: "finance/expenses/new", element: <ExpenseFormPage /> },
        { path: "finance/expenses/:id", element: <ExpenseDetailPage /> },
        { path: "finance/expenses/:id/edit", element: <ExpenseFormPage /> },
        { path: "finance/partner-debts", element: <PartnerDebtsListPage /> },
        { path: "finance/partner-debts/new", element: <PartnerDebtFormPage /> },
        { path: "finance/partner-debts/:id", element: <PartnerDebtDetailPage /> },
        { path: "finance/partner-debts/:id/edit", element: <PartnerDebtFormPage /> },
        { path: "finance/transactions", element: <FinancialTransactionsListPage /> },
        { path: "finance/transactions/new", element: <FinancialTransactionFormPage /> },
        { path: "finance/transactions/:id", element: <FinancialTransactionDetailPage /> },
        { path: "finance/transactions/:id/edit", element: <FinancialTransactionFormPage /> },
        { path: "finance", element: <Navigate to="/finance/currencies" replace /> },

        // Purchasing
        { path: "purchasing/suppliers", element: <SuppliersListPage /> },
        { path: "purchasing/suppliers/new", element: <SupplierFormPage /> },
        { path: "purchasing/suppliers/:id", element: <SupplierDetailPage /> },
        { path: "purchasing/suppliers/:id/edit", element: <SupplierFormPage /> },
        { path: "purchasing/purchases", element: <PurchasesListPage /> },
        { path: "purchasing/purchases/new", element: <PurchaseFormPage /> },
        { path: "purchasing/purchases/:id", element: <PurchaseDetailPage /> },
        { path: "purchasing/purchases/:id/edit", element: <PurchaseFormPage /> },
        { path: "purchasing/orders", element: <OrderPurchasesListPage /> },
        { path: "purchasing/orders/new", element: <OrderPurchaseFormPage /> },
        { path: "purchasing/orders/:id", element: <OrderPurchaseDetailPage /> },
        { path: "purchasing/orders/:id/edit", element: <OrderPurchaseFormPage /> },
        { path: "purchasing", element: <Navigate to="/purchasing/purchases" replace /> },

        // Sales
        { path: "sales/sales", element: <SalesListPage /> },
        { path: "sales/sales/new", element: <SaleFormPage /> },
        { path: "sales/sales/:id/edit", element: <SaleFormPage /> },
        { path: "sales/lendings", element: <LendingsListPage /> },
        { path: "sales/lendings/new", element: <LendingFormPage /> },
        { path: "sales/lendings/:id/edit", element: <LendingFormPage /> },
        { path: "sales", element: <Navigate to="/sales/sales" replace /> },

        // Reports
        { path: "mis/reports/sales", element: <SalesReportsPage /> },
        { path: "mis/reports/inventory", element: <InventoryReportsPage /> },
        { path: "mis/reports/finance", element: <FinanceReportsPage /> },

        // Legacy aliases
        { path: "customers", element: <Navigate to="/employees/customers" replace /> },
        { path: "customers/new", element: <Navigate to="/employees/customers/new" replace /> },
        { path: "customers/:id", element: <LegacyCustomerDetailRedirect /> },
        { path: "customers/:id/edit", element: <LegacyCustomerEditRedirect /> },
        { path: "partners", element: <Navigate to="/employees/partners" replace /> },
        { path: "partners/new", element: <Navigate to="/employees/partners/new" replace /> },
        { path: "partners/:id", element: <LegacyPartnerDetailRedirect /> },
        { path: "partners/:id/edit", element: <LegacyPartnerEditRedirect /> },
      ],
    },

    // MIS Auth Routes (Public)
    {
      path: "/auth/login",
      element: <LoginPage />,
    },
    {
      path: "/auth/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/auth/reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "/auth/verify-email/:token",
      element: <VerifyEmailPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouterProvider;
