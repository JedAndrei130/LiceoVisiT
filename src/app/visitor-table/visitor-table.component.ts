import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-table.component.html',
  styleUrl: './visitor-table.component.scss'
})
export class VisitorTableComponent {

  searchTerm = '';
  campusFilter = 'all';
  startDate = '';
  endDate = '';

  visitors: any[] = [];

}