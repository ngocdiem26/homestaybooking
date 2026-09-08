// package com.homestaybooking.repository;

// import com.homestaybooking.dto.response.*;
// import com.homestaybooking.exception.AppException;
// import jakarta.annotation.PostConstruct;
// import lombok.Builder;
// import lombok.Data;
// import lombok.RequiredArgsConstructor;
// import org.springframework.dao.EmptyResultDataAccessException;
// import org.springframework.jdbc.core.JdbcTemplate;
// import org.springframework.stereotype.Repository;

// import java.math.BigDecimal;
// import java.math.RoundingMode;
// import java.sql.Date;
// import java.sql.ResultSet;
// import java.sql.SQLException;
// import java.sql.Timestamp;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.time.YearMonth;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Locale;

// @Repository
// @RequiredArgsConstructor
// public class RevenueJdbcRepository {
//     private final JdbcTemplate jdbcTemplate;

//     @PostConstruct
//     public void ensureRevenueSchema() {
//         try {
//             addColumnIfMissing("users", "host_subscription_status", "VARCHAR(30) NULL");
//             addColumnIfMissing("users", "host_subscription_expires_at", "DATE NULL");
//             addColumnIfMissing("users", "host_can_receive_booking", "BOOLEAN NOT NULL DEFAULT TRUE");
//             jdbcTemplate.execute("create table if not exists platform_fee_settings (setting_id bigint not null auto_increment, setting_name varchar(150) not null, commission_rate decimal(5,2) not null default 10.00, monthly_maintenance_fee decimal(14,2) not null default 99000, free_trial_days int not null default 30, grace_period_days int not null default 3, effective_from date not null, effective_to date null, setting_status varchar(30) not null default 'ACTIVE', created_at timestamp not null default current_timestamp, updated_at timestamp null default null on update current_timestamp, primary key (setting_id), key idx_platform_fee_status_date (setting_status, effective_from, effective_to)) engine=InnoDB default character set=utf8mb4 collate=utf8mb4_unicode_ci");
//             jdbcTemplate.execute("create table if not exists booking_commissions (commission_id bigint not null auto_increment, booking_id int not null, host_id int not null, booking_amount decimal(14,2) not null default 0, refund_amount decimal(14,2) not null default 0, retained_amount decimal(14,2) not null default 0, commission_rate decimal(5,2) not null, commission_amount decimal(14,2) not null default 0, host_receivable_amount decimal(14,2) not null default 0, cancellation_type varchar(30) null, refund_status varchar(30) null, commission_status varchar(30) not null default 'PENDING', calculated_at timestamp not null default current_timestamp, recognized_at timestamp null, refunded_at timestamp null, paid_to_host_at timestamp null, payout_reference varchar(150) null, admin_note text null, created_at timestamp not null default current_timestamp, updated_at timestamp null default null on update current_timestamp, primary key (commission_id), unique key uk_booking_commission_booking (booking_id), key idx_booking_commission_host_status (host_id, commission_status), key idx_booking_commission_recognized (recognized_at)) engine=InnoDB default character set=utf8mb4 collate=utf8mb4_unicode_ci");
//             addColumnIfMissing("booking_commissions", "refund_amount", "DECIMAL(14,2) NOT NULL DEFAULT 0");
//             addColumnIfMissing("booking_commissions", "retained_amount", "DECIMAL(14,2) NOT NULL DEFAULT 0");
//             addColumnIfMissing("booking_commissions", "cancellation_type", "VARCHAR(30) NULL");
//             addColumnIfMissing("booking_commissions", "refund_status", "VARCHAR(30) NULL");
//             addColumnIfMissing("booking_commissions", "refunded_at", "TIMESTAMP NULL");
//             addColumnIfMissing("booking_commissions", "payout_reference", "VARCHAR(150) NULL");
//             migratePaidOutCommissions();
//             jdbcTemplate.execute("create table if not exists host_maintenance_fees (maintenance_fee_id bigint not null auto_increment, host_id int not null, billing_month tinyint not null, billing_year smallint not null, period_start date not null, period_end date not null, fee_amount decimal(14,2) not null, due_date date not null, payment_status varchar(30) not null default 'PENDING', paid_at timestamp null, payment_method varchar(30) null, transaction_reference varchar(150) null, admin_note text null, created_at timestamp not null default current_timestamp, updated_at timestamp null default null on update current_timestamp, primary key (maintenance_fee_id), unique key uk_host_maintenance_month (host_id,billing_year,billing_month), key idx_maintenance_status_due (payment_status,due_date), key idx_maintenance_host_period (host_id,billing_year,billing_month)) engine=InnoDB default character set=utf8mb4 collate=utf8mb4_unicode_ci");
//             addColumnIfMissing("host_maintenance_fees", "reminder_sent_at", "TIMESTAMP NULL");
//             addColumnIfMissing("host_maintenance_fees", "overdue_warning_sent_at", "TIMESTAMP NULL");
//             markExistingOverdueWarningsAsSent();
//             ensureDefaultFeeSetting();
//             ensureCurrentMaintenanceFees(LocalDate.now());
//             backfillExistingRevenueData();
//         } catch (Exception ignored) {
//         }
//     }

//     private void addColumnIfMissing(String tableName, String columnName, String definition) {
//         Integer count = jdbcTemplate.queryForObject("select count(*) from information_schema.columns where table_schema = database() and table_name = ? and column_name = ?", Integer.class, tableName, columnName);
//         if (count == null || count == 0) jdbcTemplate.execute("alter table " + tableName + " add column " + columnName + " " + definition);
//     }

//     private void migratePaidOutCommissions() {
//         jdbcTemplate.update("update booking_commissions set commission_status='RECOGNIZED', recognized_at=coalesce(recognized_at, paid_to_host_at, updated_at, calculated_at, now()), updated_at=now() where commission_status='PAID_OUT'");
//         jdbcTemplate.update("update booking_commissions set recognized_at=coalesce(recognized_at, updated_at, calculated_at, now()), updated_at=now() where commission_status='RECOGNIZED' and recognized_at is null");
//         try {
//             jdbcTemplate.execute("alter table booking_commissions modify column commission_status varchar(30) not null default 'PENDING' comment 'PENDING, RECOGNIZED, CANCELLED'");
//         } catch (Exception ignored) {
//         }
//     }

//     private void ensureDefaultFeeSetting() {
//         Integer count = jdbcTemplate.queryForObject("select count(*) from platform_fee_settings where setting_status='ACTIVE' and effective_from <= current_date and (effective_to is null or effective_to >= current_date)", Integer.class);
//         if (count == null || count == 0) jdbcTemplate.update("insert into platform_fee_settings (setting_name, commission_rate, monthly_maintenance_fee, free_trial_days, grace_period_days, effective_from, setting_status) values ('Phi mac dinh Cozygo', 10.00, 99000, 30, 3, current_date, 'ACTIVE')");
//     }


//     private void markExistingOverdueWarningsAsSent() {
//         jdbcTemplate.update("update host_maintenance_fees set overdue_warning_sent_at=coalesce(overdue_warning_sent_at, updated_at, created_at, now()) where payment_status='OVERDUE' and overdue_warning_sent_at is null");
//     }

//     private void backfillExistingRevenueData() {
//         BigDecimal rate = getActiveFeeSetting(LocalDate.now()).getCommissionRate();
//         String amount = "coalesce(nullif(p.amount,0), nullif(b.total_price,0), nullif(b.subtotal,0), nullif(bd.line_total,0), 0)";
//         String explicitCompleted = "upper(coalesce(b.booking_status,'')) in ('COMPLETED','DONE','FINISHED')";
//         String inferredCompleted = "upper(coalesce(b.booking_status,''))='CONFIRMED' and bd.checkout_date <= current_date";
//         String cancelled = "upper(coalesce(b.booking_status,'')) in ('CANCELLED','CANCELED','CANCELLED_BY_HOST','REJECTED','EXPIRED','DELETED')";
//         String paid = "(upper(coalesce(b.payment_status,'')) in ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN') "
//                 + "or upper(coalesce(p.payment_status,'')) in ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN'))";
//         String collected = "((" + explicitCompleted + " and (upper(coalesce(b.payment_method,''))='PAY_AT_PROPERTY' or " + paid + ")) "
//                 + "or (" + inferredCompleted + " and " + paid + "))";
//         String from = " from bookings b join homestays h on h.home_id=b.home_id "
//                 + "left join booking_details bd on bd.booking_id=b.booking_id "
//                 + "left join payments p on p.payment_id=(select max(p2.payment_id) from payments p2 where p2.booking_id=b.booking_id) ";

//         jdbcTemplate.update(
//                 "insert ignore into booking_commissions "
//                         + "(booking_id, host_id, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount, refund_status, commission_status, calculated_at, recognized_at, created_at, updated_at) "
//                         + "select b.booking_id, h.user_id, " + amount + ", 0, " + amount + ", ?, "
//                         + "round(" + amount + " * ? / 100, 0), "
//                         + "greatest(" + amount + " - round(" + amount + " * ? / 100, 0), 0), "
//                         + "'NONE', 'RECOGNIZED', coalesce(b.created_at, now()), coalesce(b.updated_at, b.created_at, now()), coalesce(b.created_at, now()), now()"
//                         + from
//                         + "where " + collected + " and " + amount + " > 0",
//                 rate, rate, rate
//         );

//         jdbcTemplate.update(
//                 "update booking_commissions bc join bookings b on b.booking_id=bc.booking_id "
//                         + "join homestays h on h.home_id=b.home_id "
//                         + "left join booking_details bd on bd.booking_id=b.booking_id "
//                         + "left join payments p on p.payment_id=(select max(p2.payment_id) from payments p2 where p2.booking_id=b.booking_id) "
//                         + "set bc.host_id=h.user_id, bc.booking_amount=" + amount + ", bc.refund_amount=0, bc.retained_amount=" + amount + ", "
//                         + "bc.commission_rate=case when bc.commission_rate is null or bc.commission_rate=0 then ? else bc.commission_rate end, "
//                         + "bc.commission_amount=round(" + amount + " * (case when bc.commission_rate is null or bc.commission_rate=0 then ? else bc.commission_rate end) / 100, 0), "
//                         + "bc.host_receivable_amount=greatest(" + amount + " - round(" + amount + " * (case when bc.commission_rate is null or bc.commission_rate=0 then ? else bc.commission_rate end) / 100, 0), 0), "
//                         + "bc.refund_status='NONE', bc.commission_status='RECOGNIZED', bc.recognized_at=coalesce(bc.recognized_at, b.updated_at, b.created_at, now()), bc.updated_at=now() "
//                         + "where bc.commission_status='PENDING' and " + collected + " and " + amount + " > 0",
//                 rate, rate, rate
//         );

//         jdbcTemplate.update(
//                 "update booking_commissions bc join bookings b on b.booking_id=bc.booking_id "
//                         + "set bc.refund_amount=bc.booking_amount, bc.retained_amount=0, bc.commission_amount=0, bc.host_receivable_amount=0, "
//                         + "bc.commission_status='CANCELLED', bc.refund_status='REFUNDED', bc.updated_at=now() "
//                         + "where " + cancelled
//         );
//     }

//     public PlatformFeeSettingResponse getActiveFeeSetting(LocalDate date) {
//         ensureDefaultFeeSetting();
//         try {
//             return jdbcTemplate.queryForObject("select * from platform_fee_settings where setting_status='ACTIVE' and effective_from <= ? and (effective_to is null or effective_to >= ?) order by effective_from desc, setting_id desc limit 1", this::mapFeeSetting, Date.valueOf(date), Date.valueOf(date));
//         } catch (EmptyResultDataAccessException exception) {
//             throw new AppException("ACTIVE_PLATFORM_FEE_SETTING_NOT_FOUND");
//         }
//     }

//     public PlatformFeeSettingResponse createNewFeeSetting(String name, BigDecimal rate, BigDecimal monthlyFee, Integer trialDays, Integer graceDays, LocalDate effectiveFrom) {
//         LocalDate start = effectiveFrom == null ? LocalDate.now() : effectiveFrom;
//         jdbcTemplate.update("update platform_fee_settings set effective_to=?, setting_status='INACTIVE', updated_at=now() where setting_status='ACTIVE' and (effective_to is null or effective_to >= ?)", Date.valueOf(start.minusDays(1)), Date.valueOf(start));
//         jdbcTemplate.update("insert into platform_fee_settings (setting_name, commission_rate, monthly_maintenance_fee, free_trial_days, grace_period_days, effective_from, setting_status) values (?,?,?,?,?,?, 'ACTIVE')", blank(name) ? "Phi mac dinh Cozygo" : name, rate, monthlyFee, trialDays, graceDays, Date.valueOf(start));
//         return getActiveFeeSetting(start);
//     }

//     public BookingMoneySource loadBookingMoneySource(Integer bookingId) {
//         try {
//             return jdbcTemplate.queryForObject("select b.booking_id, coalesce(b.booking_code, concat('BK', lpad(b.booking_id, 6, '0'))) booking_code, b.booking_status, b.payment_status, b.payment_method, b.total_price, h.home_id, h.home_name, h.user_id host_id, coalesce(p.amount, b.total_price) paid_amount, p.payment_status latest_payment_status from bookings b join homestays h on h.home_id=b.home_id left join payments p on p.payment_id=(select max(p2.payment_id) from payments p2 where p2.booking_id=b.booking_id) where b.booking_id=?", (rs, rowNum) -> BookingMoneySource.builder().bookingId(rs.getInt("booking_id")).bookingCode(rs.getString("booking_code")).bookingStatus(rs.getString("booking_status")).paymentStatus(rs.getString("payment_status")).paymentMethod(rs.getString("payment_method")).homeId(rs.getInt("home_id")).homestayName(rs.getString("home_name")).hostId(rs.getInt("host_id")).bookingAmount(positive(rs.getBigDecimal("paid_amount"), rs.getBigDecimal("total_price"))).latestPaymentStatus(rs.getString("latest_payment_status")).build(), bookingId);
//         } catch (EmptyResultDataAccessException exception) {
//             throw new AppException("BOOKING_NOT_FOUND");
//         }
//     }

//     public CommissionRow findCommissionByBookingId(Integer bookingId) {
//         List<CommissionRow> rows = jdbcTemplate.query("select commission_id, booking_id, commission_status, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount from booking_commissions where booking_id=?", this::mapCommissionRow, bookingId);
//         return rows.isEmpty() ? null : rows.get(0);
//     }

//     public CommissionRow findCommissionById(Long commissionId) {
//         List<CommissionRow> rows = jdbcTemplate.query("select commission_id, booking_id, commission_status, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount from booking_commissions where commission_id=?", this::mapCommissionRow, commissionId);
//         if (rows.isEmpty()) throw new AppException("COMMISSION_NOT_FOUND");
//         return rows.get(0);
//     }

//     public void insertPendingCommission(BookingMoneySource source, BigDecimal rate, BigDecimal commission, BigDecimal hostReceivable) {
//         jdbcTemplate.update("insert into booking_commissions (booking_id, host_id, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount, refund_status, commission_status) values (?, ?, ?, 0, ?, ?, ?, ?, 'NONE', 'PENDING')", source.getBookingId(), source.getHostId(), source.getBookingAmount(), source.getBookingAmount(), rate, commission, hostReceivable);
//     }

//     public void updatePendingCommission(Integer bookingId, Integer hostId, BigDecimal bookingAmount, BigDecimal rate, BigDecimal commission, BigDecimal hostReceivable) {
//         jdbcTemplate.update("update booking_commissions set host_id=?, booking_amount=?, refund_amount=0, retained_amount=?, commission_rate=?, commission_amount=?, host_receivable_amount=?, cancellation_type=null, refund_status='NONE', updated_at=now() where booking_id=? and commission_status='PENDING'", hostId, bookingAmount, bookingAmount, rate, commission, hostReceivable, bookingId);
//     }

//     public int recognizeCommission(Integer bookingId) {
//         return jdbcTemplate.update("update booking_commissions set commission_status='RECOGNIZED', recognized_at=coalesce(recognized_at, now()), updated_at=now() where booking_id=? and commission_status='PENDING'", bookingId);
//     }

//     public int updateCommissionRefund(Integer bookingId, BigDecimal refundAmount, BigDecimal retainedAmount, BigDecimal commissionAmount, BigDecimal hostReceivableAmount, String cancellationType, String refundStatus, String commissionStatus, String adminNote) {
//         return jdbcTemplate.update("update booking_commissions set refund_amount=?, retained_amount=?, commission_amount=?, host_receivable_amount=?, cancellation_type=?, refund_status=?, commission_status=?, recognized_at=case when ?='RECOGNIZED' then coalesce(recognized_at,now()) else recognized_at end, refunded_at=case when ? in ('REFUNDED','PARTIALLY_REFUNDED') then coalesce(refunded_at,now()) else refunded_at end, admin_note=coalesce(?,admin_note), updated_at=now() where booking_id=? and commission_status <> 'PAID_OUT'", refundAmount, retainedAmount, commissionAmount, hostReceivableAmount, cancellationType, refundStatus, commissionStatus, commissionStatus, refundStatus, adminNote, bookingId);
//     }

//     public int markPaidOut(Long commissionId, String payoutReference, String adminNote) {
//         return jdbcTemplate.update("update booking_commissions set commission_status='PAID_OUT', paid_to_host_at=now(), payout_reference=?, admin_note=?, updated_at=now() where commission_id=? and commission_status='RECOGNIZED' and host_receivable_amount > 0", payoutReference, adminNote, commissionId);
//     }

//     public AdminRevenueSummaryResponse adminSummary(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
//         LocalDateTime from = fromDate.atStartOfDay();
//         LocalDateTime to = toDate.plusDays(1).atStartOfDay();

//         SummaryAmount commission = jdbcTemplate.queryForObject(
//                 "select coalesce(sum(bc.booking_amount),0) completed_value, "
//                         + "count(*) completed_count, "
//                         + "coalesce(sum(bc.commission_amount),0) commission_revenue "
//                         + "from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id "
//                         + "where bc.commission_status='RECOGNIZED' and bc.recognized_at >= ? and bc.recognized_at < ?"
//                         + adminOwnerFilter(hostId, homestayId),
//                 (rs, rowNum) -> SummaryAmount.builder()
//                         .gross(money(rs.getBigDecimal("completed_value")))
//                         .completedCount(rs.getInt("completed_count"))
//                         .commissionRevenue(money(rs.getBigDecimal("commission_revenue")))
//                         .build(),
//                 adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId)
//         );

//         Integer cancelledCount = jdbcTemplate.queryForObject(
//                 "select count(*) from bookings b join homestays h on h.home_id=b.home_id "
//                         + "where upper(coalesce(b.booking_status,'')) in ('CANCELLED','CANCELLED_BY_HOST','REJECTED','EXPIRED','DELETED') "
//                         + "and coalesce(b.updated_at,b.created_at) >= ? and coalesce(b.updated_at,b.created_at) < ?"
//                         + adminOwnerFilter(hostId, homestayId),
//                 Integer.class,
//                 adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId)
//         );

//         SummaryAmount maintenance = jdbcTemplate.queryForObject(
//                 "select coalesce(sum(case when f.payment_status='PAID' and f.paid_at >= ? and f.paid_at < ? then f.fee_amount else 0 end),0) maintenance_revenue, "
//                         + "count(distinct case when f.payment_status='PAID' and f.paid_at >= ? and f.paid_at < ? then f.host_id end) paid_host_count, "
//                         + "coalesce(sum(case when f.payment_status='PENDING' then f.fee_amount else 0 end),0) pending_amount, "
//                         + "coalesce(sum(case when f.payment_status='OVERDUE' then f.fee_amount else 0 end),0) overdue_amount "
//                         + "from host_maintenance_fees f where 1=1" + maintenanceOwnerFilter(hostId, homestayId),
//                 (rs, rowNum) -> SummaryAmount.builder()
//                         .retained(money(rs.getBigDecimal("maintenance_revenue")))
//                         .pendingCount(rs.getInt("paid_host_count"))
//                         .pendingHeld(money(rs.getBigDecimal("pending_amount")))
//                         .pendingHost(money(rs.getBigDecimal("overdue_amount")))
//                         .build(),
//                 maintenanceArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId)
//         );

//         BigDecimal commissionRevenue = money(commission == null ? BigDecimal.ZERO : commission.commissionRevenue);
//         BigDecimal maintenanceRevenue = money(maintenance == null ? BigDecimal.ZERO : maintenance.retained);
//         int completedCount = commission == null || commission.completedCount == null ? 0 : commission.completedCount;
//         BigDecimal averageCommission = completedCount == 0
//                 ? BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP)
//                 : commissionRevenue.divide(BigDecimal.valueOf(completedCount), 0, RoundingMode.HALF_UP);

//         return AdminRevenueSummaryResponse.builder()
//                 .fromDate(fromDate)
//                 .toDate(toDate)
//                 .completedBookingValue(money(commission == null ? BigDecimal.ZERO : commission.gross))
//                 .completedBookingCount(completedCount)
//                 .cancelledBookingCount(cancelledCount == null ? 0 : cancelledCount)
//                 .commissionRevenue(commissionRevenue)
//                 .maintenanceRevenue(maintenanceRevenue)
//                 .totalPlatformRevenue(commissionRevenue.add(maintenanceRevenue).setScale(0, RoundingMode.HALF_UP))
//                 .paidMaintenanceHostCount(maintenance == null || maintenance.pendingCount == null ? 0 : maintenance.pendingCount)
//                 .averageCommission(averageCommission)
//                 .pendingMaintenanceAmount(money(maintenance == null ? BigDecimal.ZERO : maintenance.pendingHeld))
//                 .overdueMaintenanceAmount(money(maintenance == null ? BigDecimal.ZERO : maintenance.pendingHost))
//                 .grossCustomerPayments(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                 .pendingHeldAmount(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                 .pendingHostPayable(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                 .paidOutToHosts(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                 .totalRefundAmount(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                 .build();
//     }

//     public List<RevenueChartPointResponse> adminChart(LocalDate fromDate, LocalDate toDate, String groupBy, Integer hostId, Integer homestayId) {
//         String format = "MONTH".equalsIgnoreCase(groupBy) ? "%Y-%m" : "%Y-%m-%d";
//         LocalDateTime from = fromDate.atStartOfDay();
//         LocalDateTime to = toDate.plusDays(1).atStartOfDay();
//         List<Object> args = new ArrayList<>();
//         args.add(format);
//         args.add(Timestamp.valueOf(from));
//         args.add(Timestamp.valueOf(to));
//         if (hostId != null) args.add(hostId);
//         if (homestayId != null) args.add(homestayId);
//         args.add(format);
//         args.add(format);
//         args.add(Timestamp.valueOf(from));
//         args.add(Timestamp.valueOf(to));
//         if (hostId != null) args.add(hostId);
//         if (homestayId != null) args.add(homestayId);
//         args.add(format);

//         return jdbcTemplate.query(
//                 "select period, sum(completed_booking_value) completed_booking_value, "
//                         + "sum(completed_booking_count) completed_booking_count, "
//                         + "sum(commission_revenue) commission_revenue, "
//                         + "sum(maintenance_revenue) maintenance_revenue, "
//                         + "sum(commission_revenue + maintenance_revenue) total_platform_revenue "
//                         + "from ("
//                         + "select date_format(bc.recognized_at, ?) period, coalesce(sum(bc.booking_amount),0) completed_booking_value, "
//                         + "count(*) completed_booking_count, coalesce(sum(bc.commission_amount),0) commission_revenue, 0 maintenance_revenue "
//                         + "from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id "
//                         + "where bc.commission_status='RECOGNIZED' and bc.recognized_at >= ? and bc.recognized_at < ? "
//                         + adminOwnerFilter(hostId, homestayId)
//                         + " group by date_format(bc.recognized_at, ?) "
//                         + "union all "
//                         + "select date_format(f.paid_at, ?) period, 0 completed_booking_value, 0 completed_booking_count, 0 commission_revenue, coalesce(sum(f.fee_amount),0) maintenance_revenue "
//                         + "from host_maintenance_fees f where f.payment_status='PAID' and f.paid_at >= ? and f.paid_at < ? "
//                         + maintenanceOwnerFilter(hostId, homestayId)
//                         + " group by date_format(f.paid_at, ?)"
//                         + ") x group by period order by period",
//                 (rs, rowNum) -> RevenueChartPointResponse.builder()
//                         .period(rs.getString("period"))
//                         .completedBookingValue(money(rs.getBigDecimal("completed_booking_value")))
//                         .completedBookingCount(rs.getInt("completed_booking_count"))
//                         .commissionRevenue(money(rs.getBigDecimal("commission_revenue")))
//                         .maintenanceRevenue(money(rs.getBigDecimal("maintenance_revenue")))
//                         .totalPlatformRevenue(money(rs.getBigDecimal("total_platform_revenue")))
//                         .totalRevenue(money(rs.getBigDecimal("total_platform_revenue")))
//                         .hostPayable(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                         .refundAmount(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
//                         .build(),
//                 args.toArray()
//         );
//     }

//     public PageResponse<AdminCommissionResponse> adminCommissions(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId, String status, String paymentMethod, String keyword, int page, int size) {
//         List<Object> args = new ArrayList<>();
//         String where = commissionWhere(fromDate, toDate, hostId, homestayId, status, paymentMethod, keyword, args);
//         Long total = jdbcTemplate.queryForObject("select count(*) " + commissionFromSql() + where, Long.class, args.toArray());
//         args.add(size); args.add(page * size);
//         List<AdminCommissionResponse> content = jdbcTemplate.query("select " + adminCommissionSelect() + commissionFromSql() + where + " order by coalesce(bc.recognized_at,bc.calculated_at) desc, bc.commission_id desc limit ? offset ?", this::mapAdminCommission, args.toArray());
//         return PageResponse.<AdminCommissionResponse>builder().content(content).page(page).size(size).totalElements(total == null ? 0 : total).totalPages(totalPages(total, size)).build();
//     }

//     public AdminCommissionResponse adminCommissionDetail(Long commissionId) {
//         List<AdminCommissionResponse> rows = jdbcTemplate.query("select " + adminCommissionSelect() + commissionFromSql() + " where bc.commission_id=?", this::mapAdminCommission, commissionId);
//         if (rows.isEmpty()) throw new AppException("COMMISSION_NOT_FOUND");
//         return rows.get(0);
//     }

//     public List<RevenueTopItemResponse> topHosts(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
//         LocalDateTime from = fromDate.atStartOfDay();
//         LocalDateTime to = toDate.plusDays(1).atStartOfDay();
//         return jdbcTemplate.query("select u.user_id id, u.full_name name, u.email sub_label, coalesce(sum(bc.commission_amount),0) commission_revenue, 0 host_receivable, count(*) booking_count from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id join users u on u.user_id=bc.host_id where bc.commission_status='RECOGNIZED' and bc.recognized_at >= ? and bc.recognized_at < ?" + adminOwnerFilter(hostId, homestayId) + " group by u.user_id,u.full_name,u.email order by commission_revenue desc limit 5", this::mapTopItem, adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId));
//     }

//     public List<RevenueTopItemResponse> topHomestays(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
//         LocalDateTime from = fromDate.atStartOfDay();
//         LocalDateTime to = toDate.plusDays(1).atStartOfDay();
//         return jdbcTemplate.query("select h.home_id id, h.home_name name, owner.full_name sub_label, coalesce(sum(bc.commission_amount),0) commission_revenue, 0 host_receivable, count(*) booking_count from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id join users owner on owner.user_id=h.user_id where bc.commission_status='RECOGNIZED' and bc.recognized_at >= ? and bc.recognized_at < ?" + adminOwnerFilter(hostId, homestayId) + " group by h.home_id,h.home_name,owner.full_name order by commission_revenue desc limit 5", this::mapTopItem, adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId));
//     }

//     public HostRevenueSummaryResponse hostSummary(Integer hostId, LocalDate fromDate, LocalDate toDate, String groupBy, Integer homestayId) {
//         LocalDateTime from = fromDate.atStartOfDay();
//         LocalDateTime to = toDate.plusDays(1).atStartOfDay();
//         String homestayFilter = homestayId == null ? "" : " and b.home_id=?";
//         List<Object> summaryArgs = new ArrayList<>();
//         summaryArgs.add(hostId);
//         summaryArgs.add(Timestamp.valueOf(from));
//         summaryArgs.add(Timestamp.valueOf(to));
//         if (homestayId != null) summaryArgs.add(homestayId);
//         SummaryAmount s = jdbcTemplate.queryForObject("select " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.booking_amount else 0 end),0) gross, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT','CANCELLED') then bc.refund_amount else 0 end),0) refund_total, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.retained_amount else 0 end),0) retained, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.commission_amount else 0 end),0) commission_revenue, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount else 0 end),0) host_revenue, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED') then bc.host_receivable_amount else 0 end),0) pending_host, " +
//                 "coalesce(sum(case when bc.commission_status='PAID_OUT' then bc.host_receivable_amount else 0 end),0) paid_out, " +
//                 "coalesce(sum(case when bc.commission_status='PENDING' then bc.host_receivable_amount else 0 end),0) expected_pending, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(nullif(bd.line_total,0), greatest(coalesce(bc.booking_amount,0) - coalesce(st.service_total,0) + coalesce(b.discount_amount,0),0)) else 0 end),0) room_revenue, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(st.service_total,0) else 0 end),0) service_revenue, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(b.discount_amount,0) else 0 end),0) discount_total, " +
//                 "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(nullif(bd.number_of_nights,0), greatest(datediff(bd.checkout_date,bd.checkin_date),0),0) else 0 end),0) occupancy_nights, " +
//                 "count(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 end) completed_count, " +
//                 "count(case when bc.commission_status='PENDING' then 1 end) pending_count, " +
//                 "count(case when bc.commission_status='CANCELLED' then 1 end) cancelled_count, " +
//                 "coalesce(avg(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount end),0) average_order_value " +
//                 "from booking_commissions bc " +
//                 "join bookings b on b.booking_id=bc.booking_id " +
//                 "left join booking_details bd on bd.booking_id=b.booking_id " +
//                 "left join (select booking_id, coalesce(sum(total_price),0) service_total from booking_services group by booking_id) st on st.booking_id=b.booking_id " +
//                 "where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?" + homestayFilter,
//                 (rs, rowNum) -> SummaryAmount.builder().gross(rs.getBigDecimal("gross")).refundTotal(rs.getBigDecimal("refund_total")).retained(rs.getBigDecimal("retained")).commissionRevenue(rs.getBigDecimal("commission_revenue")).hostRevenue(rs.getBigDecimal("host_revenue")).pendingHost(rs.getBigDecimal("pending_host")).paidOut(rs.getBigDecimal("paid_out")).expectedPending(rs.getBigDecimal("expected_pending")).roomRevenue(rs.getBigDecimal("room_revenue")).serviceRevenue(rs.getBigDecimal("service_revenue")).discountTotal(rs.getBigDecimal("discount_total")).occupancyNights(rs.getInt("occupancy_nights")).completedCount(rs.getInt("completed_count")).pendingCount(rs.getInt("pending_count")).cancelledCount(rs.getInt("cancelled_count")).average(rs.getBigDecimal("average_order_value")).build(),
//                 summaryArgs.toArray()
//         );
//         MaintenanceFeeResponse currentFee = currentMaintenanceFee(hostId);
//         HostSubscription sub = getHostSubscription(hostId);
//         return HostRevenueSummaryResponse.builder().fromDate(fromDate).toDate(toDate).groupBy(groupBy).grossBookingAmount(money(s.gross)).refundAmount(money(s.refundTotal)).retainedBookingAmount(money(s.retained)).commissionDeducted(money(s.commissionRevenue)).totalHostRevenue(money(s.hostRevenue)).pendingPayout(money(s.pendingHost)).paidOutAmount(money(s.paidOut)).expectedPendingRevenue(money(s.expectedPending)).roomRevenue(money(s.roomRevenue)).serviceRevenue(money(s.serviceRevenue)).discountTotal(money(s.discountTotal)).currentMaintenanceFee(currentFee == null ? BigDecimal.ZERO : currentFee.getFeeAmount()).maintenancePaymentStatus(currentFee == null ? null : currentFee.getPaymentStatus()).maintenanceDueDate(currentFee == null ? null : currentFee.getDueDate()).subscriptionExpiresAt(sub.subscriptionExpiresAt).canReceiveBooking(sub.canReceiveBooking).paidBookingCount(s.completedCount).pendingBookingCount(s.pendingCount).completedBookingCount(s.completedCount).cancelledBookingCount(s.cancelledCount).occupancyNights(s.occupancyNights == null ? 0 : s.occupancyNights).averageOrderValue(money(s.average)).trends(hostTrends(hostId, from, to, groupBy, homestayId)).homestays(hostHomestays(hostId, from, to, homestayId)).recentBookings(hostBookings(hostId, fromDate, toDate, homestayId, null, null, 0, 12).getContent()).build();
//     }

//     public PageResponse<HostRevenueBookingResponse> hostBookings(Integer hostId, LocalDate fromDate, LocalDate toDate, Integer homestayId, String status, String keyword, int page, int size) {
//         List<Object> args = new ArrayList<>();
//         args.add(hostId); args.add(Timestamp.valueOf(fromDate.atStartOfDay())); args.add(Timestamp.valueOf(toDate.plusDays(1).atStartOfDay()));
//         StringBuilder where = new StringBuilder(" where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?");
//         if (status != null && !status.isBlank()) { where.append(" and bc.commission_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
//         if (homestayId != null) { where.append(" and h.home_id=?"); args.add(homestayId); }
//         if (keyword != null && !keyword.isBlank()) { where.append(" and (upper(b.booking_code) like ? or upper(h.home_name) like ? or upper(c.full_name) like ?)"); String kw = "%" + keyword.trim().toUpperCase(Locale.ROOT) + "%"; args.add(kw); args.add(kw); args.add(kw); }
//         Long total = jdbcTemplate.queryForObject("select count(*) " + commissionFromSql() + where, Long.class, args.toArray());
//         args.add(size); args.add(page * size);
//         List<HostRevenueBookingResponse> content = jdbcTemplate.query("select " + hostBookingSelect() + commissionFromSql() + where + " order by coalesce(bc.recognized_at,bc.calculated_at) desc, bc.commission_id desc limit ? offset ?", this::mapHostBooking, args.toArray());
//         return PageResponse.<HostRevenueBookingResponse>builder().content(content).page(page).size(size).totalElements(total == null ? 0 : total).totalPages(totalPages(total, size)).build();
//     }

//     public List<HostRevenueTrendResponse> hostTrends(Integer hostId, LocalDateTime from, LocalDateTime to, String groupBy, Integer homestayId) {
//         String format = "month".equalsIgnoreCase(groupBy) ? "%Y-%m" : "%Y-%m-%d";
//         String homestayFilter = homestayId == null ? "" : " and b.home_id=?";
//         List<Object> args = new ArrayList<>();
//         args.add(format);
//         args.add(hostId);
//         args.add(Timestamp.valueOf(from));
//         args.add(Timestamp.valueOf(to));
//         if (homestayId != null) args.add(homestayId);
//         args.add(format);
//         return jdbcTemplate.query("select date_format(coalesce(bc.recognized_at,bc.calculated_at), ?) period, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount else 0 end),0) revenue, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.booking_amount else 0 end),0) gross, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.commission_amount else 0 end),0) commission, coalesce(sum(case when bc.commission_status='PENDING' then bc.host_receivable_amount else 0 end),0) pending, count(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 end) booking_count from booking_commissions bc join bookings b on b.booking_id=bc.booking_id where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?" + homestayFilter + " group by date_format(coalesce(bc.recognized_at,bc.calculated_at), ?) order by period", (rs, rowNum) -> HostRevenueTrendResponse.builder().period(rs.getString("period")).revenue(money(rs.getBigDecimal("revenue"))).grossBookingAmount(money(rs.getBigDecimal("gross"))).commissionDeducted(money(rs.getBigDecimal("commission"))).pendingPayout(money(rs.getBigDecimal("pending"))).bookingCount(rs.getInt("booking_count")).build(), args.toArray());
//     }

//     private List<HostRevenueHomestayResponse> hostHomestays(Integer hostId, LocalDateTime from, LocalDateTime to, Integer homestayId) {
//         String homestayFilter = homestayId == null ? "" : " and h.home_id=?";
//         List<Object> args = new ArrayList<>();
//         args.add(hostId);
//         args.add(Timestamp.valueOf(from));
//         args.add(Timestamp.valueOf(to));
//         if (homestayId != null) args.add(homestayId);
//         return jdbcTemplate.query("select h.home_id,h.home_name,h.province,coalesce(h.rating_avg,0) rating_avg,count(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 end) booking_count, sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 else 0 end) completed_count, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount else 0 end),0) revenue, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.booking_amount else 0 end),0) booking_amount, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.commission_amount else 0 end),0) commission_amount, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(nullif(bd.line_total,0), greatest(coalesce(bc.booking_amount,0) - coalesce(st.service_total,0) + coalesce(b.discount_amount,0),0)) else 0 end),0) room_revenue, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(st.service_total,0) else 0 end),0) service_revenue from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id left join booking_details bd on bd.booking_id=b.booking_id left join (select booking_id, coalesce(sum(total_price),0) service_total from booking_services group by booking_id) st on st.booking_id=b.booking_id where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?" + homestayFilter + " group by h.home_id,h.home_name,h.province,h.rating_avg order by revenue desc", (rs, rowNum) -> HostRevenueHomestayResponse.builder().homeId(rs.getInt("home_id")).homestayName(rs.getString("home_name")).province(rs.getString("province")).averageRating(money(rs.getBigDecimal("rating_avg"))).bookingCount(rs.getInt("booking_count")).completedCount(rs.getInt("completed_count")).revenue(money(rs.getBigDecimal("revenue"))).bookingAmount(money(rs.getBigDecimal("booking_amount"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("revenue"))).roomRevenue(money(rs.getBigDecimal("room_revenue"))).serviceRevenue(money(rs.getBigDecimal("service_revenue"))).build(), args.toArray());
//     }

//     public synchronized void ensureCurrentMaintenanceFees(LocalDate today) {
//         PlatformFeeSettingResponse setting = getActiveFeeSetting(today == null ? LocalDate.now() : today);
//         LocalDate effectiveToday = today == null ? LocalDate.now() : today;
//         List<Integer> hostIds = jdbcTemplate.queryForList("select distinct u.user_id from users u join roles r on r.role_id=u.role_id where u.deleted_at is null and (upper(r.role_name)='HOST' or exists (select 1 from homestays h where h.user_id=u.user_id and h.deleted_at is null and upper(coalesce(h.status,'')) in ('APPROVED','ACTIVE','VISIBLE')))", Integer.class);
//         for (Integer hostId : hostIds) {
//             LocalDate firstActiveMonth = firstHomestayMonthForHost(hostId, effectiveToday);
//             ensureFirstFreeMaintenanceForHost(hostId, firstActiveMonth);
//             ensurePendingMaintenanceUpTo(hostId, effectiveToday, setting);
//         }
//         normalizeFirstMaintenanceWaivers(effectiveToday);
//         markOverdueFees(effectiveToday);
//     }

//     public synchronized int ensureFirstFreeMaintenanceForHost(Integer hostId, LocalDate approvedDate) {
//         if (hostId == null) return 0;
//         LocalDate effectiveDate = approvedDate == null ? LocalDate.now() : approvedDate;
//         PlatformFeeSettingResponse setting = getActiveFeeSetting(effectiveDate);
//         YearMonth ym = YearMonth.from(effectiveDate);
//         LocalDate start = ym.atDay(1);
//         LocalDate end = ym.atEndOfMonth();
//         LocalDate due = start.plusDays(setting.getGracePeriodDays() == null ? 3 : setting.getGracePeriodDays());
//         int inserted = jdbcTemplate.update("insert ignore into host_maintenance_fees (host_id,billing_month,billing_year,period_start,period_end,fee_amount,due_date,payment_status,admin_note) values (?,?,?,?,?,?,?,'WAIVED','Mien phi thang dau sau khi homestay duoc duyet')", hostId, ym.getMonthValue(), ym.getYear(), Date.valueOf(start), Date.valueOf(end), setting.getMonthlyMaintenanceFee(), Date.valueOf(due));
//         if (inserted > 0) {
//             jdbcTemplate.update("update users set host_subscription_status='ACTIVE', host_subscription_expires_at=?, host_can_receive_booking=true where user_id=?", Date.valueOf(end), hostId);
//         }
//         return inserted;
//     }

//     private void ensurePendingMaintenanceUpTo(Integer hostId, LocalDate today, PlatformFeeSettingResponse setting) {
//         List<Date> latestDates = jdbcTemplate.queryForList("select max(period_start) from host_maintenance_fees where host_id=?", Date.class, hostId);
//         if (latestDates.isEmpty() || latestDates.get(0) == null) return;
//         YearMonth current = YearMonth.from(today);
//         YearMonth next = YearMonth.from(latestDates.get(0).toLocalDate()).plusMonths(1);
//         int guard = 0;
//         while (!next.isAfter(current) && guard < 24) {
//             insertMonthlyMaintenanceIfMissing(hostId, next, setting, "PENDING", null);
//             next = next.plusMonths(1);
//             guard++;
//         }
//     }

//     private int insertMonthlyMaintenanceIfMissing(Integer hostId, YearMonth ym, PlatformFeeSettingResponse setting, String status, String note) {
//         LocalDate start = ym.atDay(1);
//         LocalDate end = ym.atEndOfMonth();
//         LocalDate due = start.plusDays(setting.getGracePeriodDays() == null ? 3 : setting.getGracePeriodDays());
//         return jdbcTemplate.update("insert ignore into host_maintenance_fees (host_id,billing_month,billing_year,period_start,period_end,fee_amount,due_date,payment_status,admin_note) values (?,?,?,?,?,?,?,?,?)", hostId, ym.getMonthValue(), ym.getYear(), Date.valueOf(start), Date.valueOf(end), setting.getMonthlyMaintenanceFee(), Date.valueOf(due), status, note);
//     }
//     private LocalDate firstHomestayMonthForHost(Integer hostId, LocalDate fallbackDate) {
//         List<Date> rows = jdbcTemplate.queryForList(
//                 "select min(date(coalesce(created_at, current_timestamp))) from homestays where user_id=? and deleted_at is null",
//                 Date.class,
//                 hostId
//         );
//         if (rows.isEmpty() || rows.get(0) == null) return fallbackDate == null ? LocalDate.now() : fallbackDate;
//         return rows.get(0).toLocalDate();
//     }

//     private int normalizeFirstMaintenanceWaivers(LocalDate today) {
//         jdbcTemplate.update("update host_maintenance_fees f join (select host_id, min(period_start) first_period from host_maintenance_fees group by host_id) first_fee on first_fee.host_id=f.host_id and first_fee.first_period=f.period_start set f.payment_status='WAIVED', f.admin_note=coalesce(f.admin_note,'Mien phi thang dau'), f.updated_at=now() where f.payment_status in ('PENDING','OVERDUE') and f.paid_at is null");
//         return jdbcTemplate.update(
//                 "update host_maintenance_fees f join (select host_id, min(period_start) first_period from host_maintenance_fees group by host_id) first_fee on first_fee.host_id=f.host_id "
//                         + "set f.payment_status=case when f.due_date < ? then 'OVERDUE' else 'PENDING' end, f.updated_at=now() "
//                         + "where f.period_start <> first_fee.first_period and f.payment_status='WAIVED' and f.paid_at is null "
//                         + "and lower(coalesce(f.admin_note,'')) like '%mien phi thang dau%'",
//                 Date.valueOf(today == null ? LocalDate.now() : today)
//         );
//     }
//     public PageResponse<MaintenanceFeeResponse> maintenanceFees(LocalDate fromDate, LocalDate toDate, Integer hostId, String status, int page, int size) {
//         List<Object> args = new ArrayList<>();
//         StringBuilder where = new StringBuilder(" where 1=1");
//         if (fromDate != null) { where.append(" and f.period_end >= ?"); args.add(Date.valueOf(fromDate)); }
//         if (toDate != null) { where.append(" and f.period_start <= ?"); args.add(Date.valueOf(toDate)); }
//         if (hostId != null) { where.append(" and f.host_id=?"); args.add(hostId); }
//         if (status != null && !status.isBlank()) { where.append(" and f.payment_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
//         Long total = jdbcTemplate.queryForObject("select count(*) from host_maintenance_fees f join users u on u.user_id=f.host_id" + where, Long.class, args.toArray());
//         args.add(size); args.add(page * size);
//         List<MaintenanceFeeResponse> content = jdbcTemplate.query("select f.*, u.full_name host_name from host_maintenance_fees f join users u on u.user_id=f.host_id" + where + " order by f.billing_year desc, f.billing_month desc, f.host_id limit ? offset ?", this::mapMaintenanceFee, args.toArray());
//         return PageResponse.<MaintenanceFeeResponse>builder().content(content).page(page).size(size).totalElements(total == null ? 0 : total).totalPages(totalPages(total, size)).build();
//     }

//     public MaintenanceFeeResponse currentMaintenanceFee(Integer hostId) {
//         YearMonth current = YearMonth.now();
//         List<MaintenanceFeeResponse> rows = jdbcTemplate.query("select f.*, u.full_name host_name from host_maintenance_fees f join users u on u.user_id=f.host_id where f.host_id=? and f.billing_year=? and f.billing_month=?", this::mapMaintenanceFee, hostId, current.getYear(), current.getMonthValue());
//         return rows.isEmpty() ? null : rows.get(0);
//     }

//     public int generateMaintenanceFees(Integer year, Integer month, PlatformFeeSettingResponse setting) {
//         YearMonth ym = YearMonth.of(year, month);
//         LocalDate start = ym.atDay(1);
//         LocalDate end = ym.atEndOfMonth();
//         LocalDate due = start.plusDays(setting.getGracePeriodDays() == null ? 3 : setting.getGracePeriodDays());
//         return jdbcTemplate.update("insert ignore into host_maintenance_fees (host_id,billing_month,billing_year,period_start,period_end,fee_amount,due_date,payment_status) select u.user_id, ?, ?, ?, ?, ?, ?, 'PENDING' from users u join roles r on r.role_id=u.role_id where upper(r.role_name)='HOST' and u.deleted_at is null", month, year, Date.valueOf(start), Date.valueOf(end), setting.getMonthlyMaintenanceFee(), Date.valueOf(due));
//     }

//     public int markMaintenancePaid(Long id, String method, String reference, String note) {
//         int updated = jdbcTemplate.update("update host_maintenance_fees set payment_status='PAID', paid_at=now(), payment_method=?, transaction_reference=?, admin_note=?, updated_at=now() where maintenance_fee_id=? and payment_status in ('PENDING','OVERDUE')", method, reference, note, id);
//         if (updated > 0) extendHostSubscription(id);
//         return updated;
//     }

//     public int waiveMaintenance(Long id, String note) {
//         int updated = jdbcTemplate.update("update host_maintenance_fees set payment_status='WAIVED', admin_note=?, updated_at=now() where maintenance_fee_id=? and payment_status in ('PENDING','OVERDUE')", note, id);
//         if (updated > 0) extendHostSubscription(id);
//         return updated;
//     }

//     public int markOverdueFees(LocalDate today) {
//         return jdbcTemplate.update("update host_maintenance_fees set payment_status='OVERDUE', updated_at=now() where payment_status='PENDING' and due_date < ?", Date.valueOf(today));
//     }

//     public List<MaintenanceAlertCandidate> maintenanceReminderCandidates(LocalDate fromDate, LocalDate toDate) {
//         return jdbcTemplate.query(
//                 "select f.maintenance_fee_id, f.host_id, u.full_name host_name, u.email host_email, f.billing_month, f.billing_year, f.due_date, f.payment_status, f.fee_amount "
//                         + "from host_maintenance_fees f join users u on u.user_id=f.host_id "
//                         + "where f.payment_status='PENDING' and f.due_date >= ? and f.due_date <= ? and f.reminder_sent_at is null",
//                 this::mapMaintenanceAlertCandidate,
//                 Date.valueOf(fromDate), Date.valueOf(toDate)
//         );
//     }

//     public List<MaintenanceAlertCandidate> overdueWarningCandidates() {
//         return jdbcTemplate.query(
//                 "select f.maintenance_fee_id, f.host_id, u.full_name host_name, u.email host_email, f.billing_month, f.billing_year, f.due_date, f.payment_status, f.fee_amount "
//                         + "from host_maintenance_fees f join users u on u.user_id=f.host_id "
//                         + "where f.payment_status='OVERDUE' and f.overdue_warning_sent_at is null",
//                 this::mapMaintenanceAlertCandidate
//         );
//     }

//     public void markMaintenanceReminderSent(Long maintenanceFeeId) {
//         jdbcTemplate.update("update host_maintenance_fees set reminder_sent_at=now(), updated_at=now() where maintenance_fee_id=?", maintenanceFeeId);
//     }

//     public void markMaintenanceOverdueWarningSent(Long maintenanceFeeId) {
//         jdbcTemplate.update("update host_maintenance_fees set overdue_warning_sent_at=now(), updated_at=now() where maintenance_fee_id=?", maintenanceFeeId);
//     }


//     public boolean claimMaintenanceReminder(Long maintenanceFeeId) {
//         return jdbcTemplate.update(
//                 "update host_maintenance_fees set reminder_sent_at=now(), updated_at=now() where maintenance_fee_id=? and reminder_sent_at is null",
//                 maintenanceFeeId
//         ) > 0;
//     }

//     public boolean claimMaintenanceOverdueWarning(Long maintenanceFeeId) {
//         return jdbcTemplate.update(
//                 "update host_maintenance_fees set overdue_warning_sent_at=now(), updated_at=now() where maintenance_fee_id=? and overdue_warning_sent_at is null",
//                 maintenanceFeeId
//         ) > 0;
//     }

//     public int lockHostsWithOverdueCount(int threshold) {
//         int lockedUsers = jdbcTemplate.update(
//                 "update users u set u.host_subscription_status='OVERDUE', u.host_can_receive_booking=false, u.updated_at=now() "
//                         + "where (select count(*) from host_maintenance_fees f where f.host_id=u.user_id and f.payment_status='OVERDUE') >= ?",
//                 threshold
//         );
//         jdbcTemplate.update(
//                 "update homestays h set h.status='BLOCKED', h.updated_at=now() "
//                         + "where h.deleted_at is null and upper(coalesce(h.status,'')) <> 'REJECTED' "
//                         + "and (select count(*) from host_maintenance_fees f where f.host_id=h.user_id and f.payment_status='OVERDUE') >= ?",
//                 threshold
//         );
//         return lockedUsers;
//     }

//     public List<HostMaintenanceNotificationResponse> hostMaintenanceNotifications(Integer hostId, LocalDate today) {
//         LocalDate reminderLimit = today.plusDays(3);
//         return jdbcTemplate.query(
//                 "select maintenance_fee_id, billing_month, billing_year, due_date, payment_status, created_at "
//                         + "from host_maintenance_fees "
//                         + "where host_id=? and payment_status in ('PENDING','OVERDUE') "
//                         + "and (payment_status='OVERDUE' or due_date <= ?) "
//                         + "order by case when payment_status='OVERDUE' then 0 else 1 end, due_date asc, maintenance_fee_id desc limit 30",
//                 (rs, rowNum) -> {
//                     String status = rs.getString("payment_status");
//                     Integer month = rs.getInt("billing_month");
//                     Integer year = rs.getInt("billing_year");
//                     LocalDate due = rs.getDate("due_date").toLocalDate();
//                     boolean overdue = "OVERDUE".equalsIgnoreCase(status);
//                     return HostMaintenanceNotificationResponse.builder()
//                             .maintenanceFeeId(rs.getLong("maintenance_fee_id"))
//                             .notificationType(overdue ? "OVERDUE" : "DUE_SOON")
//                             .title(overdue ? "Phí duy trì đã quá hạn" : "Sắp đến hạn đóng phí duy trì")
//                             .message("Phí duy trì tháng " + month + "/" + year + (overdue ? " đã quá hạn từ ngày " : " sẽ đến hạn vào ngày ") + due + ".")
//                             .billingMonth(month)
//                             .billingYear(year)
//                             .dueDate(due)
//                             .paymentStatus(status)
//                             .createdAt(ts(rs, "created_at"))
//                             .build();
//                 },
//                 hostId, Date.valueOf(reminderLimit)
//         );
//     }

//     public boolean canHostReceiveBooking(Integer homeId) {
//         Integer allowed = jdbcTemplate.queryForObject("select coalesce(u.host_can_receive_booking, true) from homestays h join users u on u.user_id=h.user_id where h.home_id=?", Integer.class, homeId);
//         return allowed == null || allowed == 1;
//     }

//     public List<MaintenanceFeeResponse> hostMaintenanceHistory(Integer hostId, Integer year, String status, int page, int size) {
//         List<Object> args = new ArrayList<>();
//         args.add(hostId);
//         StringBuilder where = new StringBuilder(" where f.host_id=?");
//         if (year != null) { where.append(" and f.billing_year=?"); args.add(year); }
//         if (status != null && !status.isBlank()) { where.append(" and f.payment_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
//         args.add(size); args.add(page * size);
//         return jdbcTemplate.query("select f.*, u.full_name host_name from host_maintenance_fees f join users u on u.user_id=f.host_id" + where + " order by f.billing_year desc,f.billing_month desc limit ? offset ?", this::mapMaintenanceFee, args.toArray());
//     }

//     private void extendHostSubscription(Long maintenanceFeeId) {
//         jdbcTemplate.update("update users u join host_maintenance_fees f on f.host_id=u.user_id set u.host_subscription_status='ACTIVE', u.host_can_receive_booking=true, u.host_subscription_expires_at=f.period_end where f.maintenance_fee_id=?", maintenanceFeeId);
//     }

//     private String commissionWhere(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId, String status, String paymentMethod, String keyword, List<Object> args) {
//         StringBuilder where = new StringBuilder(" where coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?");
//         args.add(Timestamp.valueOf(fromDate.atStartOfDay()));
//         args.add(Timestamp.valueOf(toDate.plusDays(1).atStartOfDay()));
//         if (hostId != null) { where.append(" and bc.host_id=?"); args.add(hostId); }
//         if (homestayId != null) { where.append(" and h.home_id=?"); args.add(homestayId); }
//         if (status != null && !status.isBlank()) { where.append(" and bc.commission_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
//         if (paymentMethod != null && !paymentMethod.isBlank()) { where.append(" and upper(coalesce(b.payment_method,''))=?"); args.add(paymentMethod.toUpperCase(Locale.ROOT)); }
//         if (keyword != null && !keyword.isBlank()) { where.append(" and (upper(b.booking_code) like ? or upper(c.full_name) like ? or upper(h.home_name) like ? or upper(host.full_name) like ?)"); String kw = "%" + keyword.trim().toUpperCase(Locale.ROOT) + "%"; args.add(kw); args.add(kw); args.add(kw); args.add(kw); }
//         return where.toString();
//     }

//     private String commissionFromSql() { return " from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join users c on c.user_id=b.user_id join homestays h on h.home_id=b.home_id join users host on host.user_id=bc.host_id join booking_details bd on bd.booking_id=b.booking_id left join (select booking_id, coalesce(sum(total_price),0) service_total from booking_services group by booking_id) st on st.booking_id=b.booking_id"; }
//     private String adminCommissionSelect() { return "bc.commission_id,bc.booking_id,coalesce(b.booking_code,concat('BK',lpad(b.booking_id,6,'0'))) booking_code,c.full_name customer_name,bc.host_id,host.full_name host_name,h.home_id homestay_id,h.home_name homestay_name,bd.checkin_date,bd.checkout_date,bc.booking_amount,bc.refund_amount,bc.retained_amount,bc.commission_rate,bc.commission_amount,bc.host_receivable_amount,b.booking_status,b.payment_status,b.payment_method,bc.commission_status,bc.cancellation_type,bc.refund_status,bc.calculated_at,bc.recognized_at,bc.recognized_at completed_at,bc.paid_to_host_at,bc.payout_reference"; }
//     private String hostBookingSelect() { return "bc.commission_id,bc.booking_id,coalesce(b.booking_code,concat('BK',lpad(b.booking_id,6,'0'))) booking_code,h.home_name,c.full_name customer_name,bd.checkin_date,bd.checkout_date,b.created_at,coalesce(bc.recognized_at,bc.calculated_at) paid_at,b.booking_status,b.payment_status,b.payment_method,bc.booking_amount,bc.refund_amount,bc.retained_amount,bc.commission_rate,bc.commission_amount,bc.host_receivable_amount,coalesce(b.total_price,bc.booking_amount) total_price,coalesce(nullif(bd.line_total,0), greatest(coalesce(bc.booking_amount,0) - coalesce(st.service_total,0) + coalesce(b.discount_amount,0),0)) room_total,coalesce(st.service_total,0) service_total,coalesce(b.discount_amount,0) discount_amount,bc.commission_status,bc.paid_to_host_at"; }

//     private PlatformFeeSettingResponse mapFeeSetting(ResultSet rs, int rowNum) throws SQLException { return PlatformFeeSettingResponse.builder().settingId(rs.getLong("setting_id")).settingName(rs.getString("setting_name")).commissionRate(rate(rs.getBigDecimal("commission_rate"))).monthlyMaintenanceFee(money(rs.getBigDecimal("monthly_maintenance_fee"))).freeTrialDays(rs.getInt("free_trial_days")).gracePeriodDays(rs.getInt("grace_period_days")).effectiveFrom(rs.getDate("effective_from").toLocalDate()).effectiveTo(rs.getDate("effective_to") == null ? null : rs.getDate("effective_to").toLocalDate()).settingStatus(rs.getString("setting_status")).build(); }
//     private CommissionRow mapCommissionRow(ResultSet rs, int rowNum) throws SQLException { return CommissionRow.builder().commissionId(rs.getLong("commission_id")).bookingId(rs.getInt("booking_id")).commissionStatus(rs.getString("commission_status")).bookingAmount(money(rs.getBigDecimal("booking_amount"))).refundAmount(money(rs.getBigDecimal("refund_amount"))).retainedAmount(money(rs.getBigDecimal("retained_amount"))).commissionRate(rate(rs.getBigDecimal("commission_rate"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable_amount"))).build(); }
//     private RevenueTopItemResponse mapTopItem(ResultSet rs, int rowNum) throws SQLException { return RevenueTopItemResponse.builder().id(rs.getInt("id")).name(rs.getString("name")).subLabel(rs.getString("sub_label")).commissionRevenue(money(rs.getBigDecimal("commission_revenue"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable"))).bookingCount(rs.getInt("booking_count")).build(); }
//     private AdminCommissionResponse mapAdminCommission(ResultSet rs, int rowNum) throws SQLException { return AdminCommissionResponse.builder().commissionId(rs.getLong("commission_id")).bookingId(rs.getInt("booking_id")).bookingCode(rs.getString("booking_code")).customerName(rs.getString("customer_name")).hostId(rs.getInt("host_id")).hostName(rs.getString("host_name")).homestayId(rs.getInt("homestay_id")).homestayName(rs.getString("homestay_name")).checkinDate(rs.getDate("checkin_date").toLocalDate()).checkoutDate(rs.getDate("checkout_date").toLocalDate()).bookingAmount(money(rs.getBigDecimal("booking_amount"))).refundAmount(money(rs.getBigDecimal("refund_amount"))).retainedAmount(money(rs.getBigDecimal("retained_amount"))).commissionRate(rate(rs.getBigDecimal("commission_rate"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable_amount"))).bookingStatus(rs.getString("booking_status")).paymentStatus(rs.getString("payment_status")).paymentMethod(rs.getString("payment_method")).commissionStatus(rs.getString("commission_status")).cancellationType(rs.getString("cancellation_type")).refundStatus(rs.getString("refund_status")).calculatedAt(ts(rs,"calculated_at")).recognizedAt(ts(rs,"recognized_at")).completedAt(ts(rs,"completed_at")).paidToHostAt(ts(rs,"paid_to_host_at")).payoutReference(rs.getString("payout_reference")).build(); }
//     private HostRevenueBookingResponse mapHostBooking(ResultSet rs, int rowNum) throws SQLException { return HostRevenueBookingResponse.builder().commissionId(rs.getLong("commission_id")).bookingId(rs.getInt("booking_id")).bookingCode(rs.getString("booking_code")).homestayName(rs.getString("home_name")).customerName(rs.getString("customer_name")).checkInDate(rs.getDate("checkin_date").toLocalDate()).checkOutDate(rs.getDate("checkout_date").toLocalDate()).createdAt(ts(rs,"created_at")).paidAt(ts(rs,"paid_at")).bookingStatus(rs.getString("booking_status")).paymentStatus(rs.getString("payment_status")).paymentMethod(rs.getString("payment_method")).bookingAmount(money(rs.getBigDecimal("booking_amount"))).refundAmount(money(rs.getBigDecimal("refund_amount"))).retainedAmount(money(rs.getBigDecimal("retained_amount"))).commissionRate(rate(rs.getBigDecimal("commission_rate"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable_amount"))).totalPrice(money(rs.getBigDecimal("total_price"))).roomTotal(money(rs.getBigDecimal("room_total"))).serviceTotal(money(rs.getBigDecimal("service_total"))).discountAmount(money(rs.getBigDecimal("discount_amount"))).commissionStatus(rs.getString("commission_status")).paidToHostAt(ts(rs,"paid_to_host_at")).build(); }
//     private MaintenanceFeeResponse mapMaintenanceFee(ResultSet rs, int rowNum) throws SQLException { return MaintenanceFeeResponse.builder().maintenanceFeeId(rs.getLong("maintenance_fee_id")).hostId(rs.getInt("host_id")).hostName(rs.getString("host_name")).billingMonth(rs.getInt("billing_month")).billingYear(rs.getInt("billing_year")).periodStart(rs.getDate("period_start").toLocalDate()).periodEnd(rs.getDate("period_end").toLocalDate()).feeAmount(money(rs.getBigDecimal("fee_amount"))).dueDate(rs.getDate("due_date").toLocalDate()).paymentStatus(rs.getString("payment_status")).paidAt(ts(rs,"paid_at")).paymentMethod(rs.getString("payment_method")).transactionReference(rs.getString("transaction_reference")).adminNote(rs.getString("admin_note")).reminderSentAt(ts(rs,"reminder_sent_at")).overdueWarningSentAt(ts(rs,"overdue_warning_sent_at")).build(); }

//     private MaintenanceAlertCandidate mapMaintenanceAlertCandidate(ResultSet rs, int rowNum) throws SQLException {
//         return MaintenanceAlertCandidate.builder()
//                 .maintenanceFeeId(rs.getLong("maintenance_fee_id"))
//                 .hostId(rs.getInt("host_id"))
//                 .hostName(rs.getString("host_name"))
//                 .hostEmail(rs.getString("host_email"))
//                 .billingMonth(rs.getInt("billing_month"))
//                 .billingYear(rs.getInt("billing_year"))
//                 .dueDate(rs.getDate("due_date").toLocalDate())
//                 .paymentStatus(rs.getString("payment_status"))
//                 .feeAmount(money(rs.getBigDecimal("fee_amount")))
//                 .build();
//     }
//     private BigDecimal queryMoney(String sql, Object... args) { BigDecimal value = jdbcTemplate.queryForObject(sql, BigDecimal.class, args); return money(value); }
//     private String adminOwnerFilter(Integer hostId, Integer homestayId) { return (hostId == null ? "" : " and h.user_id=?") + (homestayId == null ? "" : " and h.home_id=?"); }
//     private Object[] adminArgs(Object a, Object b, Integer hostId, Integer homestayId) { List<Object> args = new ArrayList<>(List.of(a,b)); if (hostId != null) args.add(hostId); if (homestayId != null) args.add(homestayId); return args.toArray(); }
//     private Object[] adminArgs(Object a, Object b, Object c, Object d, Integer hostId, Integer homestayId) { List<Object> args = new ArrayList<>(List.of(a,b,c,d)); if (hostId != null) args.add(hostId); if (homestayId != null) args.add(homestayId); return args.toArray(); }
//     private String maintenanceHostFilter(Integer hostId) { return hostId == null ? "" : " and host_id=?"; }
//     private String maintenanceOwnerFilter(Integer hostId, Integer homestayId) { return (hostId == null ? "" : " and f.host_id=?") + (homestayId == null ? "" : " and exists (select 1 from homestays mh where mh.user_id=f.host_id and mh.home_id=?)"); }
//     private Object[] maintenanceArgs(Object a, Object b, Object c, Object d, Integer hostId, Integer homestayId) { List<Object> args = new ArrayList<>(List.of(a,b,c,d)); if (hostId != null) args.add(hostId); if (homestayId != null) args.add(homestayId); return args.toArray(); }
//     private Object[] maintenanceArgs(Object a, Object b, Integer hostId) { return hostId == null ? new Object[]{a,b} : new Object[]{a,b,hostId}; }
//     private Object[] maintenanceArgs(Object a, Object b, Object c, Object d, Integer hostId) { return hostId == null ? new Object[]{a,b,c,d} : new Object[]{a,b,c,d,hostId}; }
//     private int totalPages(Long total, int size) { if (total == null || total <= 0) return 0; return (int)Math.ceil(total / (double)Math.max(size, 1)); }
//     private BigDecimal money(BigDecimal value) { return (value == null ? BigDecimal.ZERO : value).setScale(0, RoundingMode.HALF_UP); }
//     private BigDecimal rate(BigDecimal value) { return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP); }
//     private BigDecimal positive(BigDecimal first, BigDecimal fallback) { BigDecimal candidate = money(first); return candidate.compareTo(BigDecimal.ZERO) > 0 ? candidate : money(fallback); }
//     private LocalDateTime ts(ResultSet rs, String col) throws SQLException { Timestamp ts = rs.getTimestamp(col); return ts == null ? null : ts.toLocalDateTime(); }
//     private boolean blank(String s) { return s == null || s.isBlank(); }

//     @Data @Builder public static class BookingMoneySource { private Integer bookingId; private String bookingCode; private String bookingStatus; private String paymentStatus; private String paymentMethod; private Integer homeId; private String homestayName; private Integer hostId; private BigDecimal bookingAmount; private String latestPaymentStatus; }
//     @Data @Builder public static class CommissionRow { private Long commissionId; private Integer bookingId; private String commissionStatus; private BigDecimal bookingAmount; private BigDecimal refundAmount; private BigDecimal retainedAmount; private BigDecimal commissionRate; private BigDecimal commissionAmount; private BigDecimal hostReceivableAmount; }
//     @Data @Builder public static class MaintenanceAlertCandidate { private Long maintenanceFeeId; private Integer hostId; private String hostName; private String hostEmail; private Integer billingMonth; private Integer billingYear; private LocalDate dueDate; private String paymentStatus; private BigDecimal feeAmount; }
//     @Data @Builder private static class SummaryAmount { private BigDecimal gross; private BigDecimal pendingHeld; private BigDecimal commissionRevenue; private BigDecimal pendingHost; private BigDecimal paidOut; private BigDecimal refundTotal; private BigDecimal retained; private BigDecimal hostRevenue; private BigDecimal expectedPending; private BigDecimal roomRevenue; private BigDecimal serviceRevenue; private BigDecimal discountTotal; private BigDecimal average; private Integer completedCount; private Integer cancelledCount; private Integer pendingCount; private Integer occupancyNights; }
//     private record HostSubscription(LocalDate subscriptionExpiresAt, Boolean canReceiveBooking) {}
//     private HostSubscription getHostSubscription(Integer hostId) { try { return jdbcTemplate.queryForObject("select host_subscription_expires_at, coalesce(host_can_receive_booking,true) can_receive from users where user_id=?", (rs, rowNum) -> new HostSubscription(rs.getDate("host_subscription_expires_at") == null ? null : rs.getDate("host_subscription_expires_at").toLocalDate(), rs.getBoolean("can_receive")), hostId); } catch (Exception e) { return new HostSubscription(null, true); } }
// }

package com.homestaybooking.repository;

import com.homestaybooking.dto.response.*;
import com.homestaybooking.exception.AppException;
import jakarta.annotation.PostConstruct;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class RevenueJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureRevenueSchema() {
        try {
            addColumnIfMissing("users", "host_subscription_status", "VARCHAR(30) NULL");
            addColumnIfMissing("users", "host_subscription_expires_at", "DATE NULL");
            addColumnIfMissing("users", "host_can_receive_booking", "BOOLEAN NOT NULL DEFAULT TRUE");
            jdbcTemplate.execute("create table if not exists platform_fee_settings (setting_id bigint not null auto_increment, setting_name varchar(150) not null, commission_rate decimal(5,2) not null default 10.00, monthly_maintenance_fee decimal(14,2) not null default 99000, free_trial_days int not null default 30, grace_period_days int not null default 3, effective_from date not null, effective_to date null, setting_status varchar(30) not null default 'ACTIVE', created_at timestamp not null default current_timestamp, updated_at timestamp null default null on update current_timestamp, primary key (setting_id), key idx_platform_fee_status_date (setting_status, effective_from, effective_to)) engine=InnoDB default character set=utf8mb4 collate=utf8mb4_unicode_ci");
            jdbcTemplate.execute("create table if not exists booking_commissions (commission_id bigint not null auto_increment, booking_id int not null, host_id int not null, booking_amount decimal(14,2) not null default 0, refund_amount decimal(14,2) not null default 0, retained_amount decimal(14,2) not null default 0, commission_rate decimal(5,2) not null, commission_amount decimal(14,2) not null default 0, host_receivable_amount decimal(14,2) not null default 0, cancellation_type varchar(30) null, refund_status varchar(30) null, commission_status varchar(30) not null default 'PENDING', calculated_at timestamp not null default current_timestamp, recognized_at timestamp null, refunded_at timestamp null, paid_to_host_at timestamp null, payout_reference varchar(150) null, admin_note text null, created_at timestamp not null default current_timestamp, updated_at timestamp null default null on update current_timestamp, primary key (commission_id), unique key uk_booking_commission_booking (booking_id), key idx_booking_commission_host_status (host_id, commission_status), key idx_booking_commission_recognized (recognized_at)) engine=InnoDB default character set=utf8mb4 collate=utf8mb4_unicode_ci");
            addColumnIfMissing("booking_commissions", "refund_amount", "DECIMAL(14,2) NOT NULL DEFAULT 0");
            addColumnIfMissing("booking_commissions", "retained_amount", "DECIMAL(14,2) NOT NULL DEFAULT 0");
            addColumnIfMissing("booking_commissions", "cancellation_type", "VARCHAR(30) NULL");
            addColumnIfMissing("booking_commissions", "refund_status", "VARCHAR(30) NULL");
            addColumnIfMissing("booking_commissions", "refunded_at", "TIMESTAMP NULL");
            addColumnIfMissing("booking_commissions", "payout_reference", "VARCHAR(150) NULL");
            migratePaidOutCommissions();
            jdbcTemplate.execute("create table if not exists host_maintenance_fees (maintenance_fee_id bigint not null auto_increment, host_id int not null, billing_month tinyint not null, billing_year smallint not null, period_start date not null, period_end date not null, fee_amount decimal(14,2) not null, due_date date not null, payment_status varchar(30) not null default 'PENDING', paid_at timestamp null, payment_method varchar(30) null, transaction_reference varchar(150) null, admin_note text null, created_at timestamp not null default current_timestamp, updated_at timestamp null default null on update current_timestamp, primary key (maintenance_fee_id), unique key uk_host_maintenance_month (host_id,billing_year,billing_month), key idx_maintenance_status_due (payment_status,due_date), key idx_maintenance_host_period (host_id,billing_year,billing_month)) engine=InnoDB default character set=utf8mb4 collate=utf8mb4_unicode_ci");
            addColumnIfMissing("host_maintenance_fees", "reminder_sent_at", "TIMESTAMP NULL");
            addColumnIfMissing("host_maintenance_fees", "overdue_warning_sent_at", "TIMESTAMP NULL");
            markExistingOverdueWarningsAsSent();
            ensureDefaultFeeSetting();
            ensureCurrentMaintenanceFees(LocalDate.now());
            backfillExistingRevenueData();
        } catch (Exception ignored) {
        }
    }

    private void addColumnIfMissing(String tableName, String columnName, String definition) {
        Integer count = jdbcTemplate.queryForObject("select count(*) from information_schema.columns where table_schema = database() and table_name = ? and column_name = ?", Integer.class, tableName, columnName);
        if (count == null || count == 0) jdbcTemplate.execute("alter table " + tableName + " add column " + columnName + " " + definition);
    }

    private void migratePaidOutCommissions() {
        jdbcTemplate.update("update booking_commissions set commission_status='RECOGNIZED', recognized_at=coalesce(recognized_at, paid_to_host_at, updated_at, calculated_at, now()), updated_at=now() where commission_status='PAID_OUT'");
        jdbcTemplate.update("update booking_commissions set recognized_at=coalesce(recognized_at, updated_at, calculated_at, now()), updated_at=now() where commission_status='RECOGNIZED' and recognized_at is null");
        try {
            jdbcTemplate.execute("alter table booking_commissions modify column commission_status varchar(30) not null default 'PENDING' comment 'PENDING, RECOGNIZED, CANCELLED'");
        } catch (Exception ignored) {
        }
    }

    private void ensureDefaultFeeSetting() {
        Integer count = jdbcTemplate.queryForObject("select count(*) from platform_fee_settings where setting_status='ACTIVE' and effective_from <= current_date and (effective_to is null or effective_to >= current_date)", Integer.class);
        if (count == null || count == 0) jdbcTemplate.update("insert into platform_fee_settings (setting_name, commission_rate, monthly_maintenance_fee, free_trial_days, grace_period_days, effective_from, setting_status) values ('Phi mac dinh Cozygo', 10.00, 99000, 30, 3, current_date, 'ACTIVE')");
    }


    private void markExistingOverdueWarningsAsSent() {
        jdbcTemplate.update("update host_maintenance_fees set overdue_warning_sent_at=coalesce(overdue_warning_sent_at, updated_at, created_at, now()) where payment_status='OVERDUE' and overdue_warning_sent_at is null");
    }

    private void backfillExistingRevenueData() {
        BigDecimal rate = getActiveFeeSetting(LocalDate.now()).getCommissionRate();
        String amount = "coalesce(nullif(p.amount,0), nullif(b.total_price,0), nullif(b.subtotal,0), nullif(bd.line_total,0), 0)";
        String explicitCompleted = "upper(coalesce(b.booking_status,'')) in ('COMPLETED','DONE','FINISHED')";
        String inferredCompleted = "upper(coalesce(b.booking_status,''))='CONFIRMED' and bd.checkout_date <= current_date";
        String cancelled = "upper(coalesce(b.booking_status,'')) in ('CANCELLED','CANCELED','CANCELLED_BY_HOST','REJECTED','EXPIRED','DELETED')";
        String paid = "(upper(coalesce(b.payment_status,'')) in ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN') "
                + "or upper(coalesce(p.payment_status,'')) in ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN'))";
        String collected = "((" + explicitCompleted + " and (upper(coalesce(b.payment_method,''))='PAY_AT_PROPERTY' or " + paid + ")) "
                + "or (" + inferredCompleted + " and " + paid + "))";
        String from = " from bookings b join homestays h on h.home_id=b.home_id "
                + "left join booking_details bd on bd.booking_id=b.booking_id "
                + "left join payments p on p.payment_id=(select max(p2.payment_id) from payments p2 where p2.booking_id=b.booking_id) ";

        jdbcTemplate.update(
                "insert ignore into booking_commissions "
                        + "(booking_id, host_id, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount, refund_status, commission_status, calculated_at, recognized_at, created_at, updated_at) "
                        + "select b.booking_id, h.user_id, " + amount + ", 0, " + amount + ", ?, "
                        + "round(" + amount + " * ? / 100, 0), "
                        + "greatest(" + amount + " - round(" + amount + " * ? / 100, 0), 0), "
                        + "'NONE', 'RECOGNIZED', coalesce(b.created_at, now()), coalesce(b.updated_at, b.created_at, now()), coalesce(b.created_at, now()), now()"
                        + from
                        + "where " + collected + " and " + amount + " > 0",
                rate, rate, rate
        );

        jdbcTemplate.update(
                "update booking_commissions bc join bookings b on b.booking_id=bc.booking_id "
                        + "join homestays h on h.home_id=b.home_id "
                        + "left join booking_details bd on bd.booking_id=b.booking_id "
                        + "left join payments p on p.payment_id=(select max(p2.payment_id) from payments p2 where p2.booking_id=b.booking_id) "
                        + "set bc.host_id=h.user_id, bc.booking_amount=" + amount + ", bc.refund_amount=0, bc.retained_amount=" + amount + ", "
                        + "bc.commission_rate=case when bc.commission_rate is null or bc.commission_rate=0 then ? else bc.commission_rate end, "
                        + "bc.commission_amount=round(" + amount + " * (case when bc.commission_rate is null or bc.commission_rate=0 then ? else bc.commission_rate end) / 100, 0), "
                        + "bc.host_receivable_amount=greatest(" + amount + " - round(" + amount + " * (case when bc.commission_rate is null or bc.commission_rate=0 then ? else bc.commission_rate end) / 100, 0), 0), "
                        + "bc.refund_status='NONE', bc.commission_status='RECOGNIZED', bc.recognized_at=coalesce(bc.recognized_at, b.updated_at, b.created_at, now()), bc.updated_at=now() "
                        + "where bc.commission_status='PENDING' and " + collected + " and " + amount + " > 0",
                rate, rate, rate
        );

        jdbcTemplate.update(
                "update booking_commissions bc join bookings b on b.booking_id=bc.booking_id "
                        + "set bc.refund_amount=bc.booking_amount, bc.retained_amount=0, bc.commission_amount=0, bc.host_receivable_amount=0, "
                        + "bc.commission_status='CANCELLED', bc.refund_status='REFUNDED', bc.updated_at=now() "
                        + "where " + cancelled
        );
    }

    public PlatformFeeSettingResponse getActiveFeeSetting(LocalDate date) {
        ensureDefaultFeeSetting();
        try {
            return jdbcTemplate.queryForObject("select * from platform_fee_settings where setting_status='ACTIVE' and effective_from <= ? and (effective_to is null or effective_to >= ?) order by effective_from desc, setting_id desc limit 1", this::mapFeeSetting, Date.valueOf(date), Date.valueOf(date));
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("ACTIVE_PLATFORM_FEE_SETTING_NOT_FOUND");
        }
    }

    public PlatformFeeSettingResponse createNewFeeSetting(String name, BigDecimal rate, BigDecimal monthlyFee, Integer trialDays, Integer graceDays, LocalDate effectiveFrom) {
        LocalDate start = effectiveFrom == null ? LocalDate.now() : effectiveFrom;
        jdbcTemplate.update("update platform_fee_settings set effective_to=?, setting_status='INACTIVE', updated_at=now() where setting_status='ACTIVE' and (effective_to is null or effective_to >= ?)", Date.valueOf(start.minusDays(1)), Date.valueOf(start));
        jdbcTemplate.update("insert into platform_fee_settings (setting_name, commission_rate, monthly_maintenance_fee, free_trial_days, grace_period_days, effective_from, setting_status) values (?,?,?,?,?,?, 'ACTIVE')", blank(name) ? "Phi mac dinh Cozygo" : name, rate, monthlyFee, trialDays, graceDays, Date.valueOf(start));
        return getActiveFeeSetting(start);
    }

    public BookingMoneySource loadBookingMoneySource(Integer bookingId) {
        try {
            return jdbcTemplate.queryForObject("select b.booking_id, coalesce(b.booking_code, concat('BK', lpad(b.booking_id, 6, '0'))) booking_code, b.booking_status, b.payment_status, b.payment_method, b.total_price, h.home_id, h.home_name, h.user_id host_id, coalesce(p.amount, b.total_price) paid_amount, p.payment_status latest_payment_status from bookings b join homestays h on h.home_id=b.home_id left join payments p on p.payment_id=(select max(p2.payment_id) from payments p2 where p2.booking_id=b.booking_id) where b.booking_id=?", (rs, rowNum) -> BookingMoneySource.builder().bookingId(rs.getInt("booking_id")).bookingCode(rs.getString("booking_code")).bookingStatus(rs.getString("booking_status")).paymentStatus(rs.getString("payment_status")).paymentMethod(rs.getString("payment_method")).homeId(rs.getInt("home_id")).homestayName(rs.getString("home_name")).hostId(rs.getInt("host_id")).bookingAmount(positive(rs.getBigDecimal("paid_amount"), rs.getBigDecimal("total_price"))).latestPaymentStatus(rs.getString("latest_payment_status")).build(), bookingId);
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("BOOKING_NOT_FOUND");
        }
    }

    public CommissionRow findCommissionByBookingId(Integer bookingId) {
        List<CommissionRow> rows = jdbcTemplate.query("select commission_id, booking_id, commission_status, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount from booking_commissions where booking_id=?", this::mapCommissionRow, bookingId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public CommissionRow findCommissionById(Long commissionId) {
        List<CommissionRow> rows = jdbcTemplate.query("select commission_id, booking_id, commission_status, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount from booking_commissions where commission_id=?", this::mapCommissionRow, commissionId);
        if (rows.isEmpty()) throw new AppException("COMMISSION_NOT_FOUND");
        return rows.get(0);
    }

    public void insertPendingCommission(BookingMoneySource source, BigDecimal rate, BigDecimal commission, BigDecimal hostReceivable) {
        jdbcTemplate.update("insert into booking_commissions (booking_id, host_id, booking_amount, refund_amount, retained_amount, commission_rate, commission_amount, host_receivable_amount, refund_status, commission_status) values (?, ?, ?, 0, ?, ?, ?, ?, 'NONE', 'PENDING') "
                + "on duplicate key update "
                + "host_id=if(commission_status='PENDING', values(host_id), host_id), "
                + "booking_amount=if(commission_status='PENDING', values(booking_amount), booking_amount), "
                + "refund_amount=if(commission_status='PENDING', 0, refund_amount), "
                + "retained_amount=if(commission_status='PENDING', values(retained_amount), retained_amount), "
                + "commission_rate=if(commission_status='PENDING', values(commission_rate), commission_rate), "
                + "commission_amount=if(commission_status='PENDING', values(commission_amount), commission_amount), "
                + "host_receivable_amount=if(commission_status='PENDING', values(host_receivable_amount), host_receivable_amount), "
                + "cancellation_type=if(commission_status='PENDING', null, cancellation_type), "
                + "refund_status=if(commission_status='PENDING', 'NONE', refund_status), "
                + "updated_at=if(commission_status='PENDING', now(), updated_at)",
                source.getBookingId(), source.getHostId(), source.getBookingAmount(), source.getBookingAmount(), rate, commission, hostReceivable);
    }

    public void updatePendingCommission(Integer bookingId, Integer hostId, BigDecimal bookingAmount, BigDecimal rate, BigDecimal commission, BigDecimal hostReceivable) {
        jdbcTemplate.update("update booking_commissions set host_id=?, booking_amount=?, refund_amount=0, retained_amount=?, commission_rate=?, commission_amount=?, host_receivable_amount=?, cancellation_type=null, refund_status='NONE', updated_at=now() where booking_id=? and commission_status='PENDING'", hostId, bookingAmount, bookingAmount, rate, commission, hostReceivable, bookingId);
    }

    public int recognizeCommission(Integer bookingId) {
        return jdbcTemplate.update("update booking_commissions set commission_status='RECOGNIZED', recognized_at=coalesce(recognized_at, now()), updated_at=now() where booking_id=? and commission_status='PENDING'", bookingId);
    }

    public int updateCommissionRefund(Integer bookingId, BigDecimal refundAmount, BigDecimal retainedAmount, BigDecimal commissionAmount, BigDecimal hostReceivableAmount, String cancellationType, String refundStatus, String commissionStatus, String adminNote) {
        return jdbcTemplate.update("update booking_commissions set refund_amount=?, retained_amount=?, commission_amount=?, host_receivable_amount=?, cancellation_type=?, refund_status=?, commission_status=?, recognized_at=case when ?='RECOGNIZED' then coalesce(recognized_at,now()) else recognized_at end, refunded_at=case when ? in ('REFUNDED','PARTIALLY_REFUNDED') then coalesce(refunded_at,now()) else refunded_at end, admin_note=coalesce(?,admin_note), updated_at=now() where booking_id=? and commission_status <> 'PAID_OUT'", refundAmount, retainedAmount, commissionAmount, hostReceivableAmount, cancellationType, refundStatus, commissionStatus, commissionStatus, refundStatus, adminNote, bookingId);
    }

    public int markPaidOut(Long commissionId, String payoutReference, String adminNote) {
        return jdbcTemplate.update("update booking_commissions set commission_status='PAID_OUT', paid_to_host_at=now(), payout_reference=?, admin_note=?, updated_at=now() where commission_id=? and commission_status='RECOGNIZED' and host_receivable_amount > 0", payoutReference, adminNote, commissionId);
    }

    public AdminRevenueSummaryResponse adminSummary(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        SummaryAmount commission = jdbcTemplate.queryForObject(
                "select coalesce(sum(bc.booking_amount),0) completed_value, "
                        + "count(*) completed_count, "
                        + "coalesce(sum(bc.commission_amount),0) commission_revenue "
                        + "from booking_commissions bc "
                        + "join bookings b on b.booking_id=bc.booking_id "
                        + "join homestays h on h.home_id=b.home_id "
                        + "where bc.commission_status='RECOGNIZED' "
                        + "and bc.recognized_at >= ? and bc.recognized_at < ?"
                        + adminOwnerFilter(hostId, homestayId),
                (rs, rowNum) -> SummaryAmount.builder()
                        .gross(money(rs.getBigDecimal("completed_value")))
                        .completedCount(rs.getInt("completed_count"))
                        .commissionRevenue(money(rs.getBigDecimal("commission_revenue")))
                        .build(),
                adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId)
        );

        Integer cancelledCount = jdbcTemplate.queryForObject(
                "select count(*) "
                        + "from bookings b "
                        + "join homestays h on h.home_id=b.home_id "
                        + "where upper(coalesce(b.booking_status,'')) "
                        + "in ('CANCELLED','CANCELED','CANCELLED_BY_HOST','REJECTED','EXPIRED','DELETED') "
                        + "and coalesce(b.updated_at,b.created_at) >= ? "
                        + "and coalesce(b.updated_at,b.created_at) < ?"
                        + adminOwnerFilter(hostId, homestayId),
                Integer.class,
                adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId)
        );

        SummaryAmount maintenance;
        if (homestayId != null) {
            maintenance = SummaryAmount.builder()
                    .retained(BigDecimal.ZERO)
                    .pendingCount(0)
                    .pendingHeld(BigDecimal.ZERO)
                    .pendingHost(BigDecimal.ZERO)
                    .build();
        } else {
            List<Object> maintenanceArgs = new ArrayList<>();
            maintenanceArgs.add(Timestamp.valueOf(from));
            maintenanceArgs.add(Timestamp.valueOf(to));
            maintenanceArgs.add(Timestamp.valueOf(from));
            maintenanceArgs.add(Timestamp.valueOf(to));
            maintenanceArgs.add(Date.valueOf(fromDate));
            maintenanceArgs.add(Date.valueOf(toDate));
            maintenanceArgs.add(Date.valueOf(fromDate));
            maintenanceArgs.add(Date.valueOf(toDate));
            if (hostId != null) {
                maintenanceArgs.add(hostId);
            }

            maintenance = jdbcTemplate.queryForObject(
                    "select "
                            + "coalesce(sum(case when f.payment_status='PAID' "
                            + "and f.paid_at >= ? and f.paid_at < ? then f.fee_amount else 0 end),0) maintenance_revenue, "
                            + "count(distinct case when f.payment_status='PAID' "
                            + "and f.paid_at >= ? and f.paid_at < ? then f.host_id end) paid_host_count, "
                            + "coalesce(sum(case when f.payment_status='PENDING' "
                            + "and f.period_end >= ? and f.period_start <= ? then f.fee_amount else 0 end),0) pending_amount, "
                            + "coalesce(sum(case when f.payment_status='OVERDUE' "
                            + "and f.period_end >= ? and f.period_start <= ? then f.fee_amount else 0 end),0) overdue_amount "
                            + "from host_maintenance_fees f where 1=1"
                            + maintenanceOwnerFilter(hostId),
                    (rs, rowNum) -> SummaryAmount.builder()
                            .retained(money(rs.getBigDecimal("maintenance_revenue")))
                            .pendingCount(rs.getInt("paid_host_count"))
                            .pendingHeld(money(rs.getBigDecimal("pending_amount")))
                            .pendingHost(money(rs.getBigDecimal("overdue_amount")))
                            .build(),
                    maintenanceArgs.toArray()
            );
        }

        BigDecimal commissionRevenue = money(commission == null ? BigDecimal.ZERO : commission.commissionRevenue);
        BigDecimal maintenanceRevenue = money(maintenance == null ? BigDecimal.ZERO : maintenance.retained);
        int completedCount = commission == null || commission.completedCount == null ? 0 : commission.completedCount;
        BigDecimal averageCommission = completedCount == 0
                ? BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP)
                : commissionRevenue.divide(BigDecimal.valueOf(completedCount), 0, RoundingMode.HALF_UP);

        return AdminRevenueSummaryResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .completedBookingValue(money(commission == null ? BigDecimal.ZERO : commission.gross))
                .completedBookingCount(completedCount)
                .cancelledBookingCount(cancelledCount == null ? 0 : cancelledCount)
                .commissionRevenue(commissionRevenue)
                .maintenanceRevenue(maintenanceRevenue)
                .totalPlatformRevenue(commissionRevenue.add(maintenanceRevenue).setScale(0, RoundingMode.HALF_UP))
                .paidMaintenanceHostCount(maintenance == null || maintenance.pendingCount == null ? 0 : maintenance.pendingCount)
                .averageCommission(averageCommission)
                .pendingMaintenanceAmount(money(maintenance == null ? BigDecimal.ZERO : maintenance.pendingHeld))
                .overdueMaintenanceAmount(money(maintenance == null ? BigDecimal.ZERO : maintenance.pendingHost))
                .grossCustomerPayments(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .pendingHeldAmount(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .pendingHostPayable(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .paidOutToHosts(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .totalRefundAmount(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .build();
    }

    public List<RevenueChartPointResponse> adminChart(LocalDate fromDate, LocalDate toDate, String groupBy, Integer hostId, Integer homestayId) {
        boolean groupByMonth = "MONTH".equalsIgnoreCase(groupBy);
        String format = groupByMonth ? "%Y-%m" : "%Y-%m-%d";
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        Map<String, ChartAccumulator> totals = new LinkedHashMap<>();

        List<Object> commissionArgs = new ArrayList<>();
        commissionArgs.add(format);
        commissionArgs.add(Timestamp.valueOf(from));
        commissionArgs.add(Timestamp.valueOf(to));
        if (hostId != null) {
            commissionArgs.add(hostId);
        }
        if (homestayId != null) {
            commissionArgs.add(homestayId);
        }
        commissionArgs.add(format);

        List<ChartAccumulator> commissionRows = jdbcTemplate.query(
                "select date_format(bc.recognized_at, ?) period, "
                        + "coalesce(sum(bc.booking_amount),0) completed_booking_value, "
                        + "count(*) completed_booking_count, "
                        + "coalesce(sum(bc.commission_amount),0) commission_revenue "
                        + "from booking_commissions bc "
                        + "join bookings b on b.booking_id=bc.booking_id "
                        + "join homestays h on h.home_id=b.home_id "
                        + "where bc.commission_status='RECOGNIZED' "
                        + "and bc.recognized_at >= ? and bc.recognized_at < ?"
                        + adminOwnerFilter(hostId, homestayId)
                        + " group by date_format(bc.recognized_at, ?) "
                        + "order by period",
                (rs, rowNum) -> new ChartAccumulator(
                        rs.getString("period"),
                        money(rs.getBigDecimal("completed_booking_value")),
                        rs.getInt("completed_booking_count"),
                        money(rs.getBigDecimal("commission_revenue")),
                        BigDecimal.ZERO
                ),
                commissionArgs.toArray()
        );

        for (ChartAccumulator row : commissionRows) {
            mergeChartAccumulator(totals, row);
        }

        // Phí duy trì thuộc Host, không phân bổ vào một Homestay cụ thể.
        if (homestayId == null) {
            List<Object> maintenanceArgs = new ArrayList<>();
            maintenanceArgs.add(format);
            maintenanceArgs.add(Timestamp.valueOf(from));
            maintenanceArgs.add(Timestamp.valueOf(to));
            if (hostId != null) {
                maintenanceArgs.add(hostId);
            }
            maintenanceArgs.add(format);

            List<ChartAccumulator> maintenanceRows = jdbcTemplate.query(
                    "select date_format(f.paid_at, ?) period, "
                            + "coalesce(sum(f.fee_amount),0) maintenance_revenue "
                            + "from host_maintenance_fees f "
                            + "where f.payment_status='PAID' "
                            + "and f.paid_at >= ? and f.paid_at < ?"
                            + maintenanceOwnerFilter(hostId)
                            + " group by date_format(f.paid_at, ?) "
                            + "order by period",
                    (rs, rowNum) -> new ChartAccumulator(
                            rs.getString("period"),
                            BigDecimal.ZERO,
                            0,
                            BigDecimal.ZERO,
                            money(rs.getBigDecimal("maintenance_revenue"))
                    ),
                    maintenanceArgs.toArray()
            );

            for (ChartAccumulator row : maintenanceRows) {
                mergeChartAccumulator(totals, row);
            }
        }

        if (totals.isEmpty()) {
            return List.of();
        }

        return completeChartPeriods(fromDate, toDate, groupByMonth, totals);
    }

    private void mergeChartAccumulator(Map<String, ChartAccumulator> totals, ChartAccumulator row) {
        ChartAccumulator current = totals.computeIfAbsent(
                row.period,
                key -> new ChartAccumulator(key, BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO)
        );

        current.completedBookingValue = current.completedBookingValue.add(money(row.completedBookingValue));
        current.completedBookingCount += row.completedBookingCount;
        current.commissionRevenue = current.commissionRevenue.add(money(row.commissionRevenue));
        current.maintenanceRevenue = current.maintenanceRevenue.add(money(row.maintenanceRevenue));
    }

    private List<RevenueChartPointResponse> completeChartPeriods(
            LocalDate fromDate,
            LocalDate toDate,
            boolean groupByMonth,
            Map<String, ChartAccumulator> totals
    ) {
        List<RevenueChartPointResponse> result = new ArrayList<>();
        String firstPeriod = totals.keySet().stream().min(String::compareTo).orElse(null);
        String lastPeriod = totals.keySet().stream().max(String::compareTo).orElse(null);

        if (firstPeriod == null || lastPeriod == null) {
            return result;
        }

        if (groupByMonth) {
            YearMonth selectedStart = YearMonth.from(fromDate);
            YearMonth selectedEnd = YearMonth.from(toDate);
            long selectedMonths = ChronoUnit.MONTHS.between(selectedStart, selectedEnd) + 1;

            YearMonth cursor = selectedMonths > 120
                    ? YearMonth.parse(firstPeriod)
                    : selectedStart;
            YearMonth end = selectedMonths > 120
                    ? YearMonth.parse(lastPeriod)
                    : selectedEnd;

            while (!cursor.isAfter(end)) {
                String period = cursor.toString();
                result.add(toChartResponse(totals.getOrDefault(
                        period,
                        new ChartAccumulator(period, BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO)
                )));
                cursor = cursor.plusMonths(1);
            }

            return result;
        }

        long selectedDays = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        LocalDate cursor = selectedDays > 366
                ? LocalDate.parse(firstPeriod)
                : fromDate;
        LocalDate end = selectedDays > 366
                ? LocalDate.parse(lastPeriod)
                : toDate;

        while (!cursor.isAfter(end)) {
            String period = cursor.toString();
            result.add(toChartResponse(totals.getOrDefault(
                    period,
                    new ChartAccumulator(period, BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO)
            )));
            cursor = cursor.plusDays(1);
        }

        return result;
    }

    private RevenueChartPointResponse toChartResponse(ChartAccumulator value) {
        BigDecimal commissionRevenue = money(value.commissionRevenue);
        BigDecimal maintenanceRevenue = money(value.maintenanceRevenue);
        BigDecimal totalPlatformRevenue = commissionRevenue.add(maintenanceRevenue).setScale(0, RoundingMode.HALF_UP);

        return RevenueChartPointResponse.builder()
                .period(value.period)
                .completedBookingValue(money(value.completedBookingValue))
                .completedBookingCount(value.completedBookingCount)
                .commissionRevenue(commissionRevenue)
                .maintenanceRevenue(maintenanceRevenue)
                .totalPlatformRevenue(totalPlatformRevenue)
                .totalRevenue(totalPlatformRevenue)
                .hostPayable(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .refundAmount(BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP))
                .build();
    }

    public PageResponse<AdminCommissionResponse> adminCommissions(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId, String status, String paymentMethod, String keyword, int page, int size) {
        List<Object> args = new ArrayList<>();
        String where = commissionWhere(fromDate, toDate, hostId, homestayId, status, paymentMethod, keyword, args);
        Long total = jdbcTemplate.queryForObject("select count(*) " + commissionFromSql() + where, Long.class, args.toArray());
        args.add(size); args.add(page * size);
        List<AdminCommissionResponse> content = jdbcTemplate.query("select " + adminCommissionSelect() + commissionFromSql() + where + " order by coalesce(bc.recognized_at,bc.calculated_at) desc, bc.commission_id desc limit ? offset ?", this::mapAdminCommission, args.toArray());
        return PageResponse.<AdminCommissionResponse>builder().content(content).page(page).size(size).totalElements(total == null ? 0 : total).totalPages(totalPages(total, size)).build();
    }

    public AdminCommissionResponse adminCommissionDetail(Long commissionId) {
        List<AdminCommissionResponse> rows = jdbcTemplate.query("select " + adminCommissionSelect() + commissionFromSql() + " where bc.commission_id=?", this::mapAdminCommission, commissionId);
        if (rows.isEmpty()) throw new AppException("COMMISSION_NOT_FOUND");
        return rows.get(0);
    }

    public List<RevenueTopItemResponse> topHosts(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        return jdbcTemplate.query("select u.user_id id, u.full_name name, u.email sub_label, coalesce(sum(bc.commission_amount),0) commission_revenue, 0 host_receivable, count(*) booking_count from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id join users u on u.user_id=bc.host_id where bc.commission_status='RECOGNIZED' and bc.recognized_at >= ? and bc.recognized_at < ?" + adminOwnerFilter(hostId, homestayId) + " group by u.user_id,u.full_name,u.email order by commission_revenue desc limit 5", this::mapTopItem, adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId));
    }

    public List<RevenueTopItemResponse> topHomestays(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        return jdbcTemplate.query("select h.home_id id, h.home_name name, owner.full_name sub_label, coalesce(sum(bc.commission_amount),0) commission_revenue, 0 host_receivable, count(*) booking_count from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id join users owner on owner.user_id=h.user_id where bc.commission_status='RECOGNIZED' and bc.recognized_at >= ? and bc.recognized_at < ?" + adminOwnerFilter(hostId, homestayId) + " group by h.home_id,h.home_name,owner.full_name order by commission_revenue desc limit 5", this::mapTopItem, adminArgs(Timestamp.valueOf(from), Timestamp.valueOf(to), hostId, homestayId));
    }

    public HostRevenueSummaryResponse hostSummary(Integer hostId, LocalDate fromDate, LocalDate toDate, String groupBy, Integer homestayId) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        String homestayFilter = homestayId == null ? "" : " and b.home_id=?";
        List<Object> summaryArgs = new ArrayList<>();
        summaryArgs.add(hostId);
        summaryArgs.add(Timestamp.valueOf(from));
        summaryArgs.add(Timestamp.valueOf(to));
        if (homestayId != null) summaryArgs.add(homestayId);
        SummaryAmount s = jdbcTemplate.queryForObject("select " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.booking_amount else 0 end),0) gross, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT','CANCELLED') then bc.refund_amount else 0 end),0) refund_total, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.retained_amount else 0 end),0) retained, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.commission_amount else 0 end),0) commission_revenue, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount else 0 end),0) host_revenue, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED') then bc.host_receivable_amount else 0 end),0) pending_host, " +
                "coalesce(sum(case when bc.commission_status='PAID_OUT' then bc.host_receivable_amount else 0 end),0) paid_out, " +
                "coalesce(sum(case when bc.commission_status='PENDING' then bc.host_receivable_amount else 0 end),0) expected_pending, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(nullif(bd.line_total,0), greatest(coalesce(bc.booking_amount,0) - coalesce(st.service_total,0) + coalesce(b.discount_amount,0),0)) else 0 end),0) room_revenue, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(st.service_total,0) else 0 end),0) service_revenue, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(b.discount_amount,0) else 0 end),0) discount_total, " +
                "coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(nullif(bd.number_of_nights,0), greatest(datediff(bd.checkout_date,bd.checkin_date),0),0) else 0 end),0) occupancy_nights, " +
                "count(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 end) completed_count, " +
                "count(case when bc.commission_status='PENDING' then 1 end) pending_count, " +
                "count(case when bc.commission_status='CANCELLED' then 1 end) cancelled_count, " +
                "coalesce(avg(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount end),0) average_order_value " +
                "from booking_commissions bc " +
                "join bookings b on b.booking_id=bc.booking_id " +
                "left join booking_details bd on bd.booking_id=b.booking_id " +
                "left join (select booking_id, coalesce(sum(total_price),0) service_total from booking_services group by booking_id) st on st.booking_id=b.booking_id " +
                "where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?" + homestayFilter,
                (rs, rowNum) -> SummaryAmount.builder().gross(rs.getBigDecimal("gross")).refundTotal(rs.getBigDecimal("refund_total")).retained(rs.getBigDecimal("retained")).commissionRevenue(rs.getBigDecimal("commission_revenue")).hostRevenue(rs.getBigDecimal("host_revenue")).pendingHost(rs.getBigDecimal("pending_host")).paidOut(rs.getBigDecimal("paid_out")).expectedPending(rs.getBigDecimal("expected_pending")).roomRevenue(rs.getBigDecimal("room_revenue")).serviceRevenue(rs.getBigDecimal("service_revenue")).discountTotal(rs.getBigDecimal("discount_total")).occupancyNights(rs.getInt("occupancy_nights")).completedCount(rs.getInt("completed_count")).pendingCount(rs.getInt("pending_count")).cancelledCount(rs.getInt("cancelled_count")).average(rs.getBigDecimal("average_order_value")).build(),
                summaryArgs.toArray()
        );
        MaintenanceFeeResponse currentFee = currentMaintenanceFee(hostId);
        HostSubscription sub = getHostSubscription(hostId);
        return HostRevenueSummaryResponse.builder().fromDate(fromDate).toDate(toDate).groupBy(groupBy).grossBookingAmount(money(s.gross)).refundAmount(money(s.refundTotal)).retainedBookingAmount(money(s.retained)).commissionDeducted(money(s.commissionRevenue)).totalHostRevenue(money(s.hostRevenue)).pendingPayout(money(s.pendingHost)).paidOutAmount(money(s.paidOut)).expectedPendingRevenue(money(s.expectedPending)).roomRevenue(money(s.roomRevenue)).serviceRevenue(money(s.serviceRevenue)).discountTotal(money(s.discountTotal)).currentMaintenanceFee(currentFee == null ? BigDecimal.ZERO : currentFee.getFeeAmount()).maintenancePaymentStatus(currentFee == null ? null : currentFee.getPaymentStatus()).maintenanceDueDate(currentFee == null ? null : currentFee.getDueDate()).subscriptionExpiresAt(sub.subscriptionExpiresAt).canReceiveBooking(sub.canReceiveBooking).paidBookingCount(s.completedCount).pendingBookingCount(s.pendingCount).completedBookingCount(s.completedCount).cancelledBookingCount(s.cancelledCount).occupancyNights(s.occupancyNights == null ? 0 : s.occupancyNights).averageOrderValue(money(s.average)).trends(hostTrends(hostId, from, to, groupBy, homestayId)).homestays(hostHomestays(hostId, from, to, homestayId)).recentBookings(hostBookings(hostId, fromDate, toDate, homestayId, null, null, 0, 12).getContent()).build();
    }

    public PageResponse<HostRevenueBookingResponse> hostBookings(Integer hostId, LocalDate fromDate, LocalDate toDate, Integer homestayId, String status, String keyword, int page, int size) {
        List<Object> args = new ArrayList<>();
        args.add(hostId); args.add(Timestamp.valueOf(fromDate.atStartOfDay())); args.add(Timestamp.valueOf(toDate.plusDays(1).atStartOfDay()));
        StringBuilder where = new StringBuilder(" where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?");
        if (status != null && !status.isBlank()) { where.append(" and bc.commission_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
        if (homestayId != null) { where.append(" and h.home_id=?"); args.add(homestayId); }
        if (keyword != null && !keyword.isBlank()) { where.append(" and (upper(b.booking_code) like ? or upper(h.home_name) like ? or upper(c.full_name) like ?)"); String kw = "%" + keyword.trim().toUpperCase(Locale.ROOT) + "%"; args.add(kw); args.add(kw); args.add(kw); }
        Long total = jdbcTemplate.queryForObject("select count(*) " + commissionFromSql() + where, Long.class, args.toArray());
        args.add(size); args.add(page * size);
        List<HostRevenueBookingResponse> content = jdbcTemplate.query("select " + hostBookingSelect() + commissionFromSql() + where + " order by coalesce(bc.recognized_at,bc.calculated_at) desc, bc.commission_id desc limit ? offset ?", this::mapHostBooking, args.toArray());
        return PageResponse.<HostRevenueBookingResponse>builder().content(content).page(page).size(size).totalElements(total == null ? 0 : total).totalPages(totalPages(total, size)).build();
    }

    public List<HostRevenueTrendResponse> hostTrends(Integer hostId, LocalDateTime from, LocalDateTime to, String groupBy, Integer homestayId) {
        String format = "month".equalsIgnoreCase(groupBy) ? "%Y-%m" : "%Y-%m-%d";
        String homestayFilter = homestayId == null ? "" : " and b.home_id=?";
        List<Object> args = new ArrayList<>();
        args.add(format);
        args.add(hostId);
        args.add(Timestamp.valueOf(from));
        args.add(Timestamp.valueOf(to));
        if (homestayId != null) args.add(homestayId);
        args.add(format);
        return jdbcTemplate.query("select date_format(coalesce(bc.recognized_at,bc.calculated_at), ?) period, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount else 0 end),0) revenue, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.booking_amount else 0 end),0) gross, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.commission_amount else 0 end),0) commission, coalesce(sum(case when bc.commission_status='PENDING' then bc.host_receivable_amount else 0 end),0) pending, count(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 end) booking_count from booking_commissions bc join bookings b on b.booking_id=bc.booking_id where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?" + homestayFilter + " group by date_format(coalesce(bc.recognized_at,bc.calculated_at), ?) order by period", (rs, rowNum) -> HostRevenueTrendResponse.builder().period(rs.getString("period")).revenue(money(rs.getBigDecimal("revenue"))).grossBookingAmount(money(rs.getBigDecimal("gross"))).commissionDeducted(money(rs.getBigDecimal("commission"))).pendingPayout(money(rs.getBigDecimal("pending"))).bookingCount(rs.getInt("booking_count")).build(), args.toArray());
    }

    private List<HostRevenueHomestayResponse> hostHomestays(Integer hostId, LocalDateTime from, LocalDateTime to, Integer homestayId) {
        String homestayFilter = homestayId == null ? "" : " and h.home_id=?";
        List<Object> args = new ArrayList<>();
        args.add(hostId);
        args.add(Timestamp.valueOf(from));
        args.add(Timestamp.valueOf(to));
        if (homestayId != null) args.add(homestayId);
        return jdbcTemplate.query("select h.home_id,h.home_name,h.province,coalesce(h.rating_avg,0) rating_avg,count(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 end) booking_count, sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then 1 else 0 end) completed_count, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.host_receivable_amount else 0 end),0) revenue, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.booking_amount else 0 end),0) booking_amount, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then bc.commission_amount else 0 end),0) commission_amount, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(nullif(bd.line_total,0), greatest(coalesce(bc.booking_amount,0) - coalesce(st.service_total,0) + coalesce(b.discount_amount,0),0)) else 0 end),0) room_revenue, coalesce(sum(case when bc.commission_status in ('PENDING','RECOGNIZED','PAID_OUT') then coalesce(st.service_total,0) else 0 end),0) service_revenue from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join homestays h on h.home_id=b.home_id left join booking_details bd on bd.booking_id=b.booking_id left join (select booking_id, coalesce(sum(total_price),0) service_total from booking_services group by booking_id) st on st.booking_id=b.booking_id where bc.host_id=? and coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?" + homestayFilter + " group by h.home_id,h.home_name,h.province,h.rating_avg order by revenue desc", (rs, rowNum) -> HostRevenueHomestayResponse.builder().homeId(rs.getInt("home_id")).homestayName(rs.getString("home_name")).province(rs.getString("province")).averageRating(money(rs.getBigDecimal("rating_avg"))).bookingCount(rs.getInt("booking_count")).completedCount(rs.getInt("completed_count")).revenue(money(rs.getBigDecimal("revenue"))).bookingAmount(money(rs.getBigDecimal("booking_amount"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("revenue"))).roomRevenue(money(rs.getBigDecimal("room_revenue"))).serviceRevenue(money(rs.getBigDecimal("service_revenue"))).build(), args.toArray());
    }

    public synchronized void ensureCurrentMaintenanceFees(LocalDate today) {
        PlatformFeeSettingResponse setting = getActiveFeeSetting(today == null ? LocalDate.now() : today);
        LocalDate effectiveToday = today == null ? LocalDate.now() : today;
        List<Integer> hostIds = jdbcTemplate.queryForList("select distinct u.user_id from users u join roles r on r.role_id=u.role_id where u.deleted_at is null and (upper(r.role_name)='HOST' or exists (select 1 from homestays h where h.user_id=u.user_id and h.deleted_at is null and upper(coalesce(h.status,'')) in ('APPROVED','ACTIVE','VISIBLE')))", Integer.class);
        for (Integer hostId : hostIds) {
            LocalDate firstActiveMonth = firstHomestayMonthForHost(hostId, effectiveToday);
            ensureFirstFreeMaintenanceForHost(hostId, firstActiveMonth);
            ensurePendingMaintenanceUpTo(hostId, effectiveToday, setting);
        }
        normalizeFirstMaintenanceWaivers(effectiveToday);
        markOverdueFees(effectiveToday);
    }

    public synchronized int ensureFirstFreeMaintenanceForHost(Integer hostId, LocalDate approvedDate) {
        if (hostId == null) return 0;
        LocalDate effectiveDate = approvedDate == null ? LocalDate.now() : approvedDate;
        PlatformFeeSettingResponse setting = getActiveFeeSetting(effectiveDate);
        YearMonth ym = YearMonth.from(effectiveDate);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        LocalDate due = start.plusDays(setting.getGracePeriodDays() == null ? 3 : setting.getGracePeriodDays());
        int inserted = jdbcTemplate.update("insert ignore into host_maintenance_fees (host_id,billing_month,billing_year,period_start,period_end,fee_amount,due_date,payment_status,admin_note) values (?,?,?,?,?,?,?,'WAIVED','Mien phi thang dau sau khi homestay duoc duyet')", hostId, ym.getMonthValue(), ym.getYear(), Date.valueOf(start), Date.valueOf(end), setting.getMonthlyMaintenanceFee(), Date.valueOf(due));
        if (inserted > 0) {
            jdbcTemplate.update("update users set host_subscription_status='ACTIVE', host_subscription_expires_at=?, host_can_receive_booking=true where user_id=?", Date.valueOf(end), hostId);
        }
        return inserted;
    }

    private void ensurePendingMaintenanceUpTo(Integer hostId, LocalDate today, PlatformFeeSettingResponse setting) {
        List<Date> latestDates = jdbcTemplate.queryForList("select max(period_start) from host_maintenance_fees where host_id=?", Date.class, hostId);
        if (latestDates.isEmpty() || latestDates.get(0) == null) return;
        YearMonth current = YearMonth.from(today);
        YearMonth next = YearMonth.from(latestDates.get(0).toLocalDate()).plusMonths(1);
        int guard = 0;
        while (!next.isAfter(current) && guard < 24) {
            insertMonthlyMaintenanceIfMissing(hostId, next, setting, "PENDING", null);
            next = next.plusMonths(1);
            guard++;
        }
    }

    private int insertMonthlyMaintenanceIfMissing(Integer hostId, YearMonth ym, PlatformFeeSettingResponse setting, String status, String note) {
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        LocalDate due = start.plusDays(setting.getGracePeriodDays() == null ? 3 : setting.getGracePeriodDays());
        return jdbcTemplate.update("insert ignore into host_maintenance_fees (host_id,billing_month,billing_year,period_start,period_end,fee_amount,due_date,payment_status,admin_note) values (?,?,?,?,?,?,?,?,?)", hostId, ym.getMonthValue(), ym.getYear(), Date.valueOf(start), Date.valueOf(end), setting.getMonthlyMaintenanceFee(), Date.valueOf(due), status, note);
    }
    private LocalDate firstHomestayMonthForHost(Integer hostId, LocalDate fallbackDate) {
        List<Date> rows = jdbcTemplate.queryForList(
                "select min(date(coalesce(created_at, current_timestamp))) from homestays where user_id=? and deleted_at is null",
                Date.class,
                hostId
        );
        if (rows.isEmpty() || rows.get(0) == null) return fallbackDate == null ? LocalDate.now() : fallbackDate;
        return rows.get(0).toLocalDate();
    }

    private int normalizeFirstMaintenanceWaivers(LocalDate today) {
        jdbcTemplate.update("update host_maintenance_fees f join (select host_id, min(period_start) first_period from host_maintenance_fees group by host_id) first_fee on first_fee.host_id=f.host_id and first_fee.first_period=f.period_start set f.payment_status='WAIVED', f.admin_note=coalesce(f.admin_note,'Mien phi thang dau'), f.updated_at=now() where f.payment_status in ('PENDING','OVERDUE') and f.paid_at is null");
        return jdbcTemplate.update(
                "update host_maintenance_fees f join (select host_id, min(period_start) first_period from host_maintenance_fees group by host_id) first_fee on first_fee.host_id=f.host_id "
                        + "set f.payment_status=case when f.due_date < ? then 'OVERDUE' else 'PENDING' end, f.updated_at=now() "
                        + "where f.period_start <> first_fee.first_period and f.payment_status='WAIVED' and f.paid_at is null "
                        + "and lower(coalesce(f.admin_note,'')) like '%mien phi thang dau%'",
                Date.valueOf(today == null ? LocalDate.now() : today)
        );
    }
    public PageResponse<MaintenanceFeeResponse> maintenanceFees(LocalDate fromDate, LocalDate toDate, Integer hostId, String status, int page, int size) {
        List<Object> args = new ArrayList<>();
        StringBuilder where = new StringBuilder(" where 1=1");
        if (fromDate != null) { where.append(" and f.period_end >= ?"); args.add(Date.valueOf(fromDate)); }
        if (toDate != null) { where.append(" and f.period_start <= ?"); args.add(Date.valueOf(toDate)); }
        if (hostId != null) { where.append(" and f.host_id=?"); args.add(hostId); }
        if (status != null && !status.isBlank()) { where.append(" and f.payment_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
        Long total = jdbcTemplate.queryForObject("select count(*) from host_maintenance_fees f join users u on u.user_id=f.host_id" + where, Long.class, args.toArray());
        args.add(size); args.add(page * size);
        List<MaintenanceFeeResponse> content = jdbcTemplate.query("select f.*, u.full_name host_name from host_maintenance_fees f join users u on u.user_id=f.host_id" + where + " order by f.billing_year desc, f.billing_month desc, f.host_id limit ? offset ?", this::mapMaintenanceFee, args.toArray());
        return PageResponse.<MaintenanceFeeResponse>builder().content(content).page(page).size(size).totalElements(total == null ? 0 : total).totalPages(totalPages(total, size)).build();
    }

    public MaintenanceFeeResponse currentMaintenanceFee(Integer hostId) {
        YearMonth current = YearMonth.now();
        List<MaintenanceFeeResponse> rows = jdbcTemplate.query("select f.*, u.full_name host_name from host_maintenance_fees f join users u on u.user_id=f.host_id where f.host_id=? and f.billing_year=? and f.billing_month=?", this::mapMaintenanceFee, hostId, current.getYear(), current.getMonthValue());
        return rows.isEmpty() ? null : rows.get(0);
    }

    public int generateMaintenanceFees(Integer year, Integer month, PlatformFeeSettingResponse setting) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        LocalDate due = start.plusDays(setting.getGracePeriodDays() == null ? 3 : setting.getGracePeriodDays());
        return jdbcTemplate.update("insert ignore into host_maintenance_fees (host_id,billing_month,billing_year,period_start,period_end,fee_amount,due_date,payment_status) select u.user_id, ?, ?, ?, ?, ?, ?, 'PENDING' from users u join roles r on r.role_id=u.role_id where upper(r.role_name)='HOST' and u.deleted_at is null", month, year, Date.valueOf(start), Date.valueOf(end), setting.getMonthlyMaintenanceFee(), Date.valueOf(due));
    }

    public int markMaintenancePaid(Long id, String method, String reference, String note) {
        int updated = jdbcTemplate.update("update host_maintenance_fees set payment_status='PAID', paid_at=now(), payment_method=?, transaction_reference=?, admin_note=?, updated_at=now() where maintenance_fee_id=? and payment_status in ('PENDING','OVERDUE')", method, reference, note, id);
        if (updated > 0) extendHostSubscription(id);
        return updated;
    }

    public int waiveMaintenance(Long id, String note) {
        int updated = jdbcTemplate.update("update host_maintenance_fees set payment_status='WAIVED', admin_note=?, updated_at=now() where maintenance_fee_id=? and payment_status in ('PENDING','OVERDUE')", note, id);
        if (updated > 0) extendHostSubscription(id);
        return updated;
    }

    public int markOverdueFees(LocalDate today) {
        return jdbcTemplate.update("update host_maintenance_fees set payment_status='OVERDUE', updated_at=now() where payment_status='PENDING' and due_date < ?", Date.valueOf(today));
    }

    public List<MaintenanceAlertCandidate> maintenanceReminderCandidates(LocalDate fromDate, LocalDate toDate) {
        return jdbcTemplate.query(
                "select f.maintenance_fee_id, f.host_id, u.full_name host_name, u.email host_email, f.billing_month, f.billing_year, f.due_date, f.payment_status, f.fee_amount "
                        + "from host_maintenance_fees f join users u on u.user_id=f.host_id "
                        + "where f.payment_status='PENDING' and f.due_date >= ? and f.due_date <= ? and f.reminder_sent_at is null",
                this::mapMaintenanceAlertCandidate,
                Date.valueOf(fromDate), Date.valueOf(toDate)
        );
    }

    public List<MaintenanceAlertCandidate> overdueWarningCandidates() {
        return jdbcTemplate.query(
                "select f.maintenance_fee_id, f.host_id, u.full_name host_name, u.email host_email, f.billing_month, f.billing_year, f.due_date, f.payment_status, f.fee_amount "
                        + "from host_maintenance_fees f join users u on u.user_id=f.host_id "
                        + "where f.payment_status='OVERDUE' and f.overdue_warning_sent_at is null",
                this::mapMaintenanceAlertCandidate
        );
    }

    public void markMaintenanceReminderSent(Long maintenanceFeeId) {
        jdbcTemplate.update("update host_maintenance_fees set reminder_sent_at=now(), updated_at=now() where maintenance_fee_id=?", maintenanceFeeId);
    }

    public void markMaintenanceOverdueWarningSent(Long maintenanceFeeId) {
        jdbcTemplate.update("update host_maintenance_fees set overdue_warning_sent_at=now(), updated_at=now() where maintenance_fee_id=?", maintenanceFeeId);
    }


    public boolean claimMaintenanceReminder(Long maintenanceFeeId) {
        return jdbcTemplate.update(
                "update host_maintenance_fees set reminder_sent_at=now(), updated_at=now() where maintenance_fee_id=? and reminder_sent_at is null",
                maintenanceFeeId
        ) > 0;
    }

    public boolean claimMaintenanceOverdueWarning(Long maintenanceFeeId) {
        return jdbcTemplate.update(
                "update host_maintenance_fees set overdue_warning_sent_at=now(), updated_at=now() where maintenance_fee_id=? and overdue_warning_sent_at is null",
                maintenanceFeeId
        ) > 0;
    }

    public int lockHostsWithOverdueCount(int threshold) {
        int lockedUsers = jdbcTemplate.update(
                "update users u set u.host_subscription_status='OVERDUE', u.host_can_receive_booking=false, u.updated_at=now() "
                        + "where (select count(*) from host_maintenance_fees f where f.host_id=u.user_id and f.payment_status='OVERDUE') >= ?",
                threshold
        );
        jdbcTemplate.update(
                "update homestays h set h.status='BLOCKED', h.updated_at=now() "
                        + "where h.deleted_at is null and upper(coalesce(h.status,'')) <> 'REJECTED' "
                        + "and (select count(*) from host_maintenance_fees f where f.host_id=h.user_id and f.payment_status='OVERDUE') >= ?",
                threshold
        );
        return lockedUsers;
    }

    public List<HostMaintenanceNotificationResponse> hostMaintenanceNotifications(Integer hostId, LocalDate today) {
        LocalDate reminderLimit = today.plusDays(3);
        return jdbcTemplate.query(
                "select maintenance_fee_id, billing_month, billing_year, due_date, payment_status, created_at "
                        + "from host_maintenance_fees "
                        + "where host_id=? and payment_status in ('PENDING','OVERDUE') "
                        + "and (payment_status='OVERDUE' or due_date <= ?) "
                        + "order by case when payment_status='OVERDUE' then 0 else 1 end, due_date asc, maintenance_fee_id desc limit 30",
                (rs, rowNum) -> {
                    String status = rs.getString("payment_status");
                    Integer month = rs.getInt("billing_month");
                    Integer year = rs.getInt("billing_year");
                    LocalDate due = rs.getDate("due_date").toLocalDate();
                    boolean overdue = "OVERDUE".equalsIgnoreCase(status);
                    return HostMaintenanceNotificationResponse.builder()
                            .maintenanceFeeId(rs.getLong("maintenance_fee_id"))
                            .notificationType(overdue ? "OVERDUE" : "DUE_SOON")
                            .title(overdue ? "Phí duy trì đã quá hạn" : "Sắp đến hạn đóng phí duy trì")
                            .message("Phí duy trì tháng " + month + "/" + year + (overdue ? " đã quá hạn từ ngày " : " sẽ đến hạn vào ngày ") + due + ".")
                            .billingMonth(month)
                            .billingYear(year)
                            .dueDate(due)
                            .paymentStatus(status)
                            .createdAt(ts(rs, "created_at"))
                            .build();
                },
                hostId, Date.valueOf(reminderLimit)
        );
    }

    public boolean canHostReceiveBooking(Integer homeId) {
        Integer allowed = jdbcTemplate.queryForObject("select coalesce(u.host_can_receive_booking, true) from homestays h join users u on u.user_id=h.user_id where h.home_id=?", Integer.class, homeId);
        return allowed == null || allowed == 1;
    }

    public List<MaintenanceFeeResponse> hostMaintenanceHistory(Integer hostId, Integer year, String status, int page, int size) {
        List<Object> args = new ArrayList<>();
        args.add(hostId);
        StringBuilder where = new StringBuilder(" where f.host_id=?");
        if (year != null) { where.append(" and f.billing_year=?"); args.add(year); }
        if (status != null && !status.isBlank()) { where.append(" and f.payment_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
        args.add(size); args.add(page * size);
        return jdbcTemplate.query("select f.*, u.full_name host_name from host_maintenance_fees f join users u on u.user_id=f.host_id" + where + " order by f.billing_year desc,f.billing_month desc limit ? offset ?", this::mapMaintenanceFee, args.toArray());
    }

    private void extendHostSubscription(Long maintenanceFeeId) {
        jdbcTemplate.update("update users u join host_maintenance_fees f on f.host_id=u.user_id set u.host_subscription_status='ACTIVE', u.host_can_receive_booking=true, u.host_subscription_expires_at=f.period_end where f.maintenance_fee_id=?", maintenanceFeeId);
    }

    private String commissionWhere(LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId, String status, String paymentMethod, String keyword, List<Object> args) {
        StringBuilder where = new StringBuilder(" where coalesce(bc.recognized_at,bc.calculated_at) >= ? and coalesce(bc.recognized_at,bc.calculated_at) < ?");
        args.add(Timestamp.valueOf(fromDate.atStartOfDay()));
        args.add(Timestamp.valueOf(toDate.plusDays(1).atStartOfDay()));
        if (hostId != null) { where.append(" and bc.host_id=?"); args.add(hostId); }
        if (homestayId != null) { where.append(" and h.home_id=?"); args.add(homestayId); }
        if (status != null && !status.isBlank()) { where.append(" and bc.commission_status=?"); args.add(status.toUpperCase(Locale.ROOT)); }
        if (paymentMethod != null && !paymentMethod.isBlank()) { where.append(" and upper(coalesce(b.payment_method,''))=?"); args.add(paymentMethod.toUpperCase(Locale.ROOT)); }
        if (keyword != null && !keyword.isBlank()) { where.append(" and (upper(b.booking_code) like ? or upper(c.full_name) like ? or upper(h.home_name) like ? or upper(host.full_name) like ?)"); String kw = "%" + keyword.trim().toUpperCase(Locale.ROOT) + "%"; args.add(kw); args.add(kw); args.add(kw); args.add(kw); }
        return where.toString();
    }

    private String commissionFromSql() { return " from booking_commissions bc join bookings b on b.booking_id=bc.booking_id join users c on c.user_id=b.user_id join homestays h on h.home_id=b.home_id join users host on host.user_id=bc.host_id join booking_details bd on bd.booking_id=b.booking_id left join (select booking_id, coalesce(sum(total_price),0) service_total from booking_services group by booking_id) st on st.booking_id=b.booking_id"; }
    private String adminCommissionSelect() { return "bc.commission_id,bc.booking_id,coalesce(b.booking_code,concat('BK',lpad(b.booking_id,6,'0'))) booking_code,c.full_name customer_name,bc.host_id,host.full_name host_name,h.home_id homestay_id,h.home_name homestay_name,bd.checkin_date,bd.checkout_date,bc.booking_amount,bc.refund_amount,bc.retained_amount,bc.commission_rate,bc.commission_amount,bc.host_receivable_amount,b.booking_status,b.payment_status,b.payment_method,bc.commission_status,bc.cancellation_type,bc.refund_status,bc.calculated_at,bc.recognized_at,bc.recognized_at completed_at,bc.paid_to_host_at,bc.payout_reference"; }
    private String hostBookingSelect() { return "bc.commission_id,bc.booking_id,coalesce(b.booking_code,concat('BK',lpad(b.booking_id,6,'0'))) booking_code,h.home_name,c.full_name customer_name,bd.checkin_date,bd.checkout_date,b.created_at,coalesce(bc.recognized_at,bc.calculated_at) paid_at,b.booking_status,b.payment_status,b.payment_method,bc.booking_amount,bc.refund_amount,bc.retained_amount,bc.commission_rate,bc.commission_amount,bc.host_receivable_amount,coalesce(b.total_price,bc.booking_amount) total_price,coalesce(nullif(bd.line_total,0), greatest(coalesce(bc.booking_amount,0) - coalesce(st.service_total,0) + coalesce(b.discount_amount,0),0)) room_total,coalesce(st.service_total,0) service_total,coalesce(b.discount_amount,0) discount_amount,bc.commission_status,bc.paid_to_host_at"; }

    private PlatformFeeSettingResponse mapFeeSetting(ResultSet rs, int rowNum) throws SQLException { return PlatformFeeSettingResponse.builder().settingId(rs.getLong("setting_id")).settingName(rs.getString("setting_name")).commissionRate(rate(rs.getBigDecimal("commission_rate"))).monthlyMaintenanceFee(money(rs.getBigDecimal("monthly_maintenance_fee"))).freeTrialDays(rs.getInt("free_trial_days")).gracePeriodDays(rs.getInt("grace_period_days")).effectiveFrom(rs.getDate("effective_from").toLocalDate()).effectiveTo(rs.getDate("effective_to") == null ? null : rs.getDate("effective_to").toLocalDate()).settingStatus(rs.getString("setting_status")).build(); }
    private CommissionRow mapCommissionRow(ResultSet rs, int rowNum) throws SQLException { return CommissionRow.builder().commissionId(rs.getLong("commission_id")).bookingId(rs.getInt("booking_id")).commissionStatus(rs.getString("commission_status")).bookingAmount(money(rs.getBigDecimal("booking_amount"))).refundAmount(money(rs.getBigDecimal("refund_amount"))).retainedAmount(money(rs.getBigDecimal("retained_amount"))).commissionRate(rate(rs.getBigDecimal("commission_rate"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable_amount"))).build(); }
    private RevenueTopItemResponse mapTopItem(ResultSet rs, int rowNum) throws SQLException { return RevenueTopItemResponse.builder().id(rs.getInt("id")).name(rs.getString("name")).subLabel(rs.getString("sub_label")).commissionRevenue(money(rs.getBigDecimal("commission_revenue"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable"))).bookingCount(rs.getInt("booking_count")).build(); }
    private AdminCommissionResponse mapAdminCommission(ResultSet rs, int rowNum) throws SQLException { return AdminCommissionResponse.builder().commissionId(rs.getLong("commission_id")).bookingId(rs.getInt("booking_id")).bookingCode(rs.getString("booking_code")).customerName(rs.getString("customer_name")).hostId(rs.getInt("host_id")).hostName(rs.getString("host_name")).homestayId(rs.getInt("homestay_id")).homestayName(rs.getString("homestay_name")).checkinDate(rs.getDate("checkin_date").toLocalDate()).checkoutDate(rs.getDate("checkout_date").toLocalDate()).bookingAmount(money(rs.getBigDecimal("booking_amount"))).refundAmount(money(rs.getBigDecimal("refund_amount"))).retainedAmount(money(rs.getBigDecimal("retained_amount"))).commissionRate(rate(rs.getBigDecimal("commission_rate"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable_amount"))).bookingStatus(rs.getString("booking_status")).paymentStatus(rs.getString("payment_status")).paymentMethod(rs.getString("payment_method")).commissionStatus(rs.getString("commission_status")).cancellationType(rs.getString("cancellation_type")).refundStatus(rs.getString("refund_status")).calculatedAt(ts(rs,"calculated_at")).recognizedAt(ts(rs,"recognized_at")).completedAt(ts(rs,"completed_at")).paidToHostAt(ts(rs,"paid_to_host_at")).payoutReference(rs.getString("payout_reference")).build(); }
    private HostRevenueBookingResponse mapHostBooking(ResultSet rs, int rowNum) throws SQLException { return HostRevenueBookingResponse.builder().commissionId(rs.getLong("commission_id")).bookingId(rs.getInt("booking_id")).bookingCode(rs.getString("booking_code")).homestayName(rs.getString("home_name")).customerName(rs.getString("customer_name")).checkInDate(rs.getDate("checkin_date").toLocalDate()).checkOutDate(rs.getDate("checkout_date").toLocalDate()).createdAt(ts(rs,"created_at")).paidAt(ts(rs,"paid_at")).bookingStatus(rs.getString("booking_status")).paymentStatus(rs.getString("payment_status")).paymentMethod(rs.getString("payment_method")).bookingAmount(money(rs.getBigDecimal("booking_amount"))).refundAmount(money(rs.getBigDecimal("refund_amount"))).retainedAmount(money(rs.getBigDecimal("retained_amount"))).commissionRate(rate(rs.getBigDecimal("commission_rate"))).commissionAmount(money(rs.getBigDecimal("commission_amount"))).hostReceivableAmount(money(rs.getBigDecimal("host_receivable_amount"))).totalPrice(money(rs.getBigDecimal("total_price"))).roomTotal(money(rs.getBigDecimal("room_total"))).serviceTotal(money(rs.getBigDecimal("service_total"))).discountAmount(money(rs.getBigDecimal("discount_amount"))).commissionStatus(rs.getString("commission_status")).paidToHostAt(ts(rs,"paid_to_host_at")).build(); }
    private MaintenanceFeeResponse mapMaintenanceFee(ResultSet rs, int rowNum) throws SQLException { return MaintenanceFeeResponse.builder().maintenanceFeeId(rs.getLong("maintenance_fee_id")).hostId(rs.getInt("host_id")).hostName(rs.getString("host_name")).billingMonth(rs.getInt("billing_month")).billingYear(rs.getInt("billing_year")).periodStart(rs.getDate("period_start").toLocalDate()).periodEnd(rs.getDate("period_end").toLocalDate()).feeAmount(money(rs.getBigDecimal("fee_amount"))).dueDate(rs.getDate("due_date").toLocalDate()).paymentStatus(rs.getString("payment_status")).paidAt(ts(rs,"paid_at")).paymentMethod(rs.getString("payment_method")).transactionReference(rs.getString("transaction_reference")).adminNote(rs.getString("admin_note")).reminderSentAt(ts(rs,"reminder_sent_at")).overdueWarningSentAt(ts(rs,"overdue_warning_sent_at")).build(); }

    private MaintenanceAlertCandidate mapMaintenanceAlertCandidate(ResultSet rs, int rowNum) throws SQLException {
        return MaintenanceAlertCandidate.builder()
                .maintenanceFeeId(rs.getLong("maintenance_fee_id"))
                .hostId(rs.getInt("host_id"))
                .hostName(rs.getString("host_name"))
                .hostEmail(rs.getString("host_email"))
                .billingMonth(rs.getInt("billing_month"))
                .billingYear(rs.getInt("billing_year"))
                .dueDate(rs.getDate("due_date").toLocalDate())
                .paymentStatus(rs.getString("payment_status"))
                .feeAmount(money(rs.getBigDecimal("fee_amount")))
                .build();
    }
    private BigDecimal queryMoney(String sql, Object... args) { BigDecimal value = jdbcTemplate.queryForObject(sql, BigDecimal.class, args); return money(value); }
    private String adminOwnerFilter(Integer hostId, Integer homestayId) { return (hostId == null ? "" : " and h.user_id=?") + (homestayId == null ? "" : " and h.home_id=?"); }
    private Object[] adminArgs(Object a, Object b, Integer hostId, Integer homestayId) { List<Object> args = new ArrayList<>(List.of(a,b)); if (hostId != null) args.add(hostId); if (homestayId != null) args.add(homestayId); return args.toArray(); }
    private Object[] adminArgs(Object a, Object b, Object c, Object d, Integer hostId, Integer homestayId) { List<Object> args = new ArrayList<>(List.of(a,b,c,d)); if (hostId != null) args.add(hostId); if (homestayId != null) args.add(homestayId); return args.toArray(); }
    private String maintenanceHostFilter(Integer hostId) { return hostId == null ? "" : " and host_id=?"; }
    private String maintenanceOwnerFilter(Integer hostId) { return hostId == null ? "" : " and f.host_id=?"; }
    private Object[] maintenanceArgs(Object a, Object b, Object c, Object d, Integer hostId, Integer homestayId) { List<Object> args = new ArrayList<>(List.of(a,b,c,d)); if (hostId != null) args.add(hostId); if (homestayId != null) args.add(homestayId); return args.toArray(); }
    private Object[] maintenanceArgs(Object a, Object b, Integer hostId) { return hostId == null ? new Object[]{a,b} : new Object[]{a,b,hostId}; }
    private Object[] maintenanceArgs(Object a, Object b, Object c, Object d, Integer hostId) { return hostId == null ? new Object[]{a,b,c,d} : new Object[]{a,b,c,d,hostId}; }
    private int totalPages(Long total, int size) { if (total == null || total <= 0) return 0; return (int)Math.ceil(total / (double)Math.max(size, 1)); }
    private BigDecimal money(BigDecimal value) { return (value == null ? BigDecimal.ZERO : value).setScale(0, RoundingMode.HALF_UP); }
    private BigDecimal rate(BigDecimal value) { return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP); }
    private BigDecimal positive(BigDecimal first, BigDecimal fallback) { BigDecimal candidate = money(first); return candidate.compareTo(BigDecimal.ZERO) > 0 ? candidate : money(fallback); }
    private LocalDateTime ts(ResultSet rs, String col) throws SQLException { Timestamp ts = rs.getTimestamp(col); return ts == null ? null : ts.toLocalDateTime(); }
    private boolean blank(String s) { return s == null || s.isBlank(); }

    @Data @Builder public static class BookingMoneySource { private Integer bookingId; private String bookingCode; private String bookingStatus; private String paymentStatus; private String paymentMethod; private Integer homeId; private String homestayName; private Integer hostId; private BigDecimal bookingAmount; private String latestPaymentStatus; }
    @Data @Builder public static class CommissionRow { private Long commissionId; private Integer bookingId; private String commissionStatus; private BigDecimal bookingAmount; private BigDecimal refundAmount; private BigDecimal retainedAmount; private BigDecimal commissionRate; private BigDecimal commissionAmount; private BigDecimal hostReceivableAmount; }
    @Data @Builder public static class MaintenanceAlertCandidate { private Long maintenanceFeeId; private Integer hostId; private String hostName; private String hostEmail; private Integer billingMonth; private Integer billingYear; private LocalDate dueDate; private String paymentStatus; private BigDecimal feeAmount; }
    private static class ChartAccumulator {
        private final String period;
        private BigDecimal completedBookingValue;
        private int completedBookingCount;
        private BigDecimal commissionRevenue;
        private BigDecimal maintenanceRevenue;

        private ChartAccumulator(
                String period,
                BigDecimal completedBookingValue,
                int completedBookingCount,
                BigDecimal commissionRevenue,
                BigDecimal maintenanceRevenue
        ) {
            this.period = period;
            this.completedBookingValue = completedBookingValue == null ? BigDecimal.ZERO : completedBookingValue;
            this.completedBookingCount = completedBookingCount;
            this.commissionRevenue = commissionRevenue == null ? BigDecimal.ZERO : commissionRevenue;
            this.maintenanceRevenue = maintenanceRevenue == null ? BigDecimal.ZERO : maintenanceRevenue;
        }
    }

    @Data @Builder private static class SummaryAmount { private BigDecimal gross; private BigDecimal pendingHeld; private BigDecimal commissionRevenue; private BigDecimal pendingHost; private BigDecimal paidOut; private BigDecimal refundTotal; private BigDecimal retained; private BigDecimal hostRevenue; private BigDecimal expectedPending; private BigDecimal roomRevenue; private BigDecimal serviceRevenue; private BigDecimal discountTotal; private BigDecimal average; private Integer completedCount; private Integer cancelledCount; private Integer pendingCount; private Integer occupancyNights; }
    private record HostSubscription(LocalDate subscriptionExpiresAt, Boolean canReceiveBooking) {}
    private HostSubscription getHostSubscription(Integer hostId) { try { return jdbcTemplate.queryForObject("select host_subscription_expires_at, coalesce(host_can_receive_booking,true) can_receive from users where user_id=?", (rs, rowNum) -> new HostSubscription(rs.getDate("host_subscription_expires_at") == null ? null : rs.getDate("host_subscription_expires_at").toLocalDate(), rs.getBoolean("can_receive")), hostId); } catch (Exception e) { return new HostSubscription(null, true); } }
}





