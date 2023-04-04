import { TestBed } from '@angular/core/testing';

import { CommunicationsService } from './coms.service';

describe('StatusService', () => {
  let service: CommunicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
