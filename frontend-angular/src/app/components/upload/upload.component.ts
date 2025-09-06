import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, DataSummary } from '../../services/data.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  isUploading = false;
  uploadResponse: any = null;
  errorMessage = '';
  isDragOver = false;

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.isValidCsvFile(file)) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please select a valid CSV file';
      this.selectedFile = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isValidCsvFile(file)) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Please drop a valid CSV file';
        this.selectedFile = null;
      }
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.uploadResponse = null;

    this.dataService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadResponse = response;
        this.isUploading = false;
        if (response.success) {
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.errorMessage = error.message || 'Upload failed';
        console.error('Upload error:', error);
      }
    });
  }

  resetUpload(): void {
    this.selectedFile = null;
    this.uploadResponse = null;
    this.errorMessage = '';
    this.isUploading = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  proceedToNext(): void {
    this.router.navigate(['/date-ranges']);
  }

  private isValidCsvFile(file: File): boolean {
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasCsvExtension = fileName.endsWith('.csv');
    
    // Check MIME type (be flexible with different CSV MIME types)
    const validMimeTypes = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel'
    ];
    const hasValidMimeType = validMimeTypes.includes(file.type) || file.type === '';
    
    return hasCsvExtension && (hasValidMimeType || file.type === '');
  }
}
