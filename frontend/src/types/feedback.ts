export interface Feedback {
  id: string;
  name?: string;
  email?: string;
  type: 'suggestion' | 'compliment' | 'complaint' | 'positive' | 'other';
  rating?: number;
  message: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedbackData {
  name?: string;
  email?: string;
  type: 'suggestion' | 'compliment' | 'complaint' | 'positive' | 'other';
  rating?: number;
  message: string;
}

export interface UpdateFeedbackData {
  name?: string;
  email?: string;
  type?: 'suggestion' | 'compliment' | 'complaint' | 'positive' | 'other';
  rating?: number;
  message?: string;
  adminNote?: string;
}