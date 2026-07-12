import { Component, inject, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

/** Slide-over navigation drawer opened from the header. */
@Component({
  selector: 'app-hamburger-menu',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './hamburger-menu.html',
  styleUrl: './hamburger-menu.css',
})
export class HamburgerMenu {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly close = output<void>();

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.leave(),
      error: () => this.leave(),
    });
  }

  private leave(): void {
    this.close.emit();
    void this.router.navigate(['/login']);
  }
}
