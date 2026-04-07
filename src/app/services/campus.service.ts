import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";

export interface Campus {
  campus_id: number;
  campus_name: string;
}

@Injectable({ providedIn: 'root' })
export class CampusService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3001/campuses';

  getAllCampuses() {
    return lastValueFrom(this.http.get<Campus[]>(this.API_URL));
  }
}
