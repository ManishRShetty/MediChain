import { Component } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-products',
  imports: [],
  templateUrl: './company-products.component.html',
  styleUrl: './company-products.component.css'
})
export class CompanyProductsComponent {
  companyProductData: string = '';
  title: any;
  constructor(private companyService: CompanyService,private router: Router) {}

  ngOnInit() {
    this.companyService.getCompanyProductName().subscribe({
      next: (data) => {
        this.companyProductData = data; // Adjust based on API response
      },
      error: (err) => {
        console.error('Error fetching company name:', err);
      }
    });
  }

  viewTrials() {
    console.log(`Viewing trials for ${this.title}`);
  }

}
