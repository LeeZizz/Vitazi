import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonIcon, IonSegment,
  IonSegmentButton, IonLabel, IonCard, IonButton,
  IonRefresher, IonRefresherContent,
  IonFooter, IonSpinner,
  ActionSheetController, AlertController, ToastController,
  ModalController,IonSkeletonText
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

// Interface mở rộng cho UI để xử lý đóng/mở card
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
    IonFooter, IonSpinner, IonSkeletonText
  ]
})
export class HomePage implements OnInit {
  // Tham chiếu đến Content để cuộn lên đầu trang khi chuyển trang
  @ViewChild(IonContent) content!: IonContent;

  currentTab: 'PENDING' | 'CONFIRMED' | 'CANCELED' = 'PENDING';
  counts: DashboardCounts = { PENDING: 0, CONFIRMED: 0, CANCELED: 0 };
  totalCount = 0;

  listData: AppointmentUI[] = [];
  isLoading = false;

  // CẤU HÌNH PHÂN TRANG (Pagination)
  currentPage = 0;
  pageSize = 6; // Yêu cầu: Hiển thị 6 thẻ mỗi trang
  hasMoreData = true; // Kiểm tra xem còn trang sau không

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
    // Load lần đầu
    this.loadListData();
  }

  // --- HELPER: Format giờ ---
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

  // --- CORE: TẢI DỮ LIỆU ---
  /**
   * Tải dữ liệu cho trang hiện tại.
   * @param event Event từ Refresher (nếu có)
   */
  loadListData(event?: any) {
    this.isLoading = true;

    // Nếu không phải là kéo refresh thì scroll lên đầu cho UX tốt hơn
    if (!event) {
      this.scrollToTop();
    }

    this.dashboardService.getAllAppointments(this.currentTab, this.currentPage, this.pageSize)
      .subscribe({
        next: (dataArray) => {
          // Map dữ liệu API sang UI object
          const newItems: AppointmentUI[] = (dataArray || []).map(item => ({
            ...item,
            expanded: false
          }));

          // LOGIC PHÂN TRANG MỚI:
          // Thay thế hoàn toàn listData bằng dữ liệu mới (Page 2 thay thế Page 1)
          // Không dùng push hay concat (...)
          this.listData = newItems;

          // Kiểm tra xem trang này có đầy không?
          // Nếu số lượng trả về < pageSize (ví dụ < 6) nghĩa là đã hết dữ liệu ở trang sau
          this.hasMoreData = newItems.length >= this.pageSize;

          this.isLoading = false;
          if (event) event.target.complete();
        },
        error: (err) => {
          console.error('Load Error:', err);
          this.isLoading = false;
          if (event) event.target.complete();
        }
      });
  }

  // --- CÁC HÀM CHUYỂN TRANG ---

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadListData();
    }
  }

  nextPage() {
    if (this.hasMoreData) {
      this.currentPage++;
      this.loadListData();
    }
  }

  scrollToTop() {
    // Cuộn mượt lên đầu trang trong 500ms
    this.content?.scrollToTop(500);
  }

  // --- UPDATE STATUS (Xác nhận / Hủy / Khôi phục) ---
  updateStatus(item: AppointmentUI, newStatus: string) {
      this.dashboardService.updateAppointmentStatus(item.id, newStatus).subscribe({
        next: () => {
          let msg = 'Cập nhật thành công!';
          if (newStatus === 'CONFIRMED') msg = 'Đã xác nhận lịch hẹn!';
          if (newStatus === 'CANCELED') msg = 'Đã hủy lịch hẹn!';

          this.presentToast(msg, 'success');
          this.loadStats();
          this.loadListData();
        },
        error: (err) => {
          console.error('Update Status Error:', err);

          // 1. Lấy message từ backend trả về (nếu có)
          let errorMsg = 'Lỗi cập nhật trạng thái.';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error; // Backend trả về chuỗi text
            } else if (err.error.message) {
              errorMsg = err.error.message; // Backend trả về JSON object { code, message, ... }
            }
          }

          // 2. Hiển thị thông báo rõ ràng cho người dùng
          this.presentToast(errorMsg, 'danger');
        }
      });
    }

  // --- SỬA LỊCH HẸN (Mở Modal) ---
  async onEditClick(item: AppointmentUI) {
    if (!item.departmentId) {
      this.presentToast('Lỗi dữ liệu: Không tìm thấy ID Khoa.', 'warning');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: AppointmentEditModalComponent,
      componentProps: {
        appointment: item
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      // Gọi API cập nhật khi Modal đóng và trả về dữ liệu
      this.confirmUpdateSchedule(item.id, data.date, data.scheduleId);
    }
  }

  confirmUpdateSchedule(appointmentId: string, date: string, scheduleId: string) {
    this.dashboardService.updateAppointmentInfo(appointmentId, date, scheduleId)
      .subscribe({
        next: () => {
          this.presentToast('Cập nhật lịch khám thành công!', 'success');
          this.loadListData(); // Reload lại trang hiện tại
        },
        error: (err) => {
          console.error('Update Schedule Error:', err);
          this.presentToast('Lỗi khi cập nhật lịch khám.', 'danger');
        }
      });
  }

  // --- CÁC HÀM UI KHÁC ---

  toggleExpand(item: AppointmentUI) {
    item.expanded = !item.expanded;
  }

  handleRefresh(event: any) {
    this.currentPage = 0;
    this.hasMoreData = true;
    this.loadStats();
    this.loadListData(event);
  }

  onTabChange() {
    // Khi đổi tab, reset về trang 0
    this.currentPage = 0;
    this.hasMoreData = true;
    this.listData = []; // Clear tạm thời
    this.loadListData();
  }

  async onPhoneClick(phone: string) {
    if (!phone) return;
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Liên hệ: ${phone}`,
      buttons: [
        {
          text: 'Gọi điện',
          icon: 'call-outline',
          handler: () => { window.open(`tel:${phone}`, '_system'); }
        },
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
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}
