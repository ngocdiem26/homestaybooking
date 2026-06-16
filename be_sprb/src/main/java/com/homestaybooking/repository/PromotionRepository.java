package com.homestaybooking.repository;

import com.homestaybooking.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    boolean existsByPromotionCode(String promotionCode);
}
