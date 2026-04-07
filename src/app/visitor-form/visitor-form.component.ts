import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { inject } from '@angular/core';
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
  private campusService = inject(CampusService);

  isSubmitted = signal(false);
  isSubmitting = false;
  errorMessage = '';

  formData = {
    name: '',
    campus: 'Main Campus',
    purpose: 'Meeting',
    date: new Date().toISOString().split('T')[0],
    timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    photoId: ''
  };

  campusOptions = [
    'Main Campus',
    'RnP Campus',
    'Paseo Del Rio Campus'
  ];

  // Populated dynamically from the API to match real DB campus_ids
  private campusIdMap: Record<string, number> = {};

  purposeOptions = [
    'Meeting',
    'Delivery',
    'Event',
    'Enrollment',
    'Pay Tuition',
    'Inquiry',
    'Other'
  ];

  async ngOnInit() {
    try {
      const campuses = await this.campusService.getAllCampuses();
      // Build map from campus_name → campus_id using real DB data
      for (const c of campuses) {
        this.campusIdMap[c.campus_name] = c.campus_id;
      }
    } catch (err) {
      console.error('Failed to load campuses from API:', err);
      // Fallback to hardcoded IDs if API is unavailable
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
      reader.onload = () => {
        this.formData.photoId = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async submitForm() {
    if (this.isSubmitting) return;  // Block duplicate calls
    if (!this.formData.name) {
      this.errorMessage = 'Please enter your full name.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      visitor_name: this.formData.name,
      date_time_in: `${this.formData.date}T${this.formData.timeIn}:00`,
      date_time_out: null,
      photo: this.formData.photoId || null,
      purpose: this.formData.purpose,
      campus_id: this.campusIdMap[this.formData.campus] ?? 1,
      userID: 1
    };

    try {
      await this.visitorService.createVisitor(payload);
      this.isSubmitted.set(true);
      console.log('submitted')
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'Failed to submit. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.isSubmitted.set(false);
    this.errorMessage = '';
    this.formData = {
      name: '',
      campus: 'Main Campus',
      purpose: 'Meeting',
      date: new Date().toISOString().split('T')[0],
      timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      photoId: ''
    };
  }
}