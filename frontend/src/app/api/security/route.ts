import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', '.well-known', 'security.txt');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error reading security.txt:', error);
        return new NextResponse('Security policy not found', { status: 404 });
    }
}
