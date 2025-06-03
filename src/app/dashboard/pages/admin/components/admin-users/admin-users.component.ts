import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { User } from '../../../../../auth/interfaces';
import { UserService } from '../../../../../services/user.service';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  dataSource!: MatTableDataSource<User>;
  displayedColumns: string[] = ['name', 'email', 'roles', 'isActive', 'lastLogin', 'actions'];
  isLoading = false;
  totalActiveUsers = 0;
  totalAdminUsers = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calculateUserStats();
        this.dataSource = new MatTableDataSource<User>(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        Swal.fire('Error', 'No se pudieron cargar los usuarios: ' + error, 'error');
        this.isLoading = false;
      }
    });
  }

  calculateUserStats(): void {
    this.totalActiveUsers = this.users.filter(user => user.isActive).length;
    this.totalAdminUsers = this.users.filter(user => user.roles.includes('admin')).length;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: (newUser) => {
            this.users.unshift(newUser);
            this.calculateUserStats();

            this.dataSource.data = [...this.users];

            Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error creating user:', error);
            Swal.fire('Error', 'Error al crear usuario: ' + error, 'error');
          }
        });
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (result.hasOwnProperty('isAdmin')) {
          this.userService.updateUserRole(user._id, result.isAdmin).subscribe({
            next: (updatedUser) => {
              this.updateUserInList(updatedUser);
              Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
            },
            error: (error) => {
              console.error('Error updating user role:', error);
              Swal.fire('Error', error || 'No se pudo actualizar el usuario', 'error');
            }
          });
        }
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que deseas ${action} al usuario "${user.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.toggleUserStatus(user._id).subscribe({
          next: (updatedUser) => {
            this.updateUserInList(updatedUser);
            Swal.fire('Éxito', `Usuario ${action}do correctamente`, 'success');
          },
          error: (error) => {
            console.error(`Error ${action} user:`, error);
            Swal.fire('Error', error || `No se pudo ${action} el usuario`, 'error');
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que deseas eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user._id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u._id !== user._id);
            this.calculateUserStats();
            this.dataSource.data = this.users;
            Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            Swal.fire('Error', error || 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }

  private updateUserInList(updatedUser: User): void {
    const index = this.users.findIndex(u => u._id === updatedUser._id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      this.calculateUserStats();
      this.dataSource.data = this.users;
    }
  }

  formatLastLogin(date: Date | undefined): string {
    if (!date) {
      return 'Nunca';
    }

    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleString(roles: string[]): string {
    if (roles.includes('admin')) {
      return 'Administrador';
    }
    return 'Usuario';
  }
}
