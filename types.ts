
export type MessageRole = 'user' | 'bot';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export interface BotResponse {
  text: string;
  suggestions?: string[];
}

export interface Reminder {
  id: string;
  medicineName: string;
  time: string; // HH:mm format
  taken: boolean;
}

export type ReminderFlowState = 'IDLE' | 'AWAITING_NAME' | 'AWAITING_TIME';
