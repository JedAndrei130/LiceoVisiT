import { Injectable } from '@angular/core';

export interface Visitor {
  id: string;
  name: string;
  campus: string;
  purpose: string;
  date: string;
  timeIn: string;
  timeOut?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorStoreService {

  STORAGE_KEY = 'liceo_visitor_logs';

  visitors: Visitor[] = [];

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.visitors = JSON.parse(stored);
    }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.visitors));
  }

  getVisitors() {
    return this.visitors;
  }

  addVisitor(visitor: Omit<Visitor,'id'>) {

    const newVisitor: Visitor = {
      ...visitor,
      id: Math.random().toString(36).substring(2,9)
    };

    this.visitors.unshift(newVisitor);
    this.save();
  }

  updateVisitor(id:string,data:Partial<Visitor>){

    this.visitors = this.visitors.map(v =>
      v.id === id ? {...v,...data} : v
    );

    this.save();
  }

}