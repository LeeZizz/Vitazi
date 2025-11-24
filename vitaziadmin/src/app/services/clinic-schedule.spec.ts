import { TestBed } from '@angular/core/testing';

import { ClinicSchedule } from './clinic-schedule';

describe('ClinicSchedule', () => {
  let service: ClinicSchedule;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClinicSchedule);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
