export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  listId?: string;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  isCompleted?: boolean;
}
