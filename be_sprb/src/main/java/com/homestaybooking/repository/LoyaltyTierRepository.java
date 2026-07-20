package com.homestaybooking.repository;

import com.homestaybooking.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, Integer> {

    List<LoyaltyTier> findByTierStatusIgnoreCaseOrderByDisplayOrderAsc(String tierStatus);

    Optional<LoyaltyTier> findByTierCodeIgnoreCase(String tierCode);
}
