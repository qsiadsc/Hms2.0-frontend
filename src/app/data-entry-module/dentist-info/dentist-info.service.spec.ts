import { TestBed, inject } from '@angular/core/testing';

import { DentistInfoService } from './dentist-info.service';

describe('DentistInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DentistInfoService]
    });
  });

  it('should be created', inject([DentistInfoService], (service: DentistInfoService) => {
    expect(service).toBeTruthy();
  }));
});
