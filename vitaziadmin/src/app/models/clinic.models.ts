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
  message: string; // Chuỗi cần cắt
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
  createdAt: string; // Ngày tạo (Dùng làm ngày đặt)
  // Các field phụ sau khi parse (để hiển thị UI)
  userName?: string;
  userPhone?: string;
  departmentName?: string;
  startTime?: string;
  expanded?: boolean; // Trạng thái đóng/mở accordion
}

export interface AppointmentResponse {
  id: string;
  clinicId: string;
  clinicName: string;
  departmentId: string;
  departmentName: string; // VD: "Khoa Răng Hàm Mặt"
  scheduleId: string;
  startTime: string;      // VD: "10:00:00"
  endTime: string;        // VD: "12:00:00"
  appointmentDate: string;// VD: "2025-12-15"
  userName: string;       // VD: "Nguyễn Văn E"
  userPhone: string;      // VD: "0912345620"
  userEmail: string;
  description: string;    // VD: "Đau đầu..."
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
  createdAt: string;
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

// DTO lịch làm việc, dùng cho WorkSchedulesService
export interface WorkScheduleDto {
  id: string;
  clinic_id: string;
  department_id?: string | null;
  date: string;          // 'YYYY-MM-DD'
  start_time: string;    // 'HH:mm:ss'
  end_time: string;      // 'HH:mm:ss'
  capacity: number;
  max_capacity?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Ca làm việc trên UI
export interface WorkShiftInput {
  startTime: string;     // 'HH:mm'
  endTime: string;       // 'HH:mm'
  capacity?: number;
  maxCapacity?: number;
}

// Payload FE gửi để lưu lịch 1 ngày
export interface SaveSchedulesPayload {
  clinicId: string;
  departmentId: string | null;
  date: string;               // 'YYYY-MM-DD'
  shifts: WorkShiftInput[];   // các ca trong ngày
}

// Response chung backend đang dùng
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
