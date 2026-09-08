-- Backfill dữ liệu doanh thu admin từ booking thật đã có trước khi thêm chức năng quản lý doanh thu.
-- Script an toàn khi chạy nhiều lần vì booking_commissions có UNIQUE booking_id.

UPDATE booking_commissions
SET commission_status = 'RECOGNIZED',
    recognized_at = COALESCE(recognized_at, paid_to_host_at, updated_at, calculated_at, NOW()),
    updated_at = NOW()
WHERE commission_status = 'PAID_OUT';

UPDATE booking_commissions
SET recognized_at = COALESCE(recognized_at, updated_at, calculated_at, NOW()),
    updated_at = NOW()
WHERE commission_status = 'RECOGNIZED'
  AND recognized_at IS NULL;

INSERT IGNORE INTO booking_commissions (
    booking_id,
    host_id,
    booking_amount,
    refund_amount,
    retained_amount,
    commission_rate,
    commission_amount,
    host_receivable_amount,
    refund_status,
    commission_status,
    calculated_at,
    recognized_at,
    created_at,
    updated_at
)
SELECT
    b.booking_id,
    h.user_id,
    COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) AS booking_amount,
    0,
    COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) AS retained_amount,
    fs.commission_rate,
    ROUND(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) * fs.commission_rate / 100, 0) AS commission_amount,
    GREATEST(
        COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0)
        - ROUND(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) * fs.commission_rate / 100, 0),
        0
    ) AS host_receivable_amount,
    'NONE',
    'RECOGNIZED',
    COALESCE(b.created_at, NOW()),
    COALESCE(b.updated_at, b.created_at, NOW()),
    COALESCE(b.created_at, NOW()),
    NOW()
FROM bookings b
JOIN homestays h ON h.home_id = b.home_id
LEFT JOIN booking_details bd ON bd.booking_id = b.booking_id
LEFT JOIN payments p ON p.payment_id = (
    SELECT MAX(p2.payment_id)
    FROM payments p2
    WHERE p2.booking_id = b.booking_id
)
JOIN platform_fee_settings fs ON fs.setting_id = (
    SELECT fs2.setting_id
    FROM platform_fee_settings fs2
    WHERE fs2.setting_status = 'ACTIVE'
      AND fs2.effective_from <= CURRENT_DATE
      AND (fs2.effective_to IS NULL OR fs2.effective_to >= CURRENT_DATE)
    ORDER BY fs2.effective_from DESC, fs2.setting_id DESC
    LIMIT 1
)
WHERE UPPER(COALESCE(b.booking_status, '')) IN ('COMPLETED', 'DONE', 'FINISHED')
  AND (
      UPPER(COALESCE(b.payment_method, '')) = 'PAY_AT_PROPERTY'
      OR UPPER(COALESCE(b.payment_status, '')) IN ('PAID', 'SUCCESS', 'COMPLETED', 'DA_THANH_TOAN')
      OR UPPER(COALESCE(p.payment_status, '')) IN ('PAID', 'SUCCESS', 'COMPLETED', 'DA_THANH_TOAN')
  )
  AND COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) > 0;

UPDATE booking_commissions bc
JOIN bookings b ON b.booking_id = bc.booking_id
JOIN homestays h ON h.home_id = b.home_id
LEFT JOIN booking_details bd ON bd.booking_id = b.booking_id
LEFT JOIN payments p ON p.payment_id = (
    SELECT MAX(p2.payment_id)
    FROM payments p2
    WHERE p2.booking_id = b.booking_id
)
JOIN platform_fee_settings fs ON fs.setting_id = (
    SELECT fs2.setting_id
    FROM platform_fee_settings fs2
    WHERE fs2.setting_status = 'ACTIVE'
      AND fs2.effective_from <= CURRENT_DATE
      AND (fs2.effective_to IS NULL OR fs2.effective_to >= CURRENT_DATE)
    ORDER BY fs2.effective_from DESC, fs2.setting_id DESC
    LIMIT 1
)
SET bc.host_id = h.user_id,
    bc.booking_amount = COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0),
    bc.refund_amount = 0,
    bc.retained_amount = COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0),
    bc.commission_rate = CASE WHEN bc.commission_rate IS NULL OR bc.commission_rate = 0 THEN fs.commission_rate ELSE bc.commission_rate END,
    bc.commission_amount = ROUND(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) * (CASE WHEN bc.commission_rate IS NULL OR bc.commission_rate = 0 THEN fs.commission_rate ELSE bc.commission_rate END) / 100, 0),
    bc.host_receivable_amount = GREATEST(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) - ROUND(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) * (CASE WHEN bc.commission_rate IS NULL OR bc.commission_rate = 0 THEN fs.commission_rate ELSE bc.commission_rate END) / 100, 0), 0),
    bc.refund_status = 'NONE',
    bc.commission_status = 'RECOGNIZED',
    bc.recognized_at = COALESCE(bc.recognized_at, b.updated_at, b.created_at, NOW()),
    bc.updated_at = NOW()
WHERE bc.commission_status = 'PENDING'
  AND UPPER(COALESCE(b.booking_status, '')) IN ('COMPLETED', 'DONE', 'FINISHED')
  AND (
      UPPER(COALESCE(b.payment_method, '')) = 'PAY_AT_PROPERTY'
      OR UPPER(COALESCE(b.payment_status, '')) IN ('PAID', 'SUCCESS', 'COMPLETED', 'DA_THANH_TOAN')
      OR UPPER(COALESCE(p.payment_status, '')) IN ('PAID', 'SUCCESS', 'COMPLETED', 'DA_THANH_TOAN')
  )
  AND COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) > 0;

UPDATE booking_commissions bc
JOIN bookings b ON b.booking_id = bc.booking_id
SET bc.refund_amount = bc.booking_amount,
    bc.retained_amount = 0,
    bc.commission_amount = 0,
    bc.host_receivable_amount = 0,
    bc.commission_status = 'CANCELLED',
    bc.refund_status = 'REFUNDED',
    bc.updated_at = NOW()
WHERE UPPER(COALESCE(b.booking_status, '')) IN ('CANCELLED', 'CANCELED', 'CANCELLED_BY_HOST', 'REJECTED', 'EXPIRED', 'DELETED');
-- Bổ sung cho dữ liệu cũ: đơn CONFIRMED đã thanh toán và đã qua ngày trả phòng
-- được ghi nhận như booking hoàn thành thực tế để thống kê doanh thu.
INSERT IGNORE INTO booking_commissions (
    booking_id,
    host_id,
    booking_amount,
    refund_amount,
    retained_amount,
    commission_rate,
    commission_amount,
    host_receivable_amount,
    refund_status,
    commission_status,
    calculated_at,
    recognized_at,
    created_at,
    updated_at
)
SELECT
    b.booking_id,
    h.user_id,
    COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0),
    0,
    COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0),
    fs.commission_rate,
    ROUND(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) * fs.commission_rate / 100, 0),
    GREATEST(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) - ROUND(COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) * fs.commission_rate / 100, 0), 0),
    'NONE',
    'RECOGNIZED',
    COALESCE(b.created_at, NOW()),
    COALESCE(b.updated_at, b.created_at, NOW()),
    COALESCE(b.created_at, NOW()),
    NOW()
FROM bookings b
JOIN homestays h ON h.home_id = b.home_id
LEFT JOIN booking_details bd ON bd.booking_id = b.booking_id
LEFT JOIN payments p ON p.payment_id = (
    SELECT MAX(p2.payment_id)
    FROM payments p2
    WHERE p2.booking_id = b.booking_id
)
JOIN platform_fee_settings fs ON fs.setting_id = (
    SELECT fs2.setting_id
    FROM platform_fee_settings fs2
    WHERE fs2.setting_status = 'ACTIVE'
      AND fs2.effective_from <= CURRENT_DATE
      AND (fs2.effective_to IS NULL OR fs2.effective_to >= CURRENT_DATE)
    ORDER BY fs2.effective_from DESC, fs2.setting_id DESC
    LIMIT 1
)
WHERE UPPER(COALESCE(b.booking_status, '')) = 'CONFIRMED'
  AND bd.checkout_date <= CURRENT_DATE
  AND (
      UPPER(COALESCE(b.payment_status, '')) IN ('PAID', 'SUCCESS', 'COMPLETED', 'DA_THANH_TOAN')
      OR UPPER(COALESCE(p.payment_status, '')) IN ('PAID', 'SUCCESS', 'COMPLETED', 'DA_THANH_TOAN')
  )
  AND COALESCE(NULLIF(p.amount, 0), NULLIF(b.total_price, 0), NULLIF(b.subtotal, 0), NULLIF(bd.line_total, 0), 0) > 0;
