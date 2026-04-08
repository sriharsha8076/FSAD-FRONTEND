import React from 'react';
import { ResponsiveContainer } from 'recharts';
import styles from './ChartContainer.module.css';

export const ChartContainer = ({
    children,
    height = 300,
    className = '',
}) => {
    return (
        <div className={`${styles.chartContainer} ${className}`.trim()} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
};

// Optional: A helper for a custom tooltip to keep styling consistent
export const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className={styles.tooltipValue} style={{ color: entry.color || 'var(--primary)' }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
