package com.homestaybooking.repository;

import com.homestaybooking.entity.CustomerTierAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerTierAccountRepository extends JpaRepository<CustomerTierAccount, Integer> {
}
