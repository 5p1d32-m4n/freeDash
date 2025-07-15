export interface Transaction {
  id: string;
  date: string;
  amount: number;
  name: string;
  category: 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Income';
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings';
}
