import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VisitorService } from '../services/visitor/visitor.service';
import { CampusService } from '../services/campus.service';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.scss']
})
export class VisitorFormComponent implements OnInit {
  private visitorService = inject(VisitorService);
  private campusService  = inject(CampusService);

  // ── Signals ──────────────────────────────────
  isSubmitted  = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');

  formData = {
    name:    '',
    campus:  'Main Campus',
    purpose: 'Meeting',
    date: (() => {
      const n = new Date();
      const p = (x: number) => String(x).padStart(2, '0');
      return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
    })(),
    timeIn:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    photoId: ''
  };

  campusOptions = ['Main Campus', 'RnP Campus', 'Paseo Del Rio Campus'];

  private campusIdMap: Record<string, number> = {};

  purposeOptions = [
    'Meeting', 'Delivery', 'Event',
    'Enrollment', 'Pay Tuition', 'Inquiry', 'Other'
  ];

  async ngOnInit() {
    try {
      const campuses = await this.campusService.getAllCampuses();
      for (const c of campuses) {
        this.campusIdMap[c.campus_name] = c.campus_id;
      }
    } catch {
      this.campusIdMap = {
        'Main Campus': 1,
        'RnP Campus': 2,
        'Paseo Del Rio Campus': 3
      };
    }
  }

  onPhotoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { this.formData.photoId = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  async submitForm() {
    if (this.isSubmitting()) return;
    if (!this.formData.name) {
      this.errorMessage.set('Please enter your full name.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload = {
      visitor_name:  this.formData.name,
      date_time_in:  `${this.formData.date}T${this.formData.timeIn}:00`,
      date_time_out: null,
      photo:         this.formData.photoId || null,
      purpose:       this.formData.purpose,
      campus_id:     this.campusIdMap[this.formData.campus] ?? 1,
      userID:        1
    };

    try {
      await this.visitorService.createVisitor(payload);
      this.isSubmitted.set(true);
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage.set('Failed to submit. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm() {
    this.isSubmitted.set(false);
    this.errorMessage.set('');
    this.formData = {
      name:    '',
      campus:  'Main Campus',
      purpose: 'Meeting',
      date: (() => {
        const n = new Date();
        const p = (x: number) => String(x).padStart(2, '0');
        return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
      })(),
      timeIn:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      photoId: ''
    };
  }
}