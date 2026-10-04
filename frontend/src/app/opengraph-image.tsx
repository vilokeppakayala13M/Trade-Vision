import { ImageResponse } from 'next/og';

// Route segment config - must be in the same directory as the page
export const runtime = 'edge';
export const alt = 'TradeVision - Premium Indian Stock Market Insights';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a35 50%, #0a1628 100%)',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative glow orbs */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        left: '-100px',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-100px',
                        right: '-100px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
                    }}
                />

                {/* Logo area */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '32px',
                    }}
                >
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                        }}
                    >
                        📈
                    </div>
                    <span
                        style={{
                            fontSize: '52px',
                            fontWeight: 800,
                            color: '#ffffff',
                            letterSpacing: '-1px',
                        }}
                    >
                        TradeVision
                    </span>
                </div>

                {/* Tagline */}
                <p
                    style={{
                        fontSize: '28px',
                        color: 'rgba(255,255,255,0.7)',
                        textAlign: 'center',
                        maxWidth: '700px',
                        lineHeight: 1.4,
                        margin: '0 0 40px 0',
                    }}
                >
                    Premium NSE &amp; BSE Stock Market Insights for India
                </p>

                {/* Feature pills */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    {['Live Quotes', 'IPO Calendar', 'AI Analysis', 'Futures'].map((label) => (
                        <div
                            key={label}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '100px',
                                background: 'rgba(59,130,246,0.15)',
                                border: '1px solid rgba(59,130,246,0.3)',
                                color: '#93c5fd',
                                fontSize: '18px',
                                fontWeight: 500,
                            }}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Bottom URL bar */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '16px',
                    }}
                >
                    tradevision.in
                </div>
            </div>
        ),
        { ...size }
    );
}
