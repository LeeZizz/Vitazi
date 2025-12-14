import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonIcon, IonSegment,
  IonSegmentButton, IonLabel, IonCard, IonButton,
  IonRefresher, IonRefresherContent,
  IonFooter, IonSpinner,
  ActionSheetController, AlertController, ToastController,
  ModalController, IonSkeletonText,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, timeOutline, checkmarkCircleOutline,
  closeCircleOutline, calendarOutline,
  callOutline, ellipsisVertical, createOutline,
  chevronDownOutline, chevronUpOutline,
  chevronBackOutline, chevronForwardOutline,
  checkmarkDoneCircleOutline, calendarNumberOutline
} from 'ionicons/icons';

import { ClinicDashboardService } from '../../services/clinic-dashboard.service';
import { DashboardCounts, AppointmentResponse } from '../../models/clinic.models';
import { AppointmentEditModalComponent } from '../../components/appointment-edit-modal/appointment-edit-modal.component';

interface AppointmentUI extends AppointmentResponse {
  expanded?: boolean;
}

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
    IonFooter, IonSpinner, IonSkeletonText,
    IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class HomePage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  currentTab: 'PENDING' | 'CONFIRMED' | 'CANCELED' = 'PENDING';
  counts: DashboardCounts = { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
  totalCount = 0;

  listData: AppointmentUI[] = [];
  isLoading = false;

  // CẤU HÌNH SCROLL
  currentPage = 0;
  pageSize = 10;
  hasMoreData = true;

  constructor(
    private dashboardService: ClinicDashboardService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      personOutline, timeOutline, checkmarkCircleOutline,
      closeCircleOutline, calendarOutline,
      callOutline, ellipsisVertical, createOutline,
      chevronDownOutline, chevronUpOutline,
      chevronBackOutline, chevronForwardOutline,
      checkmarkDoneCircleOutline, calendarNumberOutline
    });
  }

  ngOnInit() {
    this.loadStats();
    this.loadListData();
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12 < 10 ? '0' + h12 : h12}:${m} ${ampm}`;
    }
    return timeString;
  }

  loadListData(event?: any) {
    // Chỉ hiện loading spinner lớn nếu là load lần đầu tiên (page 0)
    if (this.currentPage === 0) {
      this.isLoading = true;
    }

    this.dashboardService.getAllAppointments(this.currentTab, this.currentPage, this.pageSize)
      .subscribe({
        next: (dataArray) => {
          const newItems: AppointmentUI[] = (dataArray || []).map(item => ({
            ...item,
            expanded: false
          }));

          if (this.currentPage === 0) {
            // Nếu là trang đầu, reset list
            this.listData = newItems;
          } else {
            // Nếu là trang sau, nối tiếp vào list cũ
            this.listData = [...this.listData, ...newItems];
          }

          // Kiểm tra còn dữ liệu không
          if (newItems.length < this.pageSize) {
            this.hasMoreData = false;
          }

          this.isLoading = false;

          // Hoàn thành event Refresher hoặc Infinite Scroll
          if (event) event.target.complete();
        },
        error: (err) => {
          console.error('Load Error:', err);
          this.isLoading = false;
          if (event) event.target.complete();
        }
      });
  }

  // Sự kiện khi cuộn xuống dưới cùng
  onIonInfinite(ev: any) {
    if (this.hasMoreData) {
      this.currentPage++;
      this.loadListData(ev);
    } else {
      ev.target.complete();
    }
  }

  handleRefresh(event: any) {
    this.currentPage = 0;
    this.hasMoreData = true;
    this.loadStats(); // Load lại cả số liệu thống kê
    this.loadListData(event);
  }

  onTabChange() {
    this.currentPage = 0;
    this.hasMoreData = true;
    this.listData = [];
    this.scrollToTop(); // Cuộn lên đầu khi đổi tab
    this.loadListData();
  }

  scrollToTop() {
    this.content?.scrollToTop(0);
  }

  updateStatus(item: AppointmentUI, newStatus: string) {
      this.dashboardService.updateAppointmentStatus(item.id, newStatus).subscribe({
        next: () => {
          let msg = 'Cập nhật thành công!';
          if (newStatus === 'CONFIRMED') msg = 'Đã xác nhận lịch hẹn!';
          if (newStatus === 'CANCELED') msg = 'Đã hủy lịch hẹn!';
          this.presentToast(msg, 'success');

          this.loadStats();
          this.currentPage = 0;
          this.loadListData();
        },
        error: (err) => {
          // Sử dụng hàm helper để lấy thông báo lỗi tiếng Việt
          const msg = this.getFriendlyErrorMessage(err);
          this.presentToast(msg, 'danger');
        }
      });
    }

  async onEditClick(item: AppointmentUI) {
    if (!item.departmentId) {
      this.presentToast('Lỗi dữ liệu: Không tìm thấy ID Khoa.', 'warning');
      return;
    }
    const modal = await this.modalCtrl.create({
      component: AppointmentEditModalComponent,
      componentProps: { appointment: item }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.confirmUpdateSchedule(item.id, data.date, data.scheduleId);
    }
  }

  confirmUpdateSchedule(appointmentId: string, date: string, scheduleId: string) {
      this.dashboardService.updateAppointmentInfo(appointmentId, date, scheduleId)
        .subscribe({
          next: () => {
            this.presentToast('Cập nhật lịch khám thành công!', 'success');
            this.handleRefresh(null);
          },
          error: (err) => {
            // Sử dụng hàm helper để lấy thông báo lỗi tiếng Việt
            const msg = this.getFriendlyErrorMessage(err);
            this.presentToast(msg, 'danger');
          }
        });
  }

  toggleExpand(item: AppointmentUI) {
    item.expanded = !item.expanded;
  }

  async onPhoneClick(phone: string) {
    if (!phone) return;
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Liên hệ: ${phone}`,
      buttons: [
        { text: 'Gọi điện', icon: 'call-outline', handler: () => { window.open(`tel:${phone}`, '_system'); } },
        { text: 'Đóng', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  loadStats() {
    this.dashboardService.getDashboardCounts().subscribe({
      next: (data) => {
        this.counts = data || { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
        const c = this.counts as any;
        this.totalCount = (c.PENDING || 0) + (c.CONFIRMED || 0) + (c.CANCELED || 0);
      },
      error: (err) => console.error('Stats Error:', err)
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2500, color: color, position: 'top'
    });
    toast.present();
  }

  private getFriendlyErrorMessage(err: any): string {
      // Nếu lỗi trả về có cấu trúc { code: number, message: string }
      const errorBody = err.error;

      if (errorBody && errorBody.code) {
        switch (errorBody.code) {
          case 1005: // APPOINTMENT_NOT_FOUND
            return 'Không tìm thấy lịch hẹn này (có thể đã bị xóa).';

          case 1007: // SCHEDULE_NOT_FOUND
            return 'Không tìm thấy lịch làm việc của bác sĩ.';

          case 1009: // SCHEDULE_FULL
          case 1012: // SCHEDULE_FULLY_BOOKED
            return 'Khung giờ này đã đầy, vui lòng chọn giờ khác.';

          case 1010: // INVALID_SCHEDULE_DATE
            return 'Ngày khám không hợp lệ.';

          case 1011: // SCHEDULE_NOT_ACTIVE hoặc TIME_CONFLICT
            return 'Lịch làm việc chưa kích hoạt hoặc bị trùng giờ.';

          case 1004: // DEPARTMENT_NOT_FOUND
            return 'Không tìm thấy chuyên khoa.';

          case 1001: // CLINIC_EXISTED
          case 1002: // CLINIC_NOT_FOUND
            return 'Lỗi thông tin phòng khám.';

          default:
            return errorBody.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        }
      }

      if (typeof errorBody === 'string') return errorBody;
      if (errorBody && errorBody.message) return errorBody.message;

      return 'Lỗi kết nối máy chủ.';
    }
}
