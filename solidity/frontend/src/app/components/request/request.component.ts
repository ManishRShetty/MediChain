import { Component, Input } from '@angular/core';
import { ChatsService } from '../../services/chats.service'; // Ensure the service is imported
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request',
   standalone: true,
  imports:[CommonModule],
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent {
  @Input() requests: any = [];  // Ensure it's initialized to an empty array

  constructor(private chatsService: ChatsService) {}  // Inject ChatsService

  approveCard(address: string) {
    // Call the approveRequest method from ChatsService
    this.chatsService.approveRequest(address).subscribe({
      next: (response) => {
        alert(`${address} has been approved successfully! ✅`);
        console.log(response); // Log the response from the backend
      },
      error: (err) => {
        console.error('Error approving role:', err);
        alert('Error approving role request! ❌');
      }
    });
  }

  rejectCard(name: string) {
    alert(`${name} has been rejected! ❌`);
  }
}
