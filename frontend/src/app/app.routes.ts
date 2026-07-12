import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { Login } from './features/auth/login/login';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Home } from './features/home/home';
import { Profile } from './features/profile/profile';
import { Statistics } from './features/statistics/statistics';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'statistics', component: Statistics },
      { path: 'profile', component: Profile },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: '**', redirectTo: '' },
];
