import { z } from 'zod/v4';

export const ProjectSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
});

export const CategorySchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    type: z.enum(['INCOME', 'EXPENSE'], {
        message: 'Tipo deve ser INCOME ou EXPENSE',
    }),
});

export const TransactionSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    amount: z.number().positive('Valor deve ser maior que zero'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)'),
    type: z.enum(['INCOME', 'EXPENSE'], {
        message: 'Tipo deve ser INCOME ou EXPENSE',
    }),
    project_id: z.string().nullable().optional(),
    category_id: z.string().min(1, 'Categoria é obrigatória'),
    installments: z.number().int().min(1).max(120).optional(),
});

export const TransactionUpdateSchema = TransactionSchema.omit({ installments: true });

export function formatZodErrors(error: z.ZodError): string {
    return error.issues.map((issue) => issue.message).join(', ');
}
