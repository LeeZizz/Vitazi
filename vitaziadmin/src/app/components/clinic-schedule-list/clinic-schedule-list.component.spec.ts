import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClinicScheduleListComponent } from './clinic-schedule-list.component';

describe('ClinicScheduleListComponent', () => {
  let component: ClinicScheduleListComponent;
  let fixture: ComponentFixture<ClinicScheduleListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClinicScheduleListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicScheduleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
