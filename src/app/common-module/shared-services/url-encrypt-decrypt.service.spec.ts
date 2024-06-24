import { TestBed, inject } from '@angular/core/testing';

import { UrlEncryptDecryptService } from './url-encrypt-decrypt.service';

describe('UrlEncryptDecryptService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlEncryptDecryptService]
    });
  });

  it('should be created', inject([UrlEncryptDecryptService], (service: UrlEncryptDecryptService) => {
    expect(service).toBeTruthy();
  }));
});
