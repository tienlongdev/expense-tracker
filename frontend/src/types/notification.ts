export type NotificationType = 1 | 2 | 3; // 1=BudgetAlert, 2=SalaryReceived, 3=WeeklySummary

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
