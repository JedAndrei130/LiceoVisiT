export interface Visitor {
    visitor_id: number;
    visitor_name: string;
    date_time_in: Date;
    date_time_out: Date | null;
    photo: string;
    purpose: string;
    campus_name: string;
    staff_name: string;
}

export interface CreateVisitor {
    visitor_name: string;
    date_time_in: string;
    date_time_out: string | null;
    photo: string | null;
    purpose: string;
    campus_id: number;
    userID: number;
}