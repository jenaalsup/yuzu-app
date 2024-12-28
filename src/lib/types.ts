export interface Party {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  location: string;
  description: string;
  requireApproval: boolean;
  createdBy: string;
  createdAt: number;
}

export interface User {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
}