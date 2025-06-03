export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  userId: string;
  listId?: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
}
