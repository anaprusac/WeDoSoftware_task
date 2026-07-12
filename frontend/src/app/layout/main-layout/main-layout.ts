import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { HamburgerMenu } from '../hamburger-menu/hamburger-menu';

/** Authenticated shell: fixed header + slide-over menu + routed page content. */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, HamburgerMenu],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  readonly menuOpen = signal(false);
}
