import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, FormInput } from '../components';
import { Bell, Moon, Globe, Shield, Save } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useTheme } from '../utils/ThemeContext';
export const SettingsPage = () => {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setLocalSettings] = useState({
    notifications: true,
    emailNotifications: true,
    twoFactor: false,
    language: 'en',
  });
  const handleToggle = (key) => {
    setLocalSettings({ ...settings, [key]: !settings[key] });
  };
  const handleSave = () => {
    addToast('Settings saved successfully!', 'success');
  };
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Customize your SAAMS experience</p>
      </motion.div>
      <div style={{ maxWidth: '48rem', marginTop: 'var(--spacing-8)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Notifications */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', margin: '0 0 var(--spacing-6) 0' }}>
              <Bell size={20} />
              Notifications
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p style={{ color: 'var(--text-light)', fontWeight: '600', margin: '0 0 var(--spacing-1) 0' }}>Push Notifications</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Receive notifications on your device</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p style={{ color: 'var(--text-light)', fontWeight: '600', margin: '0 0 var(--spacing-1) 0' }}>Email Notifications</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Get updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
        {/* Appearance */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', margin: '0 0 var(--spacing-6) 0' }}>
              <Moon size={20} />
              Appearance
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-light)', fontWeight: '600', marginBottom: 'var(--spacing-3)' }}>Theme</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-3)' }}>
                  {['light', 'dark', 'auto'].map((t) => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setTheme(t)}
                      style={{
                        padding: 'var(--spacing-2) var(--spacing-3)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '500',
                        transition: 'all var(--transition-normal)',
                        textTransform: 'capitalize',
                        background: theme === t ? 'linear-gradient(to right, var(--primary), var(--secondary))' : 'var(--bg-surface)',
                        border: theme === t ? 'none' : '1px solid var(--border-default)',
                        color: theme === t ? 'white' : 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-light)', fontWeight: '600', marginBottom: 'var(--spacing-2)' }}>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setLocalSettings({ ...settings, language: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="en" style={{ background: 'var(--bg-elevated)' }}>English</option>
                  <option value="es" style={{ background: 'var(--bg-elevated)' }}>Spanish</option>
                  <option value="fr" style={{ background: 'var(--bg-elevated)' }}>French</option>
                  <option value="hi" style={{ background: 'var(--bg-elevated)' }}>Hindi</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>
        {/* Privacy & Security */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', margin: '0 0 var(--spacing-6) 0' }}>
              <Shield size={20} />
              Privacy & Security
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p style={{ color: 'var(--text-light)', fontWeight: '600', margin: '0 0 var(--spacing-1) 0' }}>Two-Factor Authentication</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Add extra security to your account</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={() => handleToggle('twoFactor')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => addToast('Opening Privacy Policy...', 'info')}
                style={{ width: '100%' }}
              >
                View Privacy Policy
              </Button>
              <Button
                variant="secondary"
                onClick={() => addToast('Opening Terms of Service...', 'info')}
                style={{ width: '100%' }}
              >
                Terms of Service
              </Button>
            </div>
          </Card>
        </motion.div>
        {/* Save Button */}
        <Button
          variant="primary"
          onClick={handleSave}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}
        >
          <Save size={16} />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
