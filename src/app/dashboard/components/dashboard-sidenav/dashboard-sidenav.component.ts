import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth-service.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard-sidenav',
  templateUrl: './dashboard-sidenav.component.html',
  styleUrl: './dashboard-sidenav.component.css'
})
export class DashboardSidenavComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  userInitial: string = '';
  userName: string = '';
  avatarColor: string = '#3f51b5';
  isAdmin: boolean = false;

  ngOnInit(): void {
    this.loadUserData();

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserData();
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeSidenav();
    });
  }

  private loadUserData(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.name;
      this.userInitial = user.name.charAt(0).toUpperCase();
      this.avatarColor = user.preferences?.avatarColor || '#3f51b5';
      this.isAdmin = user.roles.includes('admin');
    }
  }

  closeSidenav(): void {
    this.sidenavClose.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
