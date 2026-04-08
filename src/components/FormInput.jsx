import React, { forwardRef } from 'react';
import styles from './FormInput.module.css';

export const FormInput = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const inputClass = `
    ${styles.input} 
    ${Icon ? styles.withIcon : ''} 
    ${error ? styles.errorInput : ''} 
    ${className}
  `.trim();

  return (
    <div className={`${styles.inputContainer} ${containerClassName}`.trim()}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {Icon && (
          <div className={styles.icon}>
            <Icon size={20} />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={id}
            ref={ref}
            className={inputClass}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={type}
            ref={ref}
            className={inputClass}
            {...props}
          />
        )}
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {!error && helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
});

FormInput.displayName = 'FormInput';
