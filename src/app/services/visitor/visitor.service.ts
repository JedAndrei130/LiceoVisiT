import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { CreateVisitor, Visitor } from "../../model/visitor.model";

@Injectable({
    providedIn: 'root'
})
export class VisitorService {
    private http = inject(HttpClient);
    private API_URL = 'http://localhost:3001/visitors';

    // Singleton cache — survives route changes
    cachedVisitors: Visitor[] = [];

    public async getAllVisitors(): Promise<Visitor[]> {
        const data = await lastValueFrom(this.http.get<Visitor[]>(this.API_URL));
        this.cachedVisitors = data;
        return data;
    }

    public async createVisitor(payload: CreateVisitor) {
        return lastValueFrom(this.http.post<{ message: string; id: number }>(this.API_URL, payload));
    }

    public async checkOutVisitor(id: number, dateTimeOut: string) {
        return lastValueFrom(this.http.put<{ message: string }>(`${this.API_URL}/${id}`, { date_time_out: dateTimeOut }));
    }

    public async deleteVisitor(id: string) {
        return lastValueFrom(this.http.delete<{ message: string }>(`${this.API_URL}/${id}`));
    }
}