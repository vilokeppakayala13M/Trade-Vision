import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Dynamic Apple Touch Icon generator
export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '24%', // Squircle touch icon branding
                    background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 90,
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
