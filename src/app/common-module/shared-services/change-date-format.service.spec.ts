import { TestBed, inject } from '@angular/core/testing';

import { ChangeDateFormatService } from './change-date-format.service';

describe('ChangeDateFormatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangeDateFormatService]
    });
  });

  it('should be created', inject([ChangeDateFormatService], (service: ChangeDateFormatService) => {
    expect(service).toBeTruthy();
  }));
});
