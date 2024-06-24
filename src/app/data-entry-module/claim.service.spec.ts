import { TestBed, inject } from '@angular/core/testing';

import { DataEntryService } from './data-entry.service';

describe('ClaimService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataEntryService]
    });
  });

  it('should be created', inject([DataEntryService], (service: DataEntryService) => {
    expect(service).toBeTruthy();
  }));
});
