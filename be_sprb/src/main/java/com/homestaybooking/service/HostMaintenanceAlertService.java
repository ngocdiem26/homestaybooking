package com.homestaybooking.service;

import com.homestaybooking.repository.RevenueJdbcRepository;
import com.homestaybooking.repository.RevenueJdbcRepository.MaintenanceAlertCandidate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HostMaintenanceAlertService {
    private static final int REMINDER_DAYS_BEFORE_DUE = 3;
    private static final int OVERDUE_LOCK_THRESHOLD = 3;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final RevenueJdbcRepository revenueRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
    public void processDailyAlerts() {
        processAlerts(LocalDate.now());
    }

    public void processAlerts(LocalDate today) {
        LocalDate effectiveToday = today == null ? LocalDate.now() : today;
        syncMaintenanceStatus(effectiveToday);
        sendDueSoonReminders(effectiveToday, effectiveToday.plusDays(REMINDER_DAYS_BEFORE_DUE));
        sendOverdueWarnings();
    }

    @Transactional
    public void syncMaintenanceStatus(LocalDate today) {
        LocalDate effectiveToday = today == null ? LocalDate.now() : today;
        revenueRepository.ensureCurrentMaintenanceFees(effectiveToday);
        revenueRepository.lockHostsWithOverdueCount(OVERDUE_LOCK_THRESHOLD);
    }

    private void sendDueSoonReminders(LocalDate fromDate, LocalDate toDate) {
        List<MaintenanceAlertCandidate> candidates = revenueRepository.maintenanceReminderCandidates(fromDate, toDate);
        for (MaintenanceAlertCandidate candidate : candidates) {
            if (!revenueRepository.claimMaintenanceReminder(candidate.getMaintenanceFeeId())) {
                continue;
            }
            sendMail(
                    candidate.getHostEmail(),
                    "Cozygo - Nhắc hạn phí duy trì host tháng " + candidate.getBillingMonth() + "/" + candidate.getBillingYear(),
                    reminderContent(candidate)
            );
        }
    }

    private void sendOverdueWarnings() {
        List<MaintenanceAlertCandidate> candidates = revenueRepository.overdueWarningCandidates();
        for (MaintenanceAlertCandidate candidate : candidates) {
            if (!revenueRepository.claimMaintenanceOverdueWarning(candidate.getMaintenanceFeeId())) {
                continue;
            }
            sendMail(
                    candidate.getHostEmail(),
                    "Cozygo - Cảnh báo quá hạn phí duy trì host tháng " + candidate.getBillingMonth() + "/" + candidate.getBillingYear(),
                    overdueContent(candidate)
            );
        }
    }

    private boolean sendMail(String toEmail, String subject, String content) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || fromAddress == null || fromAddress.isBlank()) {
            log.warn("Chưa cấu hình mail nên bỏ qua email phí duy trì đến {}.", toEmail);
            return false;
        }
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Host không có email nên không gửi được thông báo phí duy trì.");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            return true;
        } catch (Exception exception) {
            log.error("Gửi email phí duy trì đến {} thất bại: {}", toEmail, exception.getMessage(), exception);
            return false;
        }
    }

    private String reminderContent(MaintenanceAlertCandidate candidate) {
        String nl = System.lineSeparator();
        return "Kính gửi " + value(candidate.getHostName(), "Chủ homestay") + "," + nl + nl
                + "Cozygo nhắc bạn phí duy trì host tháng " + candidate.getBillingMonth() + "/" + candidate.getBillingYear()
                + " sẽ đến hạn vào ngày " + candidate.getDueDate().format(DATE_FORMAT) + "." + nl
                + "Số tiền cần thanh toán: " + candidate.getFeeAmount().toPlainString() + "đ." + nl + nl
                + "Vui lòng thanh toán đúng hạn để homestay tiếp tục nhận đơn đặt phòng mới." + nl + nl
                + "Trân trọng," + nl
                + "Đội ngũ Cozygo";
    }

    private String overdueContent(MaintenanceAlertCandidate candidate) {
        String nl = System.lineSeparator();
        return "Kính gửi " + value(candidate.getHostName(), "Chủ homestay") + "," + nl + nl
                + "Phí duy trì host tháng " + candidate.getBillingMonth() + "/" + candidate.getBillingYear()
                + " đã quá hạn từ ngày " + candidate.getDueDate().format(DATE_FORMAT) + "." + nl
                + "Nếu host quá hạn từ 3 kỳ trở lên, hệ thống sẽ tạm khóa toàn bộ homestay của chủ nhà cho đến khi được xử lý." + nl + nl
                + "Vui lòng liên hệ Cozygo hoặc hoàn tất thanh toán sớm nhất." + nl + nl
                + "Trân trọng," + nl
                + "Đội ngũ Cozygo";
    }

    private String value(String source, String fallback) {
        return source == null || source.isBlank() ? fallback : source;
    }
}