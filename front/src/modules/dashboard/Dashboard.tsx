import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeDollarSign,
  RefreshCw,
  Scale,
  Wallet,
} from "lucide-react";

import { DashboardCard, PageHeader } from "@/components";
import { Alert, Badge, Card, CardContent, CardHeader, Skeleton } from "@/components/ui";
import { extractAxiosError } from "@/utils/extractError";

import {
  useDashboardSummary,
  useDashboardTankStatus,
  useDashboardTodaySalesByFuel,
} from "./queries/useDashboardQueries";
import type {
  DashboardAccountBalance,
  DashboardTankStatus,
  DashboardSalesByCurrency,
  DashboardTodaySalesByFuel,
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
  rows: Array<ReactNode[]>;
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
  const {
    data: tankStatusData,
    isLoading: isTankLoading,
    isError: isTankError,
    error: tankError,
    refetch: refetchTankStatus,
  } = useDashboardTankStatus();
  const {
    data: todaySalesByFuelData,
    isLoading: isSalesByFuelLoading,
    isError: isSalesByFuelError,
    error: salesByFuelError,
    refetch: refetchSalesByFuel,
  } = useDashboardTodaySalesByFuel();

  const cashAccounts = data?.cash_accounts ?? [];
  const exchangeAccounts = data?.exchange_accounts ?? [];
  const todaySales = data?.today_sales;
  const tankStatus = tankStatusData ?? [];
  const todaySalesByFuel = todaySalesByFuelData ?? [];

  const cashTotals = useMemo(() => sumByCurrency(cashAccounts), [cashAccounts]);
  const exchangeTotals = useMemo(() => sumByCurrency(exchangeAccounts), [exchangeAccounts]);

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

  const tankRows = useMemo(
    () => {
      const renderTankMetric = (primary: string, secondary: string) => (
        <div>
          <div className="font-medium text-text-primary">{primary}</div>
          <div className="text-xs text-text-secondary">{secondary}</div>
        </div>
      );

      const renderTankStatus = (item: DashboardTankStatus) => {
        if (item.is_over_capacity) {
          return (
            <Badge variant="error" size="sm">
              Over capacity
            </Badge>
          );
        }
        if (item.is_below_min_level) {
          return (
            <Badge variant="warning" size="sm" dot>
              Low level
            </Badge>
          );
        }
        return (
          <Badge variant="success" size="sm">
            Normal
          </Badge>
        );
      };

      return tankStatus.map((item: DashboardTankStatus) => [
        `${t("Dashboard.table.tank", "Tank")} ${item.tank_number}`,
        item.fuel_type,
        renderTankMetric(
          `${formatAmount(item.capacity_tons)} T`,
          `${formatAmount(item.capacity_liters)} L`
        ),
        renderTankMetric(
          `${formatAmount(item.current_tons)} T`,
          `${formatAmount(item.current_liters)} L`
        ),
        renderTankStatus(item),
      ]);
    },
    [tankStatus, t]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("mis.nav.dashboard", "Dashboard")}
        subtitle={t(
          "Dashboard.text",
          "Track cash flow, tank inventory, and today's sales in one view."
        )}
        actions={[
          {
            label: t("employee.refresh", "Refresh"),
            icon: <RefreshCw className="h-4 w-4" />,
            variant: "outline",
            onClick: () => {
              refetch();
              refetchTankStatus();
              refetchSalesByFuel();
            },
          },
        ]}
      />

      {isError && (
        <Alert variant="error" title={t("Dashboard.errorTitle", "Unable to load dashboard")}>
          {extractAxiosError(error, t("Dashboard.errorText", "Failed to fetch dashboard summary."))}
        </Alert>
      )}

      {isTankError && (
        <Alert variant="error" title={t("Dashboard.errorTankTitle", "Unable to load tank status")}>
          {extractAxiosError(
            tankError,
            t("Dashboard.errorTankText", "Failed to fetch tank inventory status.")
          )}
        </Alert>
      )}

      {isSalesByFuelError && (
        <Alert variant="error" title={t("Dashboard.errorSalesTitle", "Unable to load today sales")}>
          {extractAxiosError(
            salesByFuelError,
            t("Dashboard.errorSalesText", "Failed to fetch today sales by fuel type.")
          )}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
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
              title={t("Dashboard.cards.todaySales", "Today's Sales")}
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

      <div className="grid grid-cols-1 gap-4">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={t("Dashboard.sections.tankInventory", "Tank Inventory Status")}
            subtitle={t(
              "Dashboard.sections.tankInventorySubtitle",
              "Current fuel by tank based on transactions"
            )}
          />
          <CardContent>
            {isTankLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <SummaryTable
                headers={[
                  t("Dashboard.table.tank", "Tank"),
                  t("Dashboard.table.fuel", "Fuel"),
                  t("Dashboard.table.capacity", "Capacity"),
                  t("Dashboard.table.currentFuel", "Current Fuel"),
                  t("Dashboard.table.status", "Status"),
                ]}
                rows={tankRows}
                emptyMessage={t("Dashboard.empty.tankStatus", "No tank inventory data found.")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={t("Dashboard.sections.salesByFuel", "Today Sales by Fuel Type")}
            subtitle={t(
              "Dashboard.sections.salesByFuelSubtitle",
              "Revenue and liters sold per fuel type"
            )}
          />
          <CardContent>
            {isSalesByFuelLoading ? (
              <Skeleton variant="rounded" height={160} />
            ) : todaySalesByFuel.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {todaySalesByFuel.map((item: DashboardTodaySalesByFuel) => (
                  <Card key={item.fuel_name} variant="outlined" padding="sm">
                    <CardHeader title={item.fuel_name} />
                    <CardContent className="space-y-2">
                      <div className="text-sm text-text-secondary">
                        {t("Dashboard.cards.soldToday", "Sold Today")}:{" "}
                        <span className="font-medium text-text-primary">
                          {formatAmount(item.liters_sold_today)} L
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {t("Dashboard.cards.revenue", "Revenue")}:{" "}
                        <span className="font-medium text-text-primary">
                          {formatAmount(item.total_amount_today)}{" "}
                          {todaySales?.base_currency_code || ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                {t("Dashboard.empty.salesByFuel", "No sales recorded today.")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
