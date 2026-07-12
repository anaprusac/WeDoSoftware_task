import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';

/** App header shown on every authenticated page. Identical across screens. */
@Component({
  selector: 'app-header',
  imports: [ThemeToggle, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.user;
  readonly menuToggle = output<void>();
}
