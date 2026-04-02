import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, FormInput, useToast, Button } from '../components';
import { useAuth } from '../utils/AuthContext';
import { User, Mail, Lock, Phone, Save, Calendar } from 'lucide-react';
export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  // Parse existing name
  const nameParts = (user?.name || 'John Doe').split(' ');
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    middleName: '',
    lastName: initialLastName,
    dob: user?.dob || '',
    mobileNo: user?.mobileNo || '+1 (555) 000-0000',
    email: user?.email || 'john@example.com',
    bio: user?.bio || 'Passionate learner and achiever',
    currentPassword: '',
    newPassword: '',
    photo: user?.photo || null,
  });
  const hasChanges =
    formData.firstName !== initialFirstName ||
    formData.lastName !== initialLastName ||
    formData.middleName !== '' ||
    formData.bio !== (user?.bio || 'Passionate learner and achiever') ||
    formData.photo !== (user?.photo || null) ||
    formData.email !== (user?.email || 'john@example.com') ||
    formData.mobileNo !== (user?.mobileNo || '+1 (555) 000-0000') ||
    formData.currentPassword !== '' ||
    formData.newPassword !== '';
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        addToast('Image too large. Please select an image under 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = () => {
    if (!formData.email || formData.email.trim() === '') {
      addToast('Email Address cannot be empty.', 'error');
      return;
    }
    if (!formData.mobileNo || formData.mobileNo.trim() === '') {
      addToast('Mobile Number cannot be empty.', 'error');
      return;
    }
    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
    updateUser({
      name: fullName,
      photo: formData.photo,
      bio: formData.bio,
      mobileNo: formData.mobileNo,
      email: formData.email,
      dob: formData.dob,
    });
    addToast('Profile updated successfully!', 'success');
    setIsEditing(false);
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
    });
  };
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your account information</p>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-8)' }}>
        {/* Profile Image & Basic Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ gridColumn: '1 / -1', '@media (min-width: 1024px)': { gridColumn: 'span 1' } }}
        >
          <Card style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ textAlign: 'center' }}>
              <label style={{ cursor: isEditing ? 'pointer' : 'default', display: 'inline-block' }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                  disabled={!isEditing}
                />
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                  backgroundImage: formData.photo ? `url(${formData.photo})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto var(--spacing-4) auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.25rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {!formData.photo && '👤'}
                  {isEditing && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      width: '100%',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      fontSize: '0.625rem',
                      padding: '4px 0',
                    }}>
                      Upload
                    </div>
                  )}
                </div>
              </label>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>{`${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim()}</h2>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '0 0 var(--spacing-2) 0' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-default)',
                  textTransform: 'capitalize'
                }}>
                  {user?.role}
                </span>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 var(--spacing-6) 0' }}>{formData.email}</p>
              <Button
                variant={isEditing ? 'secondary' : 'primary'}
                onClick={() => setIsEditing(!isEditing)}
                style={{ width: '100%' }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </Card>
          {/* Account Info */}
          <Card style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-6)' }}>
            <h3 style={{ fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-4) 0' }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--card-border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Unique ID</span>
                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}>{user?.uniqueId || user?.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--card-border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Type</span>
                <span style={{ color: 'var(--text-light)', fontWeight: '600', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-3)', borderBottom: '1px solid var(--card-border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}>
                  {(() => {
                    if (!user?.createdAt) return 'Jan 2024';
                    const d = new Date(user.createdAt);
                    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  })()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Status</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  Active
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ gridColumn: '1 / -1', '@media (min-width: 1024px)': { gridColumn: 'span 2' } }}
        >
          <Card style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-6) 0' }}>Personal Information</h2>
              </div>
              <FormInput
                label="Unique ID"
                type="text"
                name="id"
                value={user?.uniqueId || user?.id || ''}
                disabled={true}
                icon={User}
                id="profileId"
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                <FormInput
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={User}
                  id="profileFirstName"
                />
                <FormInput
                  label="Middle Name"
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={User}
                  id="profileMiddleName"
                  placeholder="Optional"
                />
              </div>
              <FormInput
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
                id="profileLastName"
              />
              <FormInput
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                disabled={true}
                icon={Calendar}
                id="profileDob"
              />
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Mail}
                id="profileEmail"
              />
              <FormInput
                label="Mobile Number"
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Phone}
                id="profileMobileNo"
              />
              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-2)' }}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-md)',
                    resize: 'none',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-main)',
                    opacity: !isEditing ? 0.6 : 1,
                    cursor: !isEditing ? 'not-allowed' : 'text'
                  }}
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>
              {/* Password Section */}
              {isEditing && (
                <div style={{ marginTop: 'var(--spacing-4)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-4)' }}>Change Password</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    <FormInput
                      label="Current Password"
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      icon={Lock}
                      placeholder="Enter your current password"
                      id="currentPassword"
                    />
                    <FormInput
                      label="New Password"
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      icon={Lock}
                      placeholder="Enter new password"
                      id="newPassword"
                    />
                  </div>
                </div>
              )}
              {/* Save Button */}
              {isEditing && hasChanges && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}
                >
                  <Save size={16} />
                  Save Changes
                </Button>
              )}
            </div>
          </Card>
          {/* Privacy & Security */}
          <Card style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-6)' }}>
            <h3 style={{ fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-4) 0' }}>Privacy & Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-3)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <span style={{ color: 'var(--text-main)' }}>Two-Factor Authentication</span>
                <Button
                  variant="secondary"
                  onClick={() => addToast('2FA setup initiated', 'info')}
                  style={{ fontSize: '0.875rem' }}
                >
                  Enable
                </Button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-3)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <span style={{ color: 'var(--text-main)' }}>Session Activity</span>
                <Button
                  variant="secondary"
                  onClick={() => addToast('Loading session history...', 'info')}
                  style={{ fontSize: '0.875rem' }}
                >
                  View
                </Button>
              </div>
            </div>
          </Card>
        </motion.div >
      </div >
      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginTop: 'var(--spacing-8)' }}
      >
        <Card style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: 'var(--spacing-6)' }}>
          <h3 style={{ fontWeight: '700', color: 'rgba(252, 165, 165, 1)', margin: '0 0 var(--spacing-4) 0' }}>Danger Zone</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <p style={{ fontSize: '0.875rem', color: 'rgba(254, 202, 202, 1)', margin: 0 }}>
              These actions are irreversible. Please be careful.
            </p>
            <Button
              variant="danger"
              onClick={() => addToast('Account deletion request sent to admin', 'error')}
              style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 1)', color: 'rgba(252, 165, 165, 1)' }}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
