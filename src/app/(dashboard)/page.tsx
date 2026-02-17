import { getDashboardData } from '@/lib/services/dashboard';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    let dashboardData;

    try {
        dashboardData = await getDashboardData();
    } catch {
        dashboardData = {
            totalIncome: 0,
            totalExpense: 0,
            totalProfit: 0,
            profitByProject: [],
            monthlyData: [],
            expenseByCategory: [],
            forecast: [],
        };
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            {/* Summary Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px',
                }}
            >
                <div className="stat-card income">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Receita Total
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginTop: '4px' }}>
                                {formatCurrency(dashboardData.totalIncome)}
                            </p>
                        </div>
                        <TrendingUp size={20} color="#16a34a" />
                    </div>
                </div>

                <div className="stat-card expense">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Despesa Total
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginTop: '4px' }}>
                                {formatCurrency(dashboardData.totalExpense)}
                            </p>
                        </div>
                        <TrendingDown size={20} color="#dc2626" />
                    </div>
                </div>

                <div className="stat-card profit">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Lucro Total
                            </p>
                            <p
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: dashboardData.totalProfit >= 0 ? '#37352f' : '#dc2626',
                                    marginTop: '4px',
                                }}
                            >
                                {formatCurrency(dashboardData.totalProfit)}
                            </p>
                        </div>
                        <DollarSign size={20} color="#37352f" />
                    </div>
                </div>
            </div>

            <DashboardClient
                profitByProject={dashboardData.profitByProject}
                monthlyData={dashboardData.monthlyData}
                expenseByCategory={dashboardData.expenseByCategory}
                forecast={dashboardData.forecast}
            />
        </div>
    );
}
