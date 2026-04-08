import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md', // sm, md, lg, xl
    closeOnOverlayClick = true,
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };
//123
    const modalContent = (
        <div className={styles.backdrop} onClick={handleOverlayClick}>
            <div className={`${styles.modal} ${styles[size]}`} role="dialog" aria-modal="true">

                {title && (
                    <div className={styles.header}>
                        <h3 className={styles.title}>{title}</h3>
                        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {!title && (
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close"
                        style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
                    >
                        <X size={20} />
                    </button>
                )}

                <div className={styles.content}>
                    {children}
                </div>

                {footer && (
                    <div className={styles.footer}>
                        {footer}
                    </div>
                )}

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
