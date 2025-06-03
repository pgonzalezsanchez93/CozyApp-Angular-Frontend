import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../auth/services/auth-service.service';
import { Router } from '@angular/router';
import { User } from '../../../auth/interfaces';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css'
})
export class DashboardHeaderComponent  implements OnInit {
    @Output() toggleSidenav = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  userInitial: string = '';
  avatarColor: string = '#3f51b5';
  isAdmin: boolean = false;

  ngOnInit(): void {
    this.loadUserData();

    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.loadUserData();
      }
    });
  }

  private loadUserData(): void {
    const user = this.authService.currentUser();
    if (user && user.name) {
      this.userInitial = user.name.charAt(0).toUpperCase();
      this.avatarColor = user.preferences?.avatarColor || '#3f51b5';
      this.isAdmin = user.roles.includes('admin');
    }
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
