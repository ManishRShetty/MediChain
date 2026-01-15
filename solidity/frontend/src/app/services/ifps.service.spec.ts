import { TestBed } from '@angular/core/testing';

import { IfpsService } from './ifps.service';

describe('IfpsService', () => {
  let service: IfpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IfpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
