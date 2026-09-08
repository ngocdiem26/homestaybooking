-- Simplify admin revenue statistics without deleting legacy data.
-- Legacy PAID_OUT commissions are treated as recognized revenue in the new admin revenue screen.
UPDATE booking_commissions
SET commission_status = 'RECOGNIZED',
    updated_at = CURRENT_TIMESTAMP
WHERE commission_status = 'PAID_OUT';

ALTER TABLE booking_commissions
MODIFY COLUMN commission_status VARCHAR(30)
NOT NULL DEFAULT 'PENDING'
COMMENT 'PENDING, RECOGNIZED, CANCELLED';
