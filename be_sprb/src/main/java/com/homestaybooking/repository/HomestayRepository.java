package com.homestaybooking.repository;

import com.homestaybooking.entity.Homestay;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;

public interface HomestayRepository extends JpaRepository<Homestay, Integer> {

    @EntityGraph(attributePaths = {"owner", "owner.role", "images"})
    @Query("select distinct h from Homestay h where h.deletedAt is null")
    List<Homestay> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"owner", "owner.role", "images"})
    List<Homestay> findByOwnerUserIdAndDeletedAtIsNull(Integer ownerId);

    @EntityGraph(attributePaths = {"owner", "owner.role", "images"})
    Optional<Homestay> findByHomeIdAndOwnerUserIdAndDeletedAtIsNull(Integer homeId, Integer ownerId);

    @EntityGraph(attributePaths = {"owner", "owner.role", "images"})
    Optional<Homestay> findByHomeIdAndDeletedAtIsNull(Integer homeId);

    @EntityGraph(attributePaths = {"owner", "owner.role", "images"})
    @Query("select distinct h from Homestay h where h.deletedAt is null and h.homeId in :homeIds")
    List<Homestay> findVisibleCardsByHomeIdIn(@Param("homeIds") Collection<Integer> homeIds);
}
