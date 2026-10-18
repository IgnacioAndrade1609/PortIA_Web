import { Injectable, signal } from '@angular/core';

export type Tema = 'light' | 'dark';

const STORAGE_KEY = 'portia_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly temaSignal = signal<Tema>(this.resolveInitialTheme());

  readonly tema = this.temaSignal.asReadonly();

  constructor() {
    this.aplicar(this.temaSignal());
  }

  alternar(): void {
    this.set(this.temaSignal() === 'dark' ? 'light' : 'dark');
  }

  set(tema: Tema): void {
    this.temaSignal.set(tema);
    this.aplicar(tema);
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      /* localStorage no disponible (modo privado, etc.) */
    }
  }

  private aplicar(tema: Tema): void {
    document.documentElement.setAttribute('data-theme', tema);
  }

  private resolveInitialTheme(): Tema {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado === 'light' || guardado === 'dark') return guardado;
    } catch {
      /* ignorar */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
