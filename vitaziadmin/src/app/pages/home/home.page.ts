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
  closeCircleOutline, calendarOutline,
  chevronDownOutline, chevronUpOutline,
  callOutline
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
  currentTab: 'PENDING' | 'CONFIRMED' | 'CANCELED' = 'PENDING';
  counts: DashboardCounts = { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
  totalCount = 0;
  listData: any[] = [];
  loading = false;

  constructor(private dashboardService: ClinicDashboardService) {
    // Đăng ký icon
    addIcons({
      personOutline, timeOutline, checkmarkCircleOutline,
      closeCircleOutline, calendarOutline,
      chevronDownOutline, chevronUpOutline
    });
  }

  ngOnInit() {
    this.loadAll();
  }

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
      }
    });
  }

  loadListData() {
    this.loading = true;
    this.listData = [];

    // Hàm chung xử lý kết quả để thêm thuộc tính 'expanded' = false mặc định
    const handleResponse = (data: any[]) => {
      console.log('API Response Data:', data);
      this.listData = data.map(item => ({
        ...item,
        expanded: false // Mặc định đóng
      }));
      this.loading = false;
    };

    if (this.currentTab === 'PENDING') {
      this.dashboardService.getNotifications('PENDING').subscribe({
        next: handleResponse,
        error: () => this.loading = false
      });
    } else {
      this.dashboardService.getAllAppointments(this.currentTab).subscribe({
        next: handleResponse,
        error: () => this.loading = false
      });
    }
  }

  // Hàm bật/tắt hiển thị chi tiết
  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  updateStatus(item: any, newStatus: string) {
    // Logic cập nhật trạng thái giữ nguyên
    if (this.currentTab === 'PENDING') {
      this.dashboardService.updateNotificationStatus(item.id, newStatus).subscribe({
        next: () => this.loadAll()
      });
    } else {
      this.dashboardService.updateAppointmentStatus(item.id, newStatus).subscribe({
        next: () => this.loadAll()
      });
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }
}
