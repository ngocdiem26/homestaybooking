package com.homestaybooking.repository;

import com.homestaybooking.entity.HomestayImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomestayImageRepository extends JpaRepository<HomestayImage, Integer> {

    void deleteByHomestayHomeId(Integer homeId);

    List<HomestayImage> findByHomestayHomeIdOrderByIsMainDescSortOrderAscImageIdAsc(Integer homeId);
}
