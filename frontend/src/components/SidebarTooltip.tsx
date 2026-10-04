import styles from './Sidebar.module.css';

interface SidebarTooltipProps {
    label: string;
}

export default function SidebarTooltip({ label }: SidebarTooltipProps) {
    return (
        <div className={styles.tooltip}>
            {label}
        </div>
    );
}
