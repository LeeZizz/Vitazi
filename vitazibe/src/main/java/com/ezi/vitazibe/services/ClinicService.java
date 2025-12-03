package com.ezi.vitazibe.services;

import com.ezi.vitazibe.entities.ClinicEntity;
import com.ezi.vitazibe.entities.DepartmentEntity;
import com.ezi.vitazibe.enums.ClinicType;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.ClinicRepository;
import com.ezi.vitazibe.repositories.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClinicService {

    private final ClinicRepository clinicRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public ClinicEntity createSpecializedClinic(OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }
        if(picture == null || picture.isEmpty()) {
            picture = "https://www.flaticon.com/free-icon/dinosaur_4681809"; // or = "https://lh3.googleusercontent.com/a/ACg8ocKp36O3gzhAXEL7wPs1G-loJR5oV2vm_NQgKVDJuQFrpK5ZNsO5=s96-c"
        }
        clinicRepository.findByOauthSub(sub)
                .ifPresent(clinic -> {
                    throw new WebException(ErrorCode.CLINIC_EXISTED);
                });

        ClinicEntity newClinic = new ClinicEntity();
        newClinic.setOauthSub(sub);
        newClinic.setOauthEmail(email);
        newClinic.setClinicName(name + " Clinic");
        newClinic.setOauthProvider(picture);
        newClinic.setClinicType(ClinicType.SPECIALIZED);

        ClinicEntity savedClinic = clinicRepository.save(newClinic);

        DepartmentEntity defaultDepartment = new DepartmentEntity();
        defaultDepartment.setClinicId(savedClinic);
        defaultDepartment.setDepartmentName("Specialized Department");
        defaultDepartment.setDesciption("This support for specialized health issues");

        departmentRepository.save(defaultDepartment);
        return savedClinic;
    }

    @Transactional
    public ClinicEntity createGeneralClinic(OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }
        if(picture == null || picture.isEmpty()) {
            picture = "https://www.flaticon.com/free-icon/dinosaur_4681809"; // or = "https://lh3.googleusercontent.com/a/ACg8ocKp36O3gzhAXEL7wPs1G-loJR5oV2vm_NQgKVDJuQFrpK5ZNsO5=s96-c"
        }
        clinicRepository.findByOauthSub(sub)
                .ifPresent(clinic -> {
                    throw new WebException(ErrorCode.CLINIC_EXISTED);
                });

        ClinicEntity newClinic = new ClinicEntity();
        newClinic.setOauthSub(sub);
        newClinic.setOauthEmail(email);
        newClinic.setClinicName(name + " Clinic");
        newClinic.setOauthProvider(picture);
        newClinic.setClinicType(ClinicType.GENERAL);

        return clinicRepository.save(newClinic);
    }

    @Transactional
    public List<ClinicEntity> getAllClinics() {
        return clinicRepository.findAll();
    }


    @Transactional
    public  boolean hasClinic(String oauthSub) {
        return clinicRepository.findByOauthSub(oauthSub).isPresent();
    }
}
