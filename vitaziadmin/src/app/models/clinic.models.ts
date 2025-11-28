// src/app/models/clinic.models.ts

// Loại phòng khám
export enum ClinicMode {
  SPECIALTY = 'SPECIALTY', // chuyên khoa
  GENERAL   = 'GENERAL'    // đa khoa
}

// Khoa bệnh (bảng departments)
export interface Department {
  id: string;
  name: string;
  clinic_id?: string;      // để optional cho TS đỡ bắt buộc
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Một dòng trong bảng work_schedules
export interface WorkSchedule {
  id: string;
  clinic_id: string;
  department_id?: string | null;
  date: string;           // 'YYYY-MM-DD'
  start_time: string;     // 'HH:mm:ss'
  end_time: string;       // 'HH:mm:ss'
  capacity?: number;
  max_capacity?: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

// Ca làm việc dùng cho UI
export interface Shift {
  id?: string;
  startTime: string;      // 'HH:mm'
  endTime: string;        // 'HH:mm'
  capacity?: number;
  maxCapacity?: number;
}

// Lịch 1 ngày cho 1 phòng khám / khoa
export interface DaySchedule {
  clinic_id: string;
  department_id?: string | null;
  date: string;           // 'YYYY-MM-DD'
  shifts: Shift[];
}

// Payload gửi lên BE để lưu lịch 1 ngày
export interface SaveDayScheduleRequest {
  clinic_id: string;
  department_id?: string | null;
  date: string;
  shifts: {
    start_time: string;   // 'HH:mm:ss'
    end_time: string;
    capacity?: number;
    max_capacity?: number;
  }[];
}
