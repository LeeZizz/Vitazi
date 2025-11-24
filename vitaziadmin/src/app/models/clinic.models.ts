// src/app/models/clinic.models.ts
export type ClinicMode = 'SPECIALTY' | 'MULTI'; // chuyên khoa | đa khoa

export interface Department {
  id: string;
  name: string;
}

export interface Shift {
  id: string;
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
}

export interface DaySchedule {
  date: string;         // yyyy-MM-dd
  departmentId: string; // id khoa
  shifts: Shift[];
}
