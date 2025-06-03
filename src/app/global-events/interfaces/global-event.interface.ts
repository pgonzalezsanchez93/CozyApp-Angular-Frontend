export interface GlobalEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  startTime?: string; 
  endTime?: string; 
  allDay?: boolean; 
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}