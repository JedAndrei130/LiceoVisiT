import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { VisitorTableComponent } from '../visitor-table/visitor-table.component';

@Component({
  selector: 'app-admin-visitors',
  standalone: true,
  imports: [CommonModule, SidebarComponent, VisitorTableComponent],
  templateUrl: './admin-visitors.component.html',
  styleUrls: ['./admin-visitors.component.scss']
})
export class AdminVisitorsComponent {}