import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Dynamic favicon generator
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '24%', // Squircle branding
                    background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 16,
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    lineHeight: 1,
                    textAlign: 'center',
                }}
            >
                TV
            </div>
        ),
        {
            ...size,
        }
    );
}
