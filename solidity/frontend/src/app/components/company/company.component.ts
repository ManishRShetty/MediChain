import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule

@Component({
  selector: 'app-company',
  standalone: true, // ✅ Add this if it's a standalone component
  imports: [CommonModule], // ✅ Add CommonModule to support *ngIf
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent {
  @Input() companyData: any; 

  constructor(private router: Router) {}

  navigateToDetails(companyId: string) {
    this.router.navigate(['/company-products']);
  }
}
