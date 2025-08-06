import { CreditCard, Wallet, PiggyBank, Building } from 'lucide-react';
import { Account } from '../types';

export const getAccountIcon = (type: Account['type']) => {
  switch (type) {
    case 'checking':
      return Building;
    case 'savings':
      return PiggyBank;
    case 'credit':
      return CreditCard;
    case 'investment':
      return Building;
    case 'cash':
      return Wallet;
    default:
      return Wallet;
  }
};

export const getAccountColor = (type: Account['type']) => {
  switch (type) {
    case 'checking':
      return 'bg-blue-100 text-blue-600';
    case 'savings':
      return 'bg-green-100 text-green-600';
    case 'credit':
      return 'bg-red-100 text-red-600';
    case 'investment':
      return 'bg-purple-100 text-purple-600';
    case 'cash':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}; 