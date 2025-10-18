
export interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export type Sender = 'User' | 'Aisha' | 'Rohan' | 'System';

export interface Message {
  sender: Sender;
  text: string;
}
