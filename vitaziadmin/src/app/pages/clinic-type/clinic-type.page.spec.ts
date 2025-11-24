import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicTypePage } from './clinic-type.page';

describe('ClinicTypePage', () => {
  let component: ClinicTypePage;
  let fixture: ComponentFixture<ClinicTypePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicTypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
