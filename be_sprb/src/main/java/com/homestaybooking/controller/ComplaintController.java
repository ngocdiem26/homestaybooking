package com.homestaybooking.controller;

import com.homestaybooking.dto.request.ComplaintActionRequest;
import com.homestaybooking.dto.request.CreateComplaintRequest;
import com.homestaybooking.dto.response.ComplaintResponse;
import com.homestaybooking.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @PostMapping("/customer/complaints")
    public ComplaintResponse createCustomerComplaint(
            @RequestBody CreateComplaintRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return complaintService.createCustomerComplaint(request, authorizationHeader);
    }

    @GetMapping("/customer/complaints")
    public List<ComplaintResponse> getMyComplaints(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return complaintService.getMyComplaints(authorizationHeader);
    }

    @GetMapping("/customer/complaints/{complaintId}")
    public ComplaintResponse getMyComplaint(
            @PathVariable Integer complaintId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return complaintService.getMyComplaint(complaintId, authorizationHeader);
    }

    @GetMapping("/host/complaints")
    public List<ComplaintResponse> getHostComplaints(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return complaintService.getHostComplaints(authorizationHeader);
    }

    @GetMapping("/host/complaints/{complaintId}")
    public ComplaintResponse getHostComplaint(
            @PathVariable Integer complaintId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return complaintService.getHostComplaint(complaintId, authorizationHeader);
    }

    @GetMapping("/admin/complaints")
    public List<ComplaintResponse> getAdminComplaints(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return complaintService.getAdminComplaints(authorizationHeader);
    }

    @GetMapping("/admin/complaints/{complaintId}")
    public ComplaintResponse getAdminComplaint(
            @PathVariable Integer complaintId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return complaintService.getAdminComplaint(complaintId, authorizationHeader);
    }

    @PostMapping("/admin/complaints/{complaintId}/resolve")
    public ComplaintResponse resolveAdminComplaint(
            @PathVariable Integer complaintId,
            @RequestBody ComplaintActionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return complaintService.updateAdminComplaint(complaintId, request, authorizationHeader);
    }
}
