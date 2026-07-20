package com.homestaybooking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PromotionTierId implements Serializable {

    @Column(name = "promotion_id")
    private Integer promotionId;

    @Column(name = "tier_id")
    private Integer tierId;
}
