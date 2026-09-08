package com.homestaybooking.repository;

import com.homestaybooking.entity.HostMaintenanceFee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HostMaintenanceFeeRepository extends JpaRepository<HostMaintenanceFee, Long> {
    Optional<HostMaintenanceFee> findByHostIdAndBillingYearAndBillingMonth(Integer hostId, Integer billingYear, Integer billingMonth);
}
