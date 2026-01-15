import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent {

}
