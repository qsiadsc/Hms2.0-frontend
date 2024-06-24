import { TestBed, inject } from '@angular/core/testing';

import { HmsDataServiceService } from './hms-data-service.service';

describe('HmsDataServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HmsDataServiceService]
    });
  });

  it('should be created', inject([HmsDataServiceService], (service: HmsDataServiceService) => {
    expect(service).toBeTruthy();
  }));
});
