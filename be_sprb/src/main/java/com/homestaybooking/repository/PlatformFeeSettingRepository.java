package com.homestaybooking.repository;

import com.homestaybooking.entity.PlatformFeeSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformFeeSettingRepository extends JpaRepository<PlatformFeeSetting, Long> {
}
