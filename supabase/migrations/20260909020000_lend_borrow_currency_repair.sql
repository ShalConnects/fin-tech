-- Repair lend_borrow rows damaged by the record-only currency overwrite bug.
--
-- LendBorrowForm seeded the edit form with the user's default account whenever a
-- record had no account of its own, then derived `currency` from that account.
-- Editing a record-only entry therefore rewrote `currency` to the default
-- account's currency and stamped `account_id` onto a row that is supposed to
-- have none. Amounts were never converted, so only the labels need restoring.
--
-- The currency dropdown was disabled for all edits, so a user could never change
-- a currency intentionally. Every currency change recorded in audit_logs for a
-- record-only row is therefore this bug, which makes the audit trail a safe
-- source for the original values.

-- Snapshot the affected rows so this migration can be reversed.
CREATE TABLE IF NOT EXISTS lend_borrow_currency_repair_backup AS
SELECT *, NOW() AS backed_up_at
FROM lend_borrow
WHERE affect_account_balance = false
  AND account_id IS NOT NULL;

-- 1. Restore the currency captured before the first flip on each record.
WITH original AS (
    SELECT DISTINCT ON (entity_id)
           entity_id,
           old_values->>'currency' AS original_currency
    FROM audit_logs
    WHERE entity_type = 'lend_borrow'
      AND action_type = 'update'
      AND old_values->>'currency' IS DISTINCT FROM new_values->>'currency'
      AND old_values->>'currency' IS NOT NULL
    ORDER BY entity_id, created_at ASC
)
UPDATE lend_borrow lb
SET currency = o.original_currency
FROM original o
WHERE lb.id = o.entity_id
  AND lb.affect_account_balance = false
  AND lb.currency IS DISTINCT FROM o.original_currency;

-- 2. Drop the account linkage the form injected. A record-only entry must not
--    carry an account_id; the settlement modal filters accounts on it.
UPDATE lend_borrow
SET account_id = NULL
WHERE affect_account_balance = false
  AND account_id IS NOT NULL;

-- Verify: both queries should return zero rows.
SELECT 'still contradictory' AS check, id, person_name, currency, account_id
FROM lend_borrow
WHERE affect_account_balance = false
  AND account_id IS NOT NULL;

SELECT 'currency still wrong' AS check, lb.id, lb.person_name, lb.currency
FROM lend_borrow lb
JOIN (
    SELECT DISTINCT ON (entity_id)
           entity_id, old_values->>'currency' AS original_currency
    FROM audit_logs
    WHERE entity_type = 'lend_borrow'
      AND action_type = 'update'
      AND old_values->>'currency' IS DISTINCT FROM new_values->>'currency'
    ORDER BY entity_id, created_at ASC
) o ON o.entity_id = lb.id
WHERE lb.currency IS DISTINCT FROM o.original_currency;
