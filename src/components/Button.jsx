import React from 'react';
import styles from './Button.module.css';

export const Button = ({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    className = '',
    iconOnly = false,
    ...props
}) => {
    const baseClass = styles.button;
    const variantClass = styles[variant] || styles.primary;
    const iconClass = iconOnly ? styles.iconOnly : '';

    const combinedClassName = `${baseClass} ${variantClass} ${iconClass} ${className}`.trim();

    return (
        <button
            type={type}
            className={combinedClassName}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
