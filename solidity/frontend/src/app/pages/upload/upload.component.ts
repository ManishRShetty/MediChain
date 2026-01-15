import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { endPoint, Upload } from '../../constants/api-constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FooterComponent, SidebarComponent,CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  message: string = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
    }
  }

  onUpload() {
    if (!this.selectedFile) {
      this.message = 'Please select a file first.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${endPoint}${Upload}`, formData).subscribe({
      next: (response) => {
        this.message = `File ${this.selectedFile!.name} uploaded successfully!`;
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.message = 'File upload failed. Please try again.';
      }
    });
  }
}
