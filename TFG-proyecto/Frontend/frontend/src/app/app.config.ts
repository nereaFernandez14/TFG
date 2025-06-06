import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, Routes, withRouterConfig } from '@angular/router';
import {
  HttpClientModule,
  HttpClientXsrfModule
} from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    importProvidersFrom(
      HttpClientModule,
      HttpClientXsrfModule.withOptions({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    )
  ]
};
