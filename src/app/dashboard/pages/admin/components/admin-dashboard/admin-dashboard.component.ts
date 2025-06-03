import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import Swal from 'sweetalert2';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  newUsers: number;
  recentActiveUsers: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  userStats: UserStats | null = null;
  isLoading = false;
  

  userStatusData = [
    { name: 'Activos', value: 0 },
    { name: 'Inactivos', value: 0 }
  ];
  
  userRolesData = [
    { name: 'Administradores', value: 0 },
    { name: 'Usuarios', value: 0 }
  ];
  
  userActivityData = [
    { name: 'Activos recientemente', value: 0 },
    { name: 'No activos recientemente', value: 0 }
  ];
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUserStats();
  }
  
  loadUserStats(): void {
    this.isLoading = true;
    this.userService.getUserStats().subscribe({
      next: (stats: UserStats) => {
        this.userStats = stats;
        this.isLoading = false;
        this.updateChartData();
      },
      error: (error: any) => {
        console.error('Error loading user stats:', error);
        Swal.fire('Error', 'No se pudieron cargar las estadísticas de usuarios', 'error');
        this.isLoading = false;
      }
    });
  }
  
  updateChartData(): void {
    if (!this.userStats) return;
    
    
    this.userStatusData = [
      { name: 'Activos', value: this.userStats.activeUsers },
      { name: 'Inactivos', value: this.userStats.inactiveUsers }
    ];
    
    
    this.userRolesData = [
      { name: 'Administradores', value: this.userStats.adminUsers },
      { name: 'Usuarios', value: this.userStats.totalUsers - this.userStats.adminUsers }
    ];
    
    
    this.userActivityData = [
      { name: 'Activos recientemente', value: this.userStats.recentActiveUsers },
      { name: 'No activos recientemente', value: this.userStats.totalUsers - this.userStats.recentActiveUsers }
    ];
  }
  
  getActivePercentage(): number {
    if (!this.userStats || this.userStats.totalUsers === 0) return 0;
    return Math.round((this.userStats.activeUsers / this.userStats.totalUsers) * 100);
  }
  
  getAdminPercentage(): number {
    if (!this.userStats || this.userStats.totalUsers === 0) return 0;
    return Math.round((this.userStats.adminUsers / this.userStats.totalUsers) * 100);
  }
  
  getRecentActivePercentage(): number {
    if (!this.userStats || this.userStats.totalUsers === 0) return 0;
    return Math.round((this.userStats.recentActiveUsers / this.userStats.totalUsers) * 100);
  }
  
  getNewUsersPercentage(): number {
    if (!this.userStats || this.userStats.totalUsers === 0) return 0;
    return Math.round((this.userStats.newUsers / this.userStats.totalUsers) * 100);
  }
}