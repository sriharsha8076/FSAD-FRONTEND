import React from 'react';
import styles from './Card.module.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Card = ({
  children,
  className = '',
  hoverable = false,
  variant = 'default', // 'default' | 'gradient'
  ...props
}) => {
  const baseClass = styles.card;
  const hoverClass = hoverable ? styles.cardHoverable : '';
  const variantClass = variant === 'gradient' ? styles.gradient : '';

  const combinedClassName = `${baseClass} ${hoverClass} ${variantClass} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, description, action, className = '' }) => (
  <div className={`${styles.cardHeader} ${className}`.trim()}>
    <div>
      {title && <h3 className={styles.cardTitle}>{title}</h3>}
      {description && <p className={styles.cardDescription}>{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`${styles.cardContent} ${className}`.trim()}>
    {children}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, trend, color, className = '' }) => {
  return (
    <Card hoverable className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <p className={styles.cardDescription}>{label}</p>
          <h3 className={styles.cardTitle} style={{ fontSize: '1.5rem', marginTop: '4px' }}>{value}</h3>
        </div>
        {Icon && (
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: color ? `linear-gradient(135deg, ${color.split(' ')[0].replace('from-', '')}, ${color.split(' ')[1]?.replace('to-', '')})` : 'var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color="white" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{Math.abs(trend)}% from last month</span>
        </div>
      )}
    </Card>
  );
};

export const ChartCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <Card className={className}>
      <CardHeader title={title} description={subtitle} />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export const AchievementCard = ({ achievement, className = '' }) => {
  return (
    <Card hoverable className={className} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {achievement.image ? (
            <img src={achievement.image} alt={achievement.title || achievement.activity} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>🏆</span>
            </div>
          )}
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600', color: 'var(--text-light)' }}>{achievement.title || achievement.activity}</h4>
            <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{achievement.user?.name || achievement.studentName} {achievement.user?.id ? `• ${achievement.user.id}` : ''}</p>
          </div>
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: (achievement.status === 'VERIFIED' || achievement.status === 'Verified') ? 'var(--success-bg)' : 'var(--warning-bg)',
          color: (achievement.status === 'VERIFIED' || achievement.status === 'Verified') ? 'var(--success)' : 'var(--warning)',
          border: `1px solid ${(achievement.status === 'VERIFIED' || achievement.status === 'Verified') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
        }}>
          {achievement.status}
        </span>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-muted)' }}>{achievement.category}</span>
        {achievement.level && <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-muted)' }}>{achievement.level}</span>}
        {achievement.position && <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-muted)' }}>{achievement.position}</span>}
        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-muted)' }}>{new Date(achievement.dateAchieved || achievement.date).toLocaleDateString()}</span>
      </div>
    </Card>
  );
};
