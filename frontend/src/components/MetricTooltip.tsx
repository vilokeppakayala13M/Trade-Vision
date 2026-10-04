"use client";

import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import styles from './MetricTooltip.module.css';
import { ReactNode } from 'react';

interface MetricTooltipProps {
    label: string | ReactNode;
    content: string | ReactNode;
}

export default function MetricTooltip({ label, content }: MetricTooltipProps) {
    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <button className={styles.trigger} type="button">
                        {label}
                        <Info size={12} className={styles.icon} />
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className={styles.content} sideOffset={5} side="top">
                        {content}
                        <Tooltip.Arrow className={styles.arrow} />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
