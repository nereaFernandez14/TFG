import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXsrfConfiguration
} from '@angular/common/http';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(
      withInterceptorsFromDi(), // 👈 importante si usas interceptores en otros lugares
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',     // ⚠️ Exactamente como el nombre de la cookie
        headerName: 'X-XSRF-TOKEN'    // ⚠️ Lo que Spring espera en header
      })
    )
  ]
}).catch((err) => console.error(err));
