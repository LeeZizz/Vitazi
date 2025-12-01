package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.repositories.DepartmentRepository;
import com.ezi.vitazibe.services.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;


}
