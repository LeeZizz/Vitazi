export enum ClinicMode {
  SPECIALTY = 'CHUYEN_KHOA', // phòng khám chuyên khoa
  GENERAL   = 'DA_KHOA'      // phòng khám đa khoa
}

// Phòng khám (clinic_profiles)
export interface ClinicProfile {
  id: string;
  oauth_provider: string;
  oauth_sub: string;
  email?: string;
  clinic_name: string;
  clinic_type: ClinicMode; // CHUYEN_KHOA | DA_KHOA
  created_at: string;      // ISO datetime
  updated_at: string;
}

// Khoa (departments)
export interface Department {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Một dòng trong work_schedules
export interface WorkSchedule {
  id: string;
  clinic_id: string;
  department_id?: string | null;
  date: string;        // 'YYYY-MM-DD'
  start_time: string;  // 'HH:mm:ss'
  end_time: string;    // 'HH:mm:ss'
  capacity: number;
  max_capacity?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Ca làm việc cho UI
export interface Shift {
  id?: string;
  startTime: string;    // 'HH:mm'
  endTime: string;      // 'HH:mm'
  capacity?: number;
  maxCapacity?: number;
}

// Lịch 1 ngày cho 1 phòng khám / 1 khoa
export interface DaySchedule {
  clinic_id: string;
  department_id?: string | null;
  date: string;         // 'YYYY-MM-DD'
  shifts: Shift[];
}

// Payload gửi BE khi lưu lịch
export interface SaveDayScheduleRequest {
  clinic_id: string;
  department_id?: string | null;
  date: string;
  shifts: {
    start_time: string;   // 'HH:mm:ss'
    end_time: string;
    capacity: number;
    max_capacity?: number;
  }[];
}
