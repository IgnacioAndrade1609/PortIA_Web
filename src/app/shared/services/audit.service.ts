import { Injectable, signal } from '@angular/core';
import { MOCK_AUDITORIA } from '../mocks/auditoria.mock';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly logsSignal = signal(MOCK_AUDITORIA);

  readonly logs = this.logsSignal.asReadonly();
}
