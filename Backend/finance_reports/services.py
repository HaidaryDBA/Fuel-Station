from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from django.db.models import DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from financial.models import Account, FinancialTransaction


TWO_DECIMAL_PLACES = Decimal('0.01')


def _decimal_value(value=Decimal('0.00')):
    return Value(value, output_field=DecimalField(max_digits=18, decimal_places=2))


def _quantize(value: Decimal) -> Decimal:
    if value is None:
        return Decimal('0.00')
    if not isinstance(value, Decimal):
        value = Decimal(str(value))
    return value.quantize(TWO_DECIMAL_PLACES, rounding=ROUND_HALF_UP)


def _parse_date(value: Optional[str]):
    if not value:
        return None
    return timezone.datetime.strptime(value, '%Y-%m-%d').date()


def _apply_date_range(queryset, date_from: Optional[date], date_to: Optional[date]):
    if date_from is not None:
        queryset = queryset.filter(date_time__date__gte=date_from)
    if date_to is not None:
        queryset = queryset.filter(date_time__date__lte=date_to)
    return queryset


def get_account_balance_report(filters: dict):
    account_id = filters.get('account_id')
    if account_id not in (None, ''):
        account_id = int(account_id)
    as_of_date = _parse_date(filters.get('end_date')) or timezone.localdate()

    accounts = Account.objects.select_related('currency').all().order_by('name', 'id')
    if account_id:
        accounts = accounts.filter(id=account_id)

    transactions = FinancialTransaction.objects.filter(date_time__date__lte=as_of_date)

    rows = []
    for account in accounts:
        incoming = (
            transactions.filter(
                Q(transaction_type=FinancialTransaction.TYPE_DEPOSIT, to_account=account)
                | Q(transaction_type=FinancialTransaction.TYPE_TRANSFER, to_account=account)
            )
            .aggregate(
                total=Coalesce(
                    Sum('amount'),
                    _decimal_value(),
                    output_field=DecimalField(max_digits=18, decimal_places=2),
                )
            )
            .get('total')
        )
        outgoing = (
            transactions.filter(
                Q(transaction_type=FinancialTransaction.TYPE_WITHDRAW, from_account=account)
                | Q(transaction_type=FinancialTransaction.TYPE_TRANSFER, from_account=account)
            )
            .aggregate(
                total=Coalesce(
                    Sum('amount'),
                    _decimal_value(),
                    output_field=DecimalField(max_digits=18, decimal_places=2),
                )
            )
            .get('total')
        )

        balance = _quantize(incoming - outgoing)
        rows.append(
            {
                'account_id': account.id,
                'account': account.name,
                'currency': account.currency.code,
                'balance': balance,
            }
        )

    return rows


def get_money_flow_report(filters: dict):
    account_id = filters.get('account_id')
    if account_id not in (None, ''):
        account_id = int(account_id)
    date_from = _parse_date(filters.get('start_date'))
    date_to = _parse_date(filters.get('end_date'))

    queryset = FinancialTransaction.objects.select_related('from_account', 'to_account', 'currency')
    queryset = _apply_date_range(queryset, date_from, date_to)
    if account_id:
        queryset = queryset.filter(Q(from_account_id=account_id) | Q(to_account_id=account_id))

    results = []
    for transaction in queryset.order_by('-date_time', '-id'):
        if transaction.transaction_type == FinancialTransaction.TYPE_DEPOSIT:
            account_label = transaction.to_account.name if transaction.to_account else '-'
        elif transaction.transaction_type == FinancialTransaction.TYPE_WITHDRAW:
            account_label = transaction.from_account.name if transaction.from_account else '-'
        else:
            source = transaction.from_account.name if transaction.from_account else '-'
            target = transaction.to_account.name if transaction.to_account else '-'
            account_label = f'{source} -> {target}'

        results.append(
            {
                'date': transaction.date_time,
                'transaction_type': transaction.transaction_type,
                'amount': _quantize(transaction.amount),
                'currency': transaction.currency.code,
                'account': account_label,
                'description': transaction.description or '',
            }
        )

    return results
