// Wrapper chung cho phản hồi từ API
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// 1. Phòng khám
export interface Clinic {
  id: string;
  clinicName: string;
  address?: string;
  phone?: string;
  description?: string;
}

// 2. Khoa khám
export interface Department {
  id: string;
  departmentName: string;
  description?: string;
}

// 3. Lịch làm việc (Ca khám)
export interface WorkSchedule {
  id: string;
  clinicId: string;
  departmentId: string;
  startTime: string; // VD: "08:00:00"
  endTime: string;   // VD: "11:30:00"
  date: string;      // VD: "2025-12-15"
  maxCapacity?: number;
  bookedQuantity?: number;
  isActive?: boolean;
}

// 4. Payload gửi lên để tạo lịch khám (Khớp ảnh Postman)
export interface BookingRequest {
  clinicId: string;
  departmentId: string;
  scheduleId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  description: string;
  appointmentDate: string; // Định dạng YYYY-MM-DD
}
