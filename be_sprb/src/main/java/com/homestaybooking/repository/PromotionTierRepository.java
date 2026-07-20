package com.homestaybooking.repository;

import com.homestaybooking.entity.PromotionTier;
import com.homestaybooking.entity.PromotionTierId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionTierRepository extends JpaRepository<PromotionTier, PromotionTierId> {
}
