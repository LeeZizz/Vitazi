import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonIcon, IonSegment,
  IonSegmentButton, IonLabel, IonCard, IonButton,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, timeOutline, checkmarkCircleOutline,
  closeCircleOutline, calendarOutline, ellipsisVertical
} from 'ionicons/icons';

import { ClinicDashboardService } from '../../services/clinic-dashboard.service';
import { DashboardCounts } from '../../models/clinic.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonIcon, IonSegment,
    IonSegmentButton, IonLabel, IonCard, IonButton,
    IonRefresher, IonRefresherContent
  ]
})
export class HomePage implements OnInit {
  // Mặc định tab Chờ xử lý
  currentTab: 'PENDING' | 'CONFIRMED' | 'CANCELED' = 'PENDING';

  // Thống kê
  counts: DashboardCounts = { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
  totalCount = 0;

  // Dữ liệu danh sách (dùng chung cho cả Appointment và Notification)
  listData: any[] = [];
  loading = false;

  constructor(private dashboardService: ClinicDashboardService) {
    addIcons({ personOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, calendarOutline, ellipsisVertical });
  }

  ngOnInit() {
    this.loadAll();
  }

  // Pull to refresh
  handleRefresh(event: any) {
    this.loadAll();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  loadAll() {
    this.loadStats();
    this.loadListData();
  }

  loadStats() {
    this.dashboardService.getNotificationCounts().subscribe({
      next: (data) => {
        this.counts = data || { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
        this.totalCount = (this.counts.PENDING || 0) + (this.counts.CONFIRMED || 0) + (this.counts.CANCELED || 0);
      },
      error: (err) => console.error('Load stats error', err)
    });
  }

  loadListData() {
    this.loading = true;
    this.listData = [];

    if (this.currentTab === 'PENDING') {
      // Tab Chờ xử lý -> Gọi API Notification
      this.dashboardService.getNotifications('PENDING').subscribe({
        next: (data) => {
          this.listData = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      // Tab Đã xác nhận / Đã hủy -> Gọi API Appointment
      this.dashboardService.getAllAppointments(this.currentTab).subscribe({
        next: (data) => {
          this.listData = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  // Xử lý nút Hành động (Xác nhận / Hủy)
  updateStatus(item: any, newStatus: string) {
    // Nếu đang ở tab Pending, item là Notification -> gọi API updateNotification
    if (this.currentTab === 'PENDING') {
      this.dashboardService.updateNotificationStatus(item.id, newStatus).subscribe({
        next: () => this.loadAll(), // Reload sau khi update
        error: (err) => console.error(err)
      });
    } else {
      // Nếu là Appointment -> gọi API updateAppointment (nếu cần tính năng hủy lịch đã chốt)
      this.dashboardService.updateAppointmentStatus(item.id, newStatus).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error(err)
      });
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    // Giả sử timeString dạng "HH:mm:ss"
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

}
