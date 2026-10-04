"use client";

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './SectorHeatmap.module.css';

const data = [
    { name: 'Financials', size: 400, color: '#10b981' }, // Green
    { name: 'IT', size: 300, color: '#10b981' },
    { name: 'Energy', size: 250, color: '#ef4444' }, // Red
    { name: 'FMCG', size: 200, color: '#10b981' },
    { name: 'Auto', size: 150, color: '#ef4444' },
    { name: 'Pharma', size: 120, color: '#10b981' },
    { name: 'Metals', size: 100, color: '#ef4444' },
];

const CustomContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, color } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: 'var(--background)',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {width > 50 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    fontWeight="bold"
                    dy={4}
                >
                    {name}
                </text>
            )}
        </g>
    );
};

export default function SectorHeatmap() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Sector Performance</h2>
                <span className={styles.subtitle}>NIFTY 50 Sectors</span>
            </div>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomContent />}
                    >
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--surface-hover)', 
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)'
                            }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                        />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
