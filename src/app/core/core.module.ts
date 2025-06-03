import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { StorageService } from './services/storage.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers:  [
    ErrorHandlerService,
    StorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]

})
export class CoreModule {

    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
      if (parentModule) {
        throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
      }
  }
}
