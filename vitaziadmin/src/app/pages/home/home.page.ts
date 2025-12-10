import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonIcon, IonSegment,
  IonSegmentButton, IonLabel, IonCard, IonButton,
  IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, timeOutline, checkmarkCircleOutline,
  closeCircleOutline, calendarOutline,
  chevronDownOutline, chevronUpOutline,
  callOutline
} from 'ionicons/icons';

import { ClinicDashboardService } from '../../services/clinic-dashboard.service';
import { DashboardCounts, NotificationResponse } from '../../models/clinic.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonIcon, IonSegment,
    IonSegmentButton, IonLabel, IonCard, IonButton,
    IonRefresher, IonRefresherContent,
    IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class HomePage implements OnInit {
  // Enum status
  currentTab: 'PENDING' | 'CONFIRMED' | 'CANCELED' = 'PENDING';

  counts: DashboardCounts = { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
  totalCount = 0;

  // Danh sách hiển thị
  listData: NotificationResponse[] = [];
  loading = false;

  // Phân trang
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  constructor(private dashboardService: ClinicDashboardService) {
    addIcons({
      personOutline, timeOutline, checkmarkCircleOutline,
      closeCircleOutline, calendarOutline,
      chevronDownOutline, chevronUpOutline,
      callOutline
    });
  }

  ngOnInit() {
    this.loadStats();
    this.loadListData();
  }

  // --- 1. HÀM CẮT CHUỖI MESSAGE ---
  // Mẫu message: "Có yêu cầu đặt lịch từ Nguyễn Văn K - SĐT: 0912345620 tại khoa d - Ca khám: 10:00 đến 12:00"
  parseNotificationMessage(msg: string) {
    if (!msg) return {};

    // Regex bắt các nhóm thông tin
    const nameMatch = msg.match(/từ\s+(.*?)\s+-\s+SĐT/);
    const phoneMatch = msg.match(/SĐT:\s+(\d+)\s+tại/);
    const deptMatch = msg.match(/tại\s+(.*?)\s+-/);
    const timeMatch = msg.match(/Ca khám:\s+(.*)/);

    return {
      userName: nameMatch ? nameMatch[1].trim() : 'Khách vãng lai',
      userPhone: phoneMatch ? phoneMatch[1].trim() : 'Không có SĐT',
      departmentName: deptMatch ? deptMatch[1].trim() : 'Phòng khám chung',
      startTime: timeMatch ? timeMatch[1].trim() : '' // "10:00 đến 12:00"
    };
  }

  // --- 2. LOAD DỮ LIỆU ---
  loadListData(event?: any, isRefresh = false) {
    if (!event) this.loading = true;

    // Gọi API Notification cho TẤT CẢ CÁC TAB
    this.dashboardService.getNotifications(this.currentTab, this.currentPage, this.pageSize).subscribe({
      next: (pageData) => {
        const rawItems = pageData.content || [];

        // Map dữ liệu: Cắt chuỗi message -> Gán vào các biến hiển thị
        const newItems = rawItems.map((notif) => {
          const info = this.parseNotificationMessage(notif.message);
          return {
            ...notif,
            departmentName: info.departmentName,
            userName: info.userName,
            userPhone: info.userPhone,
            startTime: info.startTime,
            expanded: false
          };
        });

        // Logic phân trang: Nối đuôi hoặc Gán mới
        if (this.currentPage === 0) {
          this.listData = newItems;
        } else {
          this.listData = [...this.listData, ...newItems];
        }

        this.totalPages = pageData.totalPages;
        this.loading = false;

        // Tắt loading UI
        if (event) {
          event.target.complete();
          // Nếu hết trang -> tắt infinite scroll
          if (this.currentPage >= this.totalPages - 1) {
            event.target.disabled = true;
          }
        }
      },
      error: (err) => {
        console.error('Load data error:', err);
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  // --- 3. CÁC HÀM SỰ KIỆN ---

  handleRefresh(event: any) {
    this.currentPage = 0;
    // Reset Infinite Scroll
    const infiniteScroll = document.querySelector('ion-infinite-scroll');
    if (infiniteScroll) infiniteScroll.disabled = false;

    this.loadStats();
    this.loadListData(event, true);
  }

  onTabChange() {
    this.listData = [];
    this.currentPage = 0;
    this.totalPages = 0;
    this.loading = true;

    const infiniteScroll = document.querySelector('ion-infinite-scroll');
    if (infiniteScroll) infiniteScroll.disabled = false;

    this.loadListData();
  }

  loadMore(event: any) {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadListData(event);
    } else {
      event.target.disabled = true;
    }
  }

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  updateStatus(item: any, newStatus: string) {
    this.dashboardService.updateNotificationStatus(item.id, newStatus).subscribe({
      next: () => {
        // Sau khi update xong thì refresh lại danh sách để cập nhật UI
        this.handleRefresh({ target: { complete: () => {} } });
      },
      error: (err) => console.error(err)
    });
  }

  loadStats() {
    this.dashboardService.getNotificationCounts().subscribe({
      next: (data) => {
        this.counts = data || { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
        const c = this.counts as any;
        this.totalCount = (c.PENDING || 0) + (c.CONFIRMED || 0) + (c.CANCELED || 0);
      }
    });
  }
}
