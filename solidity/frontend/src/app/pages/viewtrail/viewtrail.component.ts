import { Component, OnInit } from '@angular/core';
import { IfpsService } from '../../services/ifps.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';
import { GATEWAY } from "../../constants/api-constants";

@Component({
  selector: 'app-viewtrail',
   standalone: true,
    imports: [SidebarComponent,FooterComponent,PdfViewerModule,CommonModule],
  templateUrl: './viewtrail.component.html',
  styleUrls: ['./viewtrail.component.css']
})
export class ViewtrailComponent implements OnInit {
  files: any[] = [];  // Stores the list of files
  selectedFileUrl: string = ''; // Selected PDF URL

  constructor(private ifpsService: IfpsService) {}

  ngOnInit(): void {
    this.ifpsService.getFiles().subscribe(response => {
      this.files = response; // Store all files from MongoDB
    });
  }

  viewFile(ipfsHash: string): void {
    this.selectedFileUrl = `${GATEWAY}${ipfsHash}`;
  }

  downloadPdf(): void {
    if (!this.selectedFileUrl) {
      console.error("No file selected for download.");
      return;
    }

    const link = document.createElement('a');
    link.href = this.selectedFileUrl;
    link.target = '_blank';
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
