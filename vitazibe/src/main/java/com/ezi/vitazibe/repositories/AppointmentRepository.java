package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.dto.response.MonthlyCountResponse;
import com.ezi.vitazibe.entities.AppointmentEntity;
import com.ezi.vitazibe.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, String> {
    Page<AppointmentEntity> findByClinicId_IdAndStatus(String clinicId, Status status, Pageable pageable);
    Page<AppointmentEntity> findByClinicId_IdOrderByCreatedAtDesc(String clinicId, Pageable pageable);
    @Query("SELECT new com.ezi.vitazibe.dto.response.MonthlyCountResponse(CAST(EXTRACT(MONTH FROM a.createdAt) AS int), COUNT(a)) " +
            "FROM AppointmentEntity a " +
            "WHERE a.clinicId.id = :clinicId AND EXTRACT(YEAR FROM a.createdAt) = :year " +
            "GROUP BY EXTRACT(MONTH FROM a.createdAt)")
    List<MonthlyCountResponse> countAppointmentsByMonth(@Param("clinicId") String clinicId, @Param("year") int year);

    @Query("SELECT COUNT(a) FROM AppointmentEntity a WHERE a.clinicId.id = :clinicId AND a.createdAt BETWEEN :startDate AND :endDate")
    Long countAppointmentsBetweenDates(@Param("clinicId") String clinicId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

}
