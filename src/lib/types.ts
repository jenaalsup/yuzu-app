export interface Party {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  location: string;
  description: string;
  requireApproval: boolean;
  createdBy: string;
  createdByName: string;  // Add this line
  createdAt: number;
  guests: {
    [uid: string]: {
      status: 'yes' | 'maybe' | 'no';
      timestamp: number;
    }
  };
}

export interface User {
  uid: string;
  phoneNumber: string;
  displayName: string;
  photoURL?: string;
}