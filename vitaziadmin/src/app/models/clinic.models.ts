// FE dùng 2 mode: CHUYÊN KHOA / ĐA KHOA
export type ClinicType = 'SPECIALTY' | 'GENERAL';

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
  createdAt: string;

  userName?: string;
  userPhone?: string;
  userEmail?: string;
  departmentName?: string;
  startTime?: string;
  appointmentDate?: string;
  signs?: string;
  description?: string;
  expanded?: boolean;
}

export interface AppointmentResponse {
  id: string;
  userName: string;
  userPhone: string;
  userEmail?: string;

  clinicId: string;
  departmentId: string;   // <-- QUAN TRỌNG: Cần trường này để load ca làm việc
  departmentName: string;

  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';

  description?: string;
  scheduleId?: string;
  createdAt?: string;
}

// Interface Ca làm việc hiển thị trong Modal
export interface WorkScheduleOption {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  maxCapacity: number;
  isActive: boolean;
}

export interface DashboardCounts {
  PENDING: number;
  CONFIRMED: number;
  CANCELED: number;
  TOTAL?: number;
}

// Thông tin phòng khám – backend trả clinicType là string (GENERAL / DA_KHOA / ...)
export interface ClinicProfile {
  id: string;
  oauthProvider: string;
  oauthEmail: string;
  clinicName: string;
  oauthSub: string;
  clinicType: string;       // 'GENERAL', 'SPECIALIZED'
  createdAt: string;
  updatedAt: string;
}

export interface OwnerInformation {
  ownerName: string;
  ownerEmail: string;
  ownerAvatar: string;
  ownerSub: string;
}

export interface ClinicSummary {
  id: string;
  clinicName: string;
  clinicType: ClinicType;
  oauthSub?: string;
  oauthEmail?: string;
}

// Khoa bệnh – map đúng JSON getListDepartments
export interface Department {
  id: string;
  clinicId: string;
  clinicName: string;
  departmentName: string;
  description: string;
}

export interface WorkScheduleDto {
  id: string;
  clinic_id: string;
  department_id?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  max_capacity?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// UI Input (Dùng cho form nhập liệu)
export interface WorkShiftInput {
  startTime: string;
  endTime: string;
  capacity?: number;
  maxCapacity?: number;
  // isActive có thể thêm vào đây nếu UI cho phép toggle, tạm thời để mặc định
}

// Payload cho API Update (Khớp với Postman)
export interface UpdateScheduleBody {
  capacity: number;
  maxCapacity: number;
  startTime: string;
  endTime: string;
  isActive: boolean | string; // Postman đang để "true", code sẽ xử lý
  date: string;
}

// Payload FE gửi để lưu lịch 1 ngày (Create)
export interface SaveSchedulesPayload {
  clinicId: string;
  departmentId: string | null;
  date: string;
  shifts: WorkShiftInput[];
}

// Response chung backend đang dùng
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
