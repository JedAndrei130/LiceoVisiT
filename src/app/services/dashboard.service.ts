import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";

export interface DashboardStats {
  visitorsToday: number;
  activeVisitors: number;
  totalRecords: number;
  recentVisits: any[];
}

export interface TrendPoint {
  visit_date: string;
  count: number;
}

export interface PurposePoint {
  purpose: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private BASE = 'http://localhost:3001';

  // Singleton cache — survives route changes
  cachedStats: DashboardStats = {
    visitorsToday: 0,
    activeVisitors: 0,
    totalRecords: 0,
    recentVisits: []
  };

  async getStats(): Promise<DashboardStats> {
    const data = await lastValueFrom(this.http.get<DashboardStats>(`${this.BASE}/dashboard/stats`));
    this.cachedStats = data;
    return data;
  }

  async getVisitorTrends(): Promise<TrendPoint[]> {
    return lastValueFrom(this.http.get<TrendPoint[]>(`${this.BASE}/dashboard/visitor-trends`));
  }

  async getVisitPurpose(): Promise<PurposePoint[]> {
    return lastValueFrom(this.http.get<PurposePoint[]>(`${this.BASE}/dashboard/visit-purpose`));
  }
}
