import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  BookingService,
  DaySchedule,
  TimeSlot,
} from '../../services/booking.service';


@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
})
export class BookingFormComponent implements OnInit {
  days: DaySchedule[] = [];
  selectedDay?: DaySchedule;
  selectedSlot?: TimeSlot;

  isLoadingDays = false;
  isSubmitting = false;
  errorMessage = '';

  form!: FormGroup;

  private clinicId!: number;

    constructor(
      private bookingService: BookingService,
      private fb: FormBuilder,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      this.form = this.fb.group({
        fullName: ['', Validators.required],
        phone: ['', Validators.required],
        email: [''],
        reason: [''],
        receiveNotify: [true],
      });

      // lấy id khoa từ URL: /booking/:clinicId
     this.route.paramMap.subscribe((params: ParamMap) => {
       const idStr = params.get('clinicId');
       if (idStr) {
         this.clinicId = Number(idStr);
         this.loadWeekSchedules();
       }
     });
    }

    private loadWeekSchedules(): void {
      if (!this.clinicId) return;

      this.isLoadingDays = true;
      this.errorMessage = '';

      const today = new Date();
      const from = today.toISOString().substring(0, 10);
      const toDate = new Date(today);
      toDate.setDate(today.getDate() + 6);
      const to = toDate.toISOString().substring(0, 10);

      this.bookingService.getSchedules(this.clinicId, from, to).subscribe({
        next: (days: DaySchedule[]) => {
          this.days = days;
          if (this.days.length > 0) {
            this.onSelectDay(this.days[0]);
          }
          this.isLoadingDays = false;
        },
        error: () => {
          this.errorMessage = 'Không tải được lịch khám, vui lòng thử lại.';
          this.isLoadingDays = false;
        },
      });
    }

  onSelectDay(day: DaySchedule): void {
    this.selectedDay = day;
    this.selectedSlot = undefined;
  }

  onSelectSlot(slot: TimeSlot): void {
    if (!slot.available) {
      return;
    }
    this.selectedSlot = slot;
  }

  onSubmit(): void {
    if (!this.selectedSlot) {
      this.errorMessage = 'Vui lòng chọn ca khám.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin bắt buộc.';
      return;
    }

    const payload = {
      slotId: this.selectedSlot.id,
      fullName: this.form.value.fullName,
      phone: this.form.value.phone,
      email: this.form.value.email || '',
      reason: this.form.value.reason || '',
      receiveNotify: !!this.form.value.receiveNotify,
    };

    this.errorMessage = '';
    this.isSubmitting = true;

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Đặt lịch thành công');
        // TODO: điều hướng sang trang "đặt lịch thành công" nếu cần
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Đặt lịch thất bại, vui lòng thử lại.';
      },
    });
  }

  trackByDate(index: number, day: DaySchedule): string {
    return day.date;
  }

  trackBySlot(index: number, slot: TimeSlot): number {
    return slot.id;
  }
}
