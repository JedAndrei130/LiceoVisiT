import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.scss']
})
export class VisitorFormComponent {

  isSubmitted = false;

  formData = {
    name: '',
    campus: 'Main Campus',
    purpose: 'Meeting',
    date: new Date().toISOString().split('T')[0],
    timeIn: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}),
    photoId: ''
  };

  campusOptions = [
    'Main Campus',
    'RnP Campus',
    'Paseo Del Rio Campus'
  ];

  purposeOptions = [
    'Meeting',
    'Delivery',
    'Event',
    'Enrollment',
    'Pay Tuition',
    'Inquiry',
    'Other'
  ];

  onPhotoUpload(event:any){
    const file = event.target.files[0];

    if(file){
      const reader = new FileReader();

      reader.onload = () => {
        this.formData.photoId = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  submitForm(){
    console.log(this.formData);
    this.isSubmitted = true;
  }

}