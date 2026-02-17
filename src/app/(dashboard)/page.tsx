import { getAllTransactions } from '@/lib/services/dashboard';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    let transactions;

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
