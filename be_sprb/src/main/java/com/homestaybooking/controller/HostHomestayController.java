package com.homestaybooking.controller;

import com.homestaybooking.dto.request.HostHomestayRequest;
import com.homestaybooking.dto.response.HostHomestayImageResponse;
import com.homestaybooking.dto.response.HostHomestayResponse;
import com.homestaybooking.service.HostHomestayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/host/homestays")
@RequiredArgsConstructor
public class HostHomestayController {

    private final HostHomestayService hostHomestayService;

    @GetMapping
    public List<HostHomestayResponse> getHomestays(
            @RequestParam(required = false) Integer ownerId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return hostHomestayService.getHomestays(ownerId, authorizationHeader);
    }

    @PostMapping("/images/upload")
    public HostHomestayImageResponse uploadImage(@RequestParam("file") MultipartFile file) {
        return hostHomestayService.uploadImage(file);
    }

    @PostMapping
    public HostHomestayResponse createHomestay(
            @RequestBody HostHomestayRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return hostHomestayService.createHomestay(request, authorizationHeader);
    }

    @PutMapping("/{homeId}")
    public HostHomestayResponse updateHomestay(
            @PathVariable Integer homeId,
            @RequestBody HostHomestayRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return hostHomestayService.updateHomestay(homeId, request, authorizationHeader);
    }

    @DeleteMapping("/{homeId}")
    public ResponseEntity<Void> deleteHomestay(
            @PathVariable Integer homeId,
            @RequestParam(required = false) Integer ownerId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        hostHomestayService.deleteHomestay(homeId, ownerId, authorizationHeader);
        return ResponseEntity.noContent().build();
    }
}
