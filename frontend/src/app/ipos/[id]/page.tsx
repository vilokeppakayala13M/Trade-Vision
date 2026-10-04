import IPOClient from './IPOClient';
import { getIPOById } from '@/lib/ipoData';

export default async function IPODetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const ipo = getIPOById(id);
    return <IPOClient ipo={ipo || null} />;
}
