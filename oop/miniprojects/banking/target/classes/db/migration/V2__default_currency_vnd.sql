-- Convert all existing USD accounts to VND (1 USD ≈ 25,000 VND)
UPDATE bank_accounts
SET balance_amount   = balance_amount * 25000,
    balance_currency = 'VND'
WHERE balance_currency = 'USD';

-- Also fix transaction amounts recorded in USD
UPDATE transactions
SET amount        = amount * 25000,
    balance_after = balance_after * 25000,
    currency      = 'VND'
WHERE currency = 'USD';
