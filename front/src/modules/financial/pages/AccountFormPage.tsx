import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import AccountForm from '../components/AccountForm';
import {
  useAccountDetail,
  useCreateAccount,
  useCurrenciesList,
  useUpdateAccount,
} from '../queries/useFinancialQueries';
import type { AccountFormValues } from '../types/financial';

export default function AccountFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: account, isLoading: isLoadingAccount, isError } = useAccountDetail(parsedId, isEditMode);
  const { data: currenciesData } = useCurrenciesList();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount(parsedId);

  const initialValues: Partial<AccountFormValues> | undefined = account
    ? {
        name: account.name,
        account_type: account.account_type,
        currency: account.currency,
        is_active: account.is_active,
        description: account.description,
      }
    : undefined;

  const handleSubmit = async (values: AccountFormValues) => {
    if (isEditMode) {
      await updateAccountMutation.mutateAsync(values);
      navigate('/finance/accounts');
      return;
    }

    await createAccountMutation.mutateAsync(values);
    navigate('/finance/accounts');
  };

  if (isEditMode && isLoadingAccount) {
    return (
      <Card>
        <CardContent>{t('financial.loadingAccountForm', 'Loading account form data...')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !account)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.accountNotFound', 'Account not found.')}</p>
          <Button variant="outline" onClick={() => navigate('/finance/accounts')}>
            {t('financial.backToAccounts', 'Back to accounts')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('financial.editAccount', 'Edit Account') : t('financial.addAccount', 'Add Account')}
        subtitle={
          isEditMode
            ? t('financial.editAccountSubtitle', 'Update account information')
            : t('financial.addAccountSubtitle', 'Create a new finance account')
        }
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/accounts'),
          },
        ]}
      />

      <AccountForm
        initialValues={initialValues}
        currencies={currenciesData?.results ?? []}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/accounts')}
        isSubmitting={createAccountMutation.isPending || updateAccountMutation.isPending}
        submitLabel={isEditMode ? t('financial.update') : t('financial.create')}
      />
    </div>
  );
}
