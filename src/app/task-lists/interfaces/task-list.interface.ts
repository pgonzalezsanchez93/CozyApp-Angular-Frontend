export interface TaskList {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
