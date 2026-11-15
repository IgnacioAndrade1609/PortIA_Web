import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UserDto } from '../../models/usuario.model';

export interface AssignContainerDialogData {
  numeroContainer: string;
  analistaActual: string | null;
  analistas: UserDto[];
}

@Component({
  selector: 'app-assign-container-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Asignar contenedor {{ data.numeroContainer }}</h2>
    <mat-dialog-content>
      <p class="asignar-actual">
        {{ data.analistaActual ? 'Asignado actualmente a ' + data.analistaActual + '.' : 'Este contenedor no tiene analista asignado.' }}
      </p>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="pv-full-width">
        <mat-label>Analista</mat-label>
        <mat-select [value]="seleccionado()" (selectionChange)="seleccionado.set($event.value)">
          @for (analista of data.analistas; track analista.id) {
            <mat-option [value]="analista.id">
              {{ analista.name }}{{ analista.supervisor ? ' (' + analista.supervisor.name + ')' : '' }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton="outlined" mat-dialog-close>Cancelar</button>
      <button matButton="filled" class="btn-primary" [disabled]="seleccionado() == null" [mat-dialog-close]="seleccionado()">
        Asignar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .asignar-actual {
      margin: 0 0 16px;
      color: var(--mat-sys-on-surface-variant);
    }
  `]
})
export class AssignContainerDialogComponent {
  readonly data = inject<AssignContainerDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<AssignContainerDialogComponent>);
  readonly seleccionado = signal<number | null>(null);
}
