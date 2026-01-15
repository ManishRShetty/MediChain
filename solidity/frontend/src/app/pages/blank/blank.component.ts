import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CompanyComponent } from '../../components/company/company.component';
import { CompanyService } from '../../services/company.service';
import { Router } from '@angular/router';
import { MessagesComponent } from '../../components/messages/messages.component';
import { RequestComponent } from '../../components/request/request.component';
import { ChatsService } from '../../services/chats.service';



@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [FooterComponent, SidebarComponent, CompanyComponent],
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.css']
})
export class BlankComponent implements OnInit {
  companyData: any = {};  // Changed from string to any
  requests: any = [];  // Changed from string to array

  constructor(
    private companyService: CompanyService,
    private router: Router,
    private requestService: ChatsService  // ✅ Corrected service injection
  ) {}

  ngOnInit() {
    // Fetch company name
    this.companyService.getCompanyName().subscribe({
      next: (data) => {
        this.companyData =  {
          id:1,
          name: "TechCorp",
          industry: "Software Development",
          location: "San Francisco, CA"
      };

      },
      error: (err) => {
        console.error('Error fetching company name:', err);
      }
    });

    // Fetch requests
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = data.total();
      },
      error: (err) => {
        console.error('Error fetching requests:', err);
      }
    });
  }

  handleClickRequests() {
    this.router.navigate(['/role-based']);
 
  }


}
