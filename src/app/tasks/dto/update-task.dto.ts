export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  listId?: string;
  isCompleted?: boolean;
  completedAt?: Date;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
}
