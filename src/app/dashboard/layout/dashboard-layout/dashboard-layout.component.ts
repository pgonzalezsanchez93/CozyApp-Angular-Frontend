import { Component, computed, ElementRef, HostListener, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../auth/services/auth-service.service';


@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.initializeTheme();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.sidenav && this.sidenav.opened) {
        this.sidenav.close();
      }
    });

    this.themeService.currentTheme$.subscribe(theme => {
      this.applyTheme(theme);
    });
  }

  private initializeTheme(): void {
    const user = this.authService.currentUser();
    if (user?.preferences?.theme) {
      this.themeService.setTheme(user.preferences.theme);
    }
  }

  private applyTheme(themeId: string): void {
    const element = this.elementRef.nativeElement;
    const themeClasses = ['theme-default', 'theme-dark', 'theme-light', 'theme-nature', 'theme-ocean', 'theme-cozy'];

    themeClasses.forEach(themeClass => {
      this.renderer.removeClass(element, themeClass);
    });

    this.renderer.addClass(element, `theme-${themeId}`);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  closeSidenav(): void {
    if (this.sidenav && this.sidenav.opened) {
      this.sidenav.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const isMenuButton = target.closest('.menu-button');
    const isSidenavContent = target.closest('mat-sidenav');

    if (this.sidenav && this.sidenav.opened && !isMenuButton && !isSidenavContent) {
      this.sidenav.close();
    }
  }
}
