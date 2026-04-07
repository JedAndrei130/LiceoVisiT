import { Component, OnInit, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { VisitorService } from '../services/visitor/visitor.service';
import { Visitor } from '../model/visitor.model';

@Component({
  selector: 'app-visitor-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-table.component.html',
  styleUrl: './visitor-table.component.scss'
})
export class VisitorTableComponent implements OnInit {
  private visitorService = inject(VisitorService);

  searchTerm   = '';
  campusFilter = 'all';
  startDate    = '';
  endDate      = '';

  visitors: Visitor[] = [];

  // Signals
  isLoading      = signal(false);
  errorMessage   = signal('');
  checkingOutId  = signal<number | null>(null);
  isDeletingId   = signal<number | null>(null);
  selectedPhoto  = signal<string | null>(null);

  @HostListener('document:keydown.escape')
  onEsc() { this.closePhoto(); }

  async ngOnInit() {
    if (this.visitorService.cachedVisitors.length > 0) {
      this.visitors = this.visitorService.cachedVisitors;
    }
    await this.loadVisitors();
  }

  async loadVisitors() {
    if (this.visitors.length === 0) this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      this.visitors = await this.visitorService.getAllVisitors();
    } catch (err) {
      console.error('Failed to load visitors:', err);
      if (this.visitors.length === 0) {
        this.errorMessage.set('Failed to load visitors. Is the backend running?');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredVisitors(): Visitor[] {
    return this.visitors.filter(v => {
      const matchesName   = v.visitor_name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCampus = this.campusFilter === 'all' || v.campus_name === this.campusFilter;
      const visitDate     = new Date(v.date_time_in).toISOString().split('T')[0];
      const matchesStart  = !this.startDate || visitDate >= this.startDate;
      const matchesEnd    = !this.endDate   || visitDate <= this.endDate;
      return matchesName && matchesCampus && matchesStart && matchesEnd;
    });
  }

  get uniqueCampuses(): string[] {
    return [...new Set(this.visitors.map(v => v.campus_name))];
  }

  isActive(v: Visitor): boolean {
    return !v.date_time_out;
  }

  async checkOut(id: number) {
    if (!confirm('Mark this visitor as checked out now?')) return;
    this.checkingOutId.set(id);
    try {
      const now = new Date().toISOString();
      await this.visitorService.checkOutVisitor(id, now);
      const visitor = this.visitors.find(v => v.visitor_id === id);
      if (visitor) visitor.date_time_out = new Date(now) as any;
    } catch (err) {
      console.error('Failed to check out visitor:', err);
    } finally {
      this.checkingOutId.set(null);
    }
  }

  async deleteVisitor(id: number) {
    if (this.isDeletingId() !== null) return;  // block duplicate calls
    if (!confirm('Are you sure you want to delete this visitor record?')) return;
    this.isDeletingId.set(id);
    try {
      await this.visitorService.deleteVisitor(String(id));
      this.visitors = this.visitors.filter(v => v.visitor_id !== id);
    } catch (err) {
      console.error('Failed to delete visitor:', err);
    } finally {
      this.isDeletingId.set(null);
    }
  }

  openPhoto(src: string) {
    this.selectedPhoto.set(src);
    document.body.style.overflow = 'hidden';
  }

  closePhoto() {
    this.selectedPhoto.set(null);
    document.body.style.overflow = '';
  }

  // ─── Print ────────────────────────────────────────────────────────────────
  printRecords() {
    const rows = this.filteredVisitors;
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;

    const tableRows = rows.map(v => `
      <tr>
        <td>${v.visitor_id}</td>
        <td>${v.visitor_name}</td>
        <td>${v.campus_name}</td>
        <td>${v.purpose}</td>
        <td>${v.staff_name}</td>
        <td>${new Date(v.date_time_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        <td>${new Date(v.date_time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${v.date_time_out ? new Date(v.date_time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
        <td>${v.date_time_out ? 'Checked Out' : 'On-Site'}</td>
      </tr>`).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LiceoVisiTrack — Visitor Records</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; margin: 24px; }
          h2  { color: #800000; margin-bottom: 4px; }
          p   { color: #64748b; margin: 0 0 16px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th  { background: #800000; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
          td  { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h2>LiceoVisiTrack — Visitor Records</h2>
        <p>Printed on ${new Date().toLocaleString()} &nbsp;|&nbsp; ${rows.length} record(s)</p>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Visitor Name</th><th>Campus</th><th>Purpose</th>
              <th>Staff</th><th>Date</th><th>Time In</th><th>Time Out</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  // ─── Export CSV ───────────────────────────────────────────────────────────
  exportCSV() {
    const rows = this.filteredVisitors;
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const header = ['ID', 'Visitor Name', 'Campus', 'Purpose', 'Staff', 'Date', 'Time In', 'Time Out', 'Status'];
    const lines = rows.map(v => [
      v.visitor_id,
      escape(v.visitor_name),
      escape(v.campus_name),
      escape(v.purpose),
      escape(v.staff_name),
      new Date(v.date_time_in).toLocaleDateString('en-US'),
      new Date(v.date_time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      v.date_time_out ? new Date(v.date_time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      v.date_time_out ? 'Checked Out' : 'On-Site'
    ].join(','));

    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitors_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}