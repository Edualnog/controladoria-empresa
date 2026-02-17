import { getTransactions } from '@/lib/services/transactions';
import { getProjects } from '@/lib/services/projects';
import { getCategories } from '@/lib/services/categories';
import TransactionsClient from './TransactionsClient';
import type { Transaction, Project, Category } from '@/types';

export default async function TransactionsPage() {
    let transactions: Transaction[] = [];
    let projects: Project[] = [];
    let categories: Category[] = [];

    try {
        [transactions, projects, categories] = await Promise.all([
            getTransactions(),
            getProjects(),
            getCategories(),
        ]);
    } catch {
        // defaults already set
    }

    return (
        <TransactionsClient
            initialTransactions={transactions}
            projects={projects}
            categories={categories}
        />
    );
}
