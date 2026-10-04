import StockCardSkeleton from '@/components/skeletons/StockCardSkeleton';

export default function Loading() {
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px', 
            padding: '1.5rem' 
        }}>
            {Array.from({ length: 12 }).map((_, i) => (
                <StockCardSkeleton key={i} />
            ))}
        </div>
    );
}
