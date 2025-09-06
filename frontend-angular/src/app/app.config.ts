import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideForms, provideReactiveForms } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideForms(), provideReactiveForms()]
};
