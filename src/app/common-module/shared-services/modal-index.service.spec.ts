import { TestBed, inject } from '@angular/core/testing';

import { ModalIndexService } from './modal-index.service';

describe('ModalIndexService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalIndexService]
    });
  });

  it('should be created', inject([ModalIndexService], (service: ModalIndexService) => {
    expect(service).toBeTruthy();
  }));
});
