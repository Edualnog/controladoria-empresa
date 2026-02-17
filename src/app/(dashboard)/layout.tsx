import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main
                className="main-content"
                style={{
                    flex: 1,
                    marginLeft: '240px',
                    padding: '32px 48px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    background: '#ffffff',
                }}
            >
                <div style={{ maxWidth: '960px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
