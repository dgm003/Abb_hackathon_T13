import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { DateRangesComponent } from './components/date-ranges/date-ranges.component';
import { ModelTrainingComponent } from './components/model-training/model-training.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'date-ranges', component: DateRangesComponent },
  { path: 'model-training', component: ModelTrainingComponent },
  { path: '**', redirectTo: '/upload' }
];
