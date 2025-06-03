
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { RequestResetPageComponent } from './pages/request-reset-page/request-reset-page.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginPageComponent,
    RegisterPageComponent,
    ResetPasswordPageComponent,
    RequestResetPageComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule

  ]
})
export class AuthModule { }
