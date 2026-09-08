-- Revenue management migration for Cozygo.
-- Run this after the base HomestayBooking.sql. It is additive and does not delete old data.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS host_subscription_status VARCHAR(30) NULL COMMENT 'TRIAL, ACTIVE, OVERDUE, SUSPENDED',
    ADD COLUMN IF NOT EXISTS host_subscription_expires_at DATE NULL COMMENT 'Ngay het han phi duy tri',
    ADD COLUMN IF NOT EXISTS host_can_receive_booking BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Host co duoc nhan booking moi hay khong';

CREATE TABLE IF NOT EXISTS platform_fee_settings (
    setting_id BIGINT NOT NULL AUTO_INCREMENT,
    setting_name VARCHAR(150) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    monthly_maintenance_fee DECIMAL(14,2) NOT NULL DEFAULT 99000,
    free_trial_days INT NOT NULL DEFAULT 30,
    grace_period_days INT NOT NULL DEFAULT 3,
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    setting_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (setting_id),
    KEY idx_platform_fee_status_date (setting_status, effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO platform_fee_settings (
    setting_name, commission_rate, monthly_maintenance_fee, free_trial_days,
    grace_period_days, effective_from, effective_to, setting_status
)
SELECT 'Phi mac dinh Cozygo', 10.00, 99000, 30, 3, CURRENT_DATE, NULL, 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM platform_fee_settings
    WHERE setting_status = 'ACTIVE'
      AND effective_from <= CURRENT_DATE
      AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
);

CREATE TABLE IF NOT EXISTS booking_commissions (
    commission_id BIGINT NOT NULL AUTO_INCREMENT,
    booking_id INT NOT NULL,
    host_id INT NOT NULL,
    booking_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    refund_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    retained_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    host_receivable_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    cancellation_type VARCHAR(30) NULL,
    refund_status VARCHAR(30) NULL,
    commission_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recognized_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    paid_to_host_at TIMESTAMP NULL,
    payout_reference VARCHAR(150) NULL,
    admin_note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (commission_id),
    UNIQUE KEY uk_booking_commission_booking (booking_id),
    KEY idx_booking_commission_host_status (host_id, commission_status),
    KEY idx_booking_commission_recognized (recognized_at),
    CONSTRAINT fk_booking_commission_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_booking_commission_host FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE booking_commissions
    ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER booking_amount,
    ADD COLUMN IF NOT EXISTS retained_amount DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER refund_amount,
    ADD COLUMN IF NOT EXISTS cancellation_type VARCHAR(30) NULL AFTER host_receivable_amount,
    ADD COLUMN IF NOT EXISTS refund_status VARCHAR(30) NULL AFTER cancellation_type,
    ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP NULL AFTER recognized_at,
    ADD COLUMN IF NOT EXISTS payout_reference VARCHAR(150) NULL AFTER paid_to_host_at;

CREATE TABLE IF NOT EXISTS host_maintenance_fees (
    maintenance_fee_id BIGINT NOT NULL AUTO_INCREMENT,
    host_id INT NOT NULL,
    billing_month TINYINT NOT NULL,
    billing_year SMALLINT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    fee_amount DECIMAL(14,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    payment_method VARCHAR(30) NULL,
    transaction_reference VARCHAR(150) NULL,
    admin_note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (maintenance_fee_id),
    UNIQUE KEY uk_host_maintenance_month (host_id, billing_year, billing_month),
    KEY idx_maintenance_status_due (payment_status, due_date),
    KEY idx_maintenance_host_period (host_id, billing_year, billing_month),
    CONSTRAINT fk_maintenance_host FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
