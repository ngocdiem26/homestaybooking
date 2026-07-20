package com.homestaybooking.service;

import com.homestaybooking.dto.request.ComplaintActionRequest;
import com.homestaybooking.dto.request.CreateComplaintRequest;
import com.homestaybooking.dto.response.ComplaintResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.ComplaintJdbcRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ComplaintJdbcRepository complaintRepository;
    private final ComplaintMailService complaintMailService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public ComplaintResponse createCustomerComplaint(CreateComplaintRequest request, String authorizationHeader) {
        User customer = getCurrentUser(authorizationHeader);
        if (request == null || request.getBookingId() == null) {
            throw new AppException("Thiếu thông tin đơn đặt phòng cần khiếu nại");
        }
        String title = requireText(request.getTitle(), "Vui lòng nhập tiêu đề hoặc loại khiếu nại");
        String description = requireText(request.getDescription(), "Vui lòng nhập nội dung khiếu nại");
        ComplaintJdbcRepository.BookingComplaintReference booking = complaintRepository.findBookingReference(request.getBookingId());
        if (!booking.getCustomerId().equals(customer.getUserId())) {
            throw new AppException("Bạn chỉ có thể khiếu nại đơn đặt phòng của chính mình");
        }
        Integer complaintId = complaintRepository.insertComplaint(customer.getUserId(), request.getBookingId(), title, description);
        return complaintRepository.findCustomerComplaint(complaintId, customer.getUserId());
    }

    public List<ComplaintResponse> getMyComplaints(String authorizationHeader) {
        return complaintRepository.findCustomerComplaints(getCurrentUser(authorizationHeader).getUserId());
    }

    public ComplaintResponse getMyComplaint(Integer complaintId, String authorizationHeader) {
        return complaintRepository.findCustomerComplaint(complaintId, getCurrentUser(authorizationHeader).getUserId());
    }

    public List<ComplaintResponse> getHostComplaints(String authorizationHeader) {
        return complaintRepository.findHostComplaints(getCurrentUser(authorizationHeader).getUserId());
    }

    public ComplaintResponse getHostComplaint(Integer complaintId, String authorizationHeader) {
        User host = getCurrentUser(authorizationHeader);
        if (!complaintRepository.isHostComplaint(complaintId, host.getUserId())) {
            throw new AppException("Bạn không có quyền xem khiếu nại này");
        }
        return complaintRepository.findHostComplaint(complaintId, host.getUserId());
    }

    public List<ComplaintResponse> getAdminComplaints(String authorizationHeader) {
        getCurrentUser(authorizationHeader);
        return complaintRepository.findAdminComplaints();
    }

    public ComplaintResponse getAdminComplaint(Integer complaintId, String authorizationHeader) {
        getCurrentUser(authorizationHeader);
        return complaintRepository.findAdminComplaint(complaintId);
    }

    public ComplaintResponse updateAdminComplaint(Integer complaintId, ComplaintActionRequest request, String authorizationHeader) {
        getCurrentUser(authorizationHeader);
        String status = normalizeStatus(request == null ? null : request.getStatus());
        String reply = request == null ? null : request.getNote();
        if (("RESOLVED".equals(status) || "REJECTED".equals(status)) && (reply == null || reply.trim().isEmpty())) {
            throw new AppException("Vui lòng nhập nội dung phản hồi trước khi gửi kết quả xử lý");
        }
        ComplaintResponse beforeUpdate = complaintRepository.findAdminComplaint(complaintId);
        if ("PROCESSING".equals(status)) {
            complaintRepository.updateStatus(complaintId, status);
            return complaintRepository.findAdminComplaint(complaintId);
        }
        complaintRepository.updateAdminResolution(complaintId, status, reply.trim());
        ComplaintResponse updated = complaintRepository.findAdminComplaint(complaintId);
        boolean mailSent = complaintMailService.sendResolutionMail(beforeUpdate, reply.trim());
        updated.setMailSent(mailSent);
        return updated;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return "RESOLVED";
        String normalized = status.trim().toUpperCase();
        if ("PENDING".equals(normalized) || "PROCESSING".equals(normalized) || "RESOLVED".equals(normalized) || "REJECTED".equals(normalized)) {
            return normalized;
        }
        return "RESOLVED";
    }

    private String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) throw new AppException(message);
        return value.trim();
    }

    private User getCurrentUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) throw new AppException("Bạn cần đăng nhập để sử dụng chức năng này");
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("Không tìm thấy tài khoản đang đăng nhập"));
    }
}
