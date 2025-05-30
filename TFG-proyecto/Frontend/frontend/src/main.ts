// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers || [],
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',       // nombre de la cookie (debe coincidir con Spring)
        headerName: 'X-XSRF-TOKEN'      // header que Angular añadirá automáticamente
      })
    )
  ]
}).catch(err => console.error(err));
