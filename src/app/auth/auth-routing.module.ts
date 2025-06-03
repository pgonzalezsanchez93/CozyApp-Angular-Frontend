import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { RequestResetPageComponent } from './pages/request-reset-page/request-reset-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { isNotAuthenticatedGuard } from './guards/is-not-authenticated.guard';


const routes: Routes = [
 {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [isNotAuthenticatedGuard]
      },
      {
        path: 'register',
        component: RegisterPageComponent,
        canActivate: [isNotAuthenticatedGuard]
      },
      {
        path: 'reset-password',
        component: ResetPasswordPageComponent,
        canActivate: [isNotAuthenticatedGuard] 
      },
      {
        path: 'request-reset',
        component: RequestResetPageComponent,
        canActivate: [isNotAuthenticatedGuard] 
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
