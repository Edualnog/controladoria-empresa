import { getCategories } from '@/lib/services/categories';
import CategoriesClient from './CategoriesClient';
import type { Category } from '@/types';

export default async function CategoriesPage() {
    let categories: Category[] = [];
    try {
        categories = await getCategories();
    } catch {
        categories = [];
    }

    return <CategoriesClient initialCategories={categories} />;
}
