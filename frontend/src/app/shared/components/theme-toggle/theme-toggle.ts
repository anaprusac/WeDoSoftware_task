import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';

/** Icon button that flips between light and dark themes. */
@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);
  readonly isDark = this.themeService.isDark;

  toggle(): void {
    this.themeService.toggle();
  }
}
