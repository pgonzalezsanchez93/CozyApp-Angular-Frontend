

export interface CreateGlobalEventDto {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}
