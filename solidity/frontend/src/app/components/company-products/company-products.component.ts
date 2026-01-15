import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import Router
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-company-products',
  standalone: true,
  imports: [FooterComponent, SidebarComponent, CommonModule], 
  templateUrl: './company-products.component.html',
  styleUrls: ['./company-products.component.css']
})
export class CompanyProductsComponent {
  // List of company product trials
  companyProductData = [
    { id: 1, title: "#Trial123", Result: "85%" },
    { id: 2, title: "#Trial124", Result: "75%" }
  ];

  constructor(private router: Router) {}  // Inject Router

  viewTrials() {
    this.router.navigate(['/viewtrail']);  // Corrected navigation
  }
}
