import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth-service.service';
import { AuthStatus } from './auth/interfaces';
import { NavigationEnd, Router } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
 private authService = inject(AuthService);
  private router = inject(Router);

  public finishedAuthCheck = computed<boolean>(() => {
    const status = this.authService.authStatus();
    console.log('Current auth status:', status);
    return status !== AuthStatus.checking;
  });

  private authCheckTimeout: any;

  ngOnInit() {
    this.authCheckTimeout = setTimeout(() => {
      if (this.authService.authStatus() === AuthStatus.checking) {
        console.warn('Auth check timeout reached, forcing not authenticated state');
        this.authService.logout();
      }
    }, 15000);
  }

  ngOnDestroy() {
    if (this.authCheckTimeout) {
      clearTimeout(this.authCheckTimeout);
    }
  }

  public authStatusChangedEffect = effect(() => {
    const status = this.authService.authStatus();
    
 
    const currentUrl = window.location.pathname + window.location.search;
    
    console.log('🚨 Auth Effect:', {
      status,
      windowLocation: currentUrl,
      routerUrl: this.router.url
    });

  
    if (currentUrl.includes('/auth/reset-password')) {
      console.log('🛑 RESET PASSWORD ROUTE - SKIPPING ALL AUTH LOGIC');
      return;
    }

   
    if (currentUrl.includes('/auth/')) {
      console.log('🛑 AUTH ROUTE DETECTED - SKIPPING AUTH LOGIC');
      return;
    }

    if (status !== AuthStatus.checking && this.authCheckTimeout) {
      clearTimeout(this.authCheckTimeout);
      this.authCheckTimeout = null;
    }

    switch(status) {
      case AuthStatus.checking:
        console.log('⏳ Checking authentication...');
        return;

      case AuthStatus.authenticated:
        console.log('✅ User authenticated, current URL:', currentUrl);

        if (currentUrl.startsWith('/auth') || currentUrl === '/' || currentUrl === '') {
          console.log('🏠 Navigating to dashboard');
          this.router.navigateByUrl('/dashboard');
        }
        return;

      case AuthStatus.notAuthenticated:
        console.log('❌ User not authenticated, current URL:', currentUrl);


        if (!currentUrl.startsWith('/auth')) {
          console.log('🚫 Not auth route, navigating to login');
          this.router.navigateByUrl('/auth/login');
        } else {
          console.log('✅ Auth route, staying');
        }
        return;
    }
  });

  forceLogin() {
    console.log('Force login clicked');
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}