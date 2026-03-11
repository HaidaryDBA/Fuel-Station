import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeDollarSign,
  Fuel,
  RefreshCw,
  Scale,
  Wallet,
} from "lucide-react";

import { DashboardCard, PageHeader } from "@/components";
import { Alert, Card, CardContent, CardHeader, Skeleton } from "@/components/ui";
import { extractAxiosError } from "@/utils/extractError";

import { useDashboardSummary } from "./queries/useDashboardQueries";
import type {
  DashboardAccountBalance,
  DashboardFuelInventory,
  DashboardSalesByCurrency,
} from "./types/dashboard";

const formatAmount = (value?: string | number) => Number(value || 0).toFixed(2);

const sumByCurrency = (accounts: DashboardAccountBalance[]) => {
  return accounts.reduce<Record<string, number>>((totals, account) => {
    const amount = Number(account.balance || 0);
    totals[account.currency] = (totals[account.currency] || 0) + amount;
    return totals;
  }, {});
};

function SummaryTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: Array<(string | number)[]>;
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-text-secondary">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead>
          <tr className="bg-surface/40">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-medium text-text-secondary">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-surface/20">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-text-primary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();

  const cashAccounts = data?.cash_accounts ?? [];
  const exchangeAccounts = data?.exchange_accounts ?? [];
  const fuelInventory = data?.fuel_inventory ?? [];
  const todaySales = data?.today_sales;

  const cashTotals = useMemo(() => sumByCurrency(cashAccounts), [cashAccounts]);
  const exchangeTotals = useMemo(() => sumByCurrency(exchangeAccounts), [exchangeAccounts]);

  const totalFuelLiters = useMemo(
    () => fuelInventory.reduce((sum, item) => sum + Number(item.liters || 0), 0),
    [fuelInventory]
  );

  const salesByCurrencyRows = useMemo(
    () =>
      (todaySales?.total_amount_by_currency ?? []).map(
        (row: DashboardSalesByCurrency) => [
          row.currency,
          `${formatAmount(row.amount)} ${row.currency}`,
        ]
      ),
    [todaySales?.total_amount_by_currency]
  );

  const cashRows = useMemo(
    () =>
      cashAccounts.map((account: DashboardAccountBalance) => [
        account.account_name,
        `${formatAmount(account.balance)} ${account.currency}`,
      ]),
    [cashAccounts]
  );

  const exchangeRows = useMemo(
    () =>
      exchangeAccounts.map((account: DashboardAccountBalance) => [
        account.account_name,
        `${formatAmount(account.balance)} ${account.currency}`,
      ]),
    [exchangeAccounts]
  );

  const fuelRows = useMemo(
    () =>
      fuelInventory.map((item: DashboardFuelInventory) => [
        item.fuel,
        `${formatAmount(item.liters)} L`,
      ]),
    [fuelInventory]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("mis.nav.dashboard", "Dashboard")}
        subtitle={t(
          "Dashboard.text",
          "Track cash flow, fuel inventory, and today’s sales in one view."
        )}
        actions={[
          {
            label: t("employee.refresh", "Refresh"),
            icon: <RefreshCw className="h-4 w-4" />,
            variant: "outline",
            onClick: () => refetch(),
          },
        ]}
      />

      {isError && (
        <Alert variant="error" title={t("Dashboard.errorTitle", "Unable to load dashboard")}>
          {extractAxiosError(error, t("Dashboard.errorText", "Failed to fetch dashboard summary."))}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={120} />
          ))
        ) : (
          <>
            <DashboardCard
              title={t("Dashboard.cards.cashAccounts", "Cash Accounts")}
              value={cashAccounts.length}
              icon={Wallet}
              color="info"
              subtitle={t("Dashboard.cards.cashAccountsSubtitle", "Active cash accounts")}
            />
            <DashboardCard
              title={t("Dashboard.cards.exchangeAccounts", "Exchange Accounts")}
              value={exchangeAccounts.length}
              icon={Wallet}
              color="warning"
              subtitle={t("Dashboard.cards.exchangeAccountsSubtitle", "Active exchange accounts")}
            />
            <DashboardCard
              title={t("Dashboard.cards.fuelTypes", "Fuel Types")}
              value={fuelInventory.length}
              icon={Fuel}
              color="success"
              subtitle={t("Dashboard.cards.fuelTypesSubtitle", "Inventory categories")}
            />
            <DashboardCard
              title={t("Dashboard.cards.totalFuel", "Total Fuel")}
              value={`${formatAmount(totalFuelLiters)} L`}
              icon={Fuel}
              color="primary"
              subtitle={t("Dashboard.cards.totalFuelSubtitle", "All tanks combined")}
            />
            <DashboardCard
              title={t("Dashboard.cards.todaySales", "Today’s Sales")}
              value={
                todaySales
                  ? `${formatAmount(todaySales.total_amount_base)} ${todaySales.base_currency_code || ""}`.trim()
                  : formatAmount(0)
              }
              icon={BadgeDollarSign}
              color="success"
              subtitle={`${formatAmount(todaySales?.total_liters)} L`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={t("Dashboard.sections.cash", "Cash Accounts")}
            subtitle={t("Dashboard.sections.cashSubtitle", "Balances by account and currency")}
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <>
                <SummaryTable
                  headers={[t("Dashboard.table.account", "Account"), t("Dashboard.table.balance", "Balance")]}
                  rows={cashRows}
                  emptyMessage={t("Dashboard.empty.cashAccounts", "No cash accounts found.")}
                />
                {Object.keys(cashTotals).length > 0 && (
                  <div className="mt-4 text-sm text-text-secondary">
                    {Object.entries(cashTotals).map(([currency, amount]) => (
                      <span key={currency} className="mr-4">
                        {currency}: {formatAmount(amount)}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={t("Dashboard.sections.exchange", "Exchange Accounts")}
            subtitle={t("Dashboard.sections.exchangeSubtitle", "Exchange balances by currency")}
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <>
                <SummaryTable
                  headers={[t("Dashboard.table.account", "Account"), t("Dashboard.table.balance", "Balance")]}
                  rows={exchangeRows}
                  emptyMessage={t("Dashboard.empty.exchangeAccounts", "No exchange accounts found.")}
                />
                {Object.keys(exchangeTotals).length > 0 && (
                  <div className="mt-4 text-sm text-text-secondary">
                    {Object.entries(exchangeTotals).map(([currency, amount]) => (
                      <span key={currency} className="mr-4">
                        {currency}: {formatAmount(amount)}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={t("Dashboard.sections.inventory", "Fuel Inventory")}
            subtitle={t("Dashboard.sections.inventorySubtitle", "Total liters by fuel type")}
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <SummaryTable
                headers={[t("Dashboard.table.fuel", "Fuel"), t("Dashboard.table.liters", "Liters")]}
                rows={fuelRows}
                emptyMessage={t("Dashboard.empty.fuelInventory", "No inventory data found.")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={t("Dashboard.sections.sales", "Today’s Sales")}
            subtitle={t("Dashboard.sections.salesSubtitle", "Totals grouped by currency")}
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <>
                <SummaryTable
                  headers={[t("Dashboard.table.currency", "Currency"), t("Dashboard.table.amount", "Amount")]}
                  rows={salesByCurrencyRows}
                  emptyMessage={t("Dashboard.empty.sales", "No sales recorded today.")}
                />
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {t("Dashboard.labels.totalLiters", "Total liters")}: {formatAmount(todaySales?.total_liters)} L
                  </span>
                  <span className="flex items-center gap-1">
                    <BadgeDollarSign className="h-4 w-4" />
                    {t("Dashboard.labels.baseTotal", "Base total")}:{" "}
                    {formatAmount(todaySales?.total_amount_base)} {todaySales?.base_currency_code || ""}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
