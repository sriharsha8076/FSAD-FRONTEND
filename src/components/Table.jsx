import React from 'react';
import styles from './Table.module.css';

export const Table = ({
    columns,
    data,
    keyField = 'id',
    emptyMessage = 'No data available',
    className = '',
}) => {
    return (
        <div className={`${styles.tableContainer} ${className}`.trim()}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={col.key || index} className={styles.th}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.emptyState}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr key={row[keyField] || rowIndex} className={styles.tr}>
                                {columns.map((col, colIndex) => (
                                    <td key={col.key || colIndex} className={styles.td}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
