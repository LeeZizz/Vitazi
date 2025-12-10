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

// Helper: Format giờ hiển thị
  // Input: "14:30:00" -> Output: "02:30 PM"
  // Input: "2025-12-10T14:30:00" -> Output: "02:30 PM"
  formatTime(timeString: string | undefined): string {
    if (!timeString) return '';

    // Trường hợp 1: Nếu là chuỗi text từ Notification (VD: "10:00 đến 12:00")
    // Giữ nguyên không format
    if (timeString.includes('đến')) {
      return timeString;
    }

    // Trường hợp 2: Nếu là ISO Date string (VD: "2025-12-10T14:30:00")
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      // Format theo locale Việt Nam, 12h (AM/PM)
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

    // Trường hợp 3: Nếu là chuỗi giờ SQL (VD: "14:30:00" hoặc "09:00")
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];

      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12; // Chuyển 0h hoặc 12h thành 12, 13h thành 1
      const hString = h12 < 10 ? '0' + h12 : h12; // Thêm số 0 đằng trước nếu cần

      return `${hString}:${m} ${ampm}`;
    }

    // Trường hợp không khớp format nào, trả về nguyên gốc
    return timeString;
  }

  // --- 1. HÀM CẮT CHUỖI MESSAGE ---
  // Mẫu message: "Có yêu cầu đặt lịch từ Nguyễn Văn K - SĐT: 0912345620 tại khoa d - Ca khám: 10:00 đến 12:00"
  parseNotificationMessage(msg: string) {
      if (!msg) return {};

      // 1. Lấy tên
      const nameMatch = msg.match(/từ\s+(.*?)\s+-\s+SĐT/);
      // 2. Lấy SĐT
      const phoneMatch = msg.match(/SĐT:\s+(\d+)\s+tại/);
      // 3. Lấy Khoa
      const deptMatch = msg.match(/tại\s+(.*?)\s+-/);

      // 4. Lấy Giờ (Sửa lại: Lấy đến trước chữ "- Dấu hiệu" hoặc hết câu)
      const timeMatch = msg.match(/Ca khám:\s+(.*?)(?:\s+-\s+Dấu hiệu|$)/);

      // 5. Lấy Dấu hiệu (Mới)
      const signMatch = msg.match(/Dấu hiệu:\s+(.*)/);

      return {
        userName: nameMatch ? nameMatch[1].trim() : 'Khách vãng lai',
        userPhone: phoneMatch ? phoneMatch[1].trim() : '',
        departmentName: deptMatch ? deptMatch[1].trim() : 'Phòng khám chung',
        startTime: timeMatch ? timeMatch[1].trim() : '',
        signs: signMatch ? signMatch[1].trim() : 'Không có mô tả dấu hiệu' // <--- MỚI
      };
    }

  // --- 2. LOAD DỮ LIỆU ---
  loadListData(event?: any, isRefresh = false) {
      if (!event) this.loading = true;

      this.dashboardService.getNotifications(this.currentTab, this.currentPage, this.pageSize).subscribe({
        next: (pageData) => {
          const rawItems = pageData.content || [];

          const newItems = rawItems.map((notif) => {
            // Luôn parse vì giờ chúng ta dùng Notification cho cả 3 tab
            const parsedInfo = this.parseNotificationMessage(notif.message);

            return {
              ...notif,
              departmentName: parsedInfo.departmentName,
              userName: parsedInfo.userName,
              userPhone: parsedInfo.userPhone,
              startTime: parsedInfo.startTime,
              signs: parsedInfo.signs,

              // Gán ngày tạo thành ngày hẹn để hiển thị
              appointmentDate: notif.createdAt,

              // Mặc định email rỗng nếu không parse được
              userEmail: '',

              expanded: false
            } as NotificationResponse; // Ép kiểu về NotificationResponse
          });

          if (this.currentPage === 0) {
            this.listData = newItems;
          } else {
            this.listData = [...this.listData, ...newItems];
          }

          this.totalPages = pageData.totalPages;
          this.loading = false;

          if (event) {
            event.target.complete();
            if (this.currentPage >= this.totalPages - 1) {
              event.target.disabled = true;
            }
          }
        },
        error: (err) => {
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
