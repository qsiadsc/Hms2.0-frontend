import { TestBed, inject } from '@angular/core/testing';

import { LanguageTranslatorService } from './language-translator.service';

describe('LanguageTranslatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguageTranslatorService]
    });
  });

  it('should be created', inject([LanguageTranslatorService], (service: LanguageTranslatorService) => {
    expect(service).toBeTruthy();
  }));
});
