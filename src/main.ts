import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  registerLocaleData(localeEs);
