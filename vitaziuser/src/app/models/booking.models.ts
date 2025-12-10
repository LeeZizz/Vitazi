export interface Clinic {
  id: string;
  clinicName: string;
  address?: string;
}

export interface Department {
  id: string;
  departmentName: string;
  description?: string;
}

export interface WorkSchedule {
  id: string;
  startTime: string; // "08:00:00"
  endTime: string;   // "10:00:00"
  date: string;      // "2025-12-15"
  maxQuantity?: number;
  bookedQuantity?: number;
}

// Payload gửi lên server (Khớp với ảnh JSON bạn gửi)
export interface BookingRequest {
  clinicId: string;
  departmentId: string;
  scheduleId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  description: string;
  appointmentDate: string; // YYYY-MM-DD
}
