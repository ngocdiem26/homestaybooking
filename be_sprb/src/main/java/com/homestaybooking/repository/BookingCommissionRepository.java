package com.homestaybooking.repository;

import com.homestaybooking.entity.BookingCommission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingCommissionRepository extends JpaRepository<BookingCommission, Long> {
    Optional<BookingCommission> findByBookingId(Integer bookingId);
}
