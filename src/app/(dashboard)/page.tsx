import { getAllTransactions } from '@/lib/services/dashboard';
import type { Transaction } from '@/types';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    let transactions: Transaction[] | undefined;

    try {
        transactions = await getAllTransactions();
    } catch {
        transactions = [];
    }

    return (
        <div>
            <DashboardClient transactions={transactions} />
        </div>
    );
}
