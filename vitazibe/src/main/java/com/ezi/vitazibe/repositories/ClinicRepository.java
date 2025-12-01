package com.ezi.vitazibe.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ezi.vitazibe.entities.ClinicEntity;

import java.util.Optional;

@Repository
public interface ClinicRepository extends JpaRepository<ClinicEntity, String> {
    Optional<ClinicEntity> findByOauthSub(String oauthSub);
}
