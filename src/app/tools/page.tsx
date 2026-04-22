import SIPCalculator from '@/components/tools/SIPCalculator';
import LumpsumCalculator from '@/components/tools/LumpsumCalculator';

export default function ToolsPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Financial Tools</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Plan your investments with our advanced calculators.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <SIPCalculator />
                <LumpsumCalculator />
            </div>
        </div>
    );
}
