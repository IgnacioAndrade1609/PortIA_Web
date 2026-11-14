import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { ChipComponent } from '../../../../shared/components/chip/chip.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-email-approval',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, ChipComponent],
  templateUrl: './email-approval.component.html',
  styleUrl: './email-approval.component.css'
})
export class EmailApprovalComponent {
  private readonly notificationService = inject(NotificationService);

  readonly pendientes = this.notificationService.pendientes;
  readonly columnas = ['numeroContainer', 'canal', 'asunto', 'destinatario', 'createAt', 'estado'];
}
