import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FormInput, Card, useToast, Button } from '../components';
import { Upload, CheckCircle } from 'lucide-react';
import { mockStudents } from '../data/mockData';
import { useAuth } from '../utils/AuthContext';
export const AddAchievementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'university_admin';
  const [formData, setFormData] = useState({
    studentName: isAdmin ? '' : user?.name || '',
    activity: '',
    category: '',
    level: '',
    position: '',
    date: '',
    description: '',
    certificateFile: null,
    sharingOption: 'self',
    mentorId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();
  const categoryOptions = [
    { label: '🏆 Sports', value: 'Sports' },
    { label: '💻 Technical', value: 'Technical' },
    { label: '🎭 Cultural', value: 'Cultural' },
    { label: '📚 Other', value: 'Other' },
  ];
  const levelOptions = [
    { label: 'Participation', value: 'Participation' },
    { label: 'College Level', value: 'College' },
    { label: 'State Level', value: 'State' },
    { label: 'National Level', value: 'National' },
    { label: 'International Level', value: 'International' },
  ];
  const studentOptions = mockStudents.map((student) => ({
    label: `${student.name} (${student.studentId})`,
    value: student.name,
  }));
  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentName) newErrors.studentName = 'Student name is required';
    if (!formData.activity) newErrors.activity = 'Activity name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.position) newErrors.position = 'Position/Role is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.certificateFile && !isAdmin && formData.sharingOption === 'mentor' && !formData.mentorId) {
      newErrors.mentorId = 'Mentor ID is required when sharing with mentor';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user?.token) {
      addToast('You must be logged in to submit an achievement.', 'error');
      return;
    }
    try {
      setIsSubmitted(true);

      let finalCertificateUrl = null;

      // 1. Upload file if it exists
      if (formData.certificateFile) {
        const uploadData = new FormData();
        uploadData.append('file', formData.certificateFile);

        const uploadResponse = await fetch('http://localhost:8080/api/achievements/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
            // Note: Content-Type is intentionally omitted so fetch sets the correct multipart boundary
          },
          body: uploadData
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.message || 'Failed to upload certificate file');
        }

        // This should be the unique string returned from the backend
        finalCertificateUrl = uploadResult.message;
      }

      // 2. Create the achievement record
      const response = await fetch('http://localhost:8080/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: formData.activity,
          description: formData.description,
          category: formData.category,
          dateAchieved: formData.date,
          certificateUrl: finalCertificateUrl,
          mentorId: (!isAdmin && formData.sharingOption === 'mentor') ? formData.mentorId : null
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add achievement');
      }
      addToast(data.message || 'Achievement added successfully!', 'success');
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          studentName: isAdmin ? '' : user?.name || '',
          activity: '',
          category: '',
          level: '',
          position: '',
          date: '',
          description: '',
          certificateFile: null,
          sharingOption: 'self',
          mentorId: '',
        });
        setErrors({});
      }, 1000);
    } catch (error) {
      addToast(error.message, 'error');
      setIsSubmitted(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, certificateFile: file });
    }
  };
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>Add Achievement</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Record a new student achievement</p>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-8)' }}>
        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          style={{ gridColumn: '1 / span 2' }}
        >
          <Card style={{ padding: 'var(--spacing-6)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              {isAdmin && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-2)' }}>Student Name</label>
                  <select
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: errors.studentName ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                      color: 'var(--text-light)'
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--bg-dark)' }}>Select Student</option>
                    {studentOptions.map(opt => <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-dark)' }}>{opt.label}</option>)}
                  </select>
                  {errors.studentName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.studentName}</span>}
                </div>
              )}
              <FormInput
                label="Activity Name"
                type="text"
                placeholder="e.g., National Science Olympiad"
                name="activity"
                value={formData.activity}
                onChange={handleInputChange}
                error={errors.activity}
                id="activity"
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-2)' }}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: errors.category ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                      color: 'var(--text-light)'
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--bg-dark)' }}>Select Category</option>
                    {categoryOptions.map(opt => <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-dark)' }}>{opt.label}</option>)}
                  </select>
                  {errors.category && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-2)' }}>Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: errors.level ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                      color: 'var(--text-light)'
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--bg-dark)' }}>Select Level</option>
                    {levelOptions.map(opt => <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-dark)' }}>{opt.label}</option>)}
                  </select>
                  {errors.level && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.level}</span>}
                </div>
              </div>
              <FormInput
                label="Position/Role"
                type="text"
                placeholder="e.g., 1st Prize, Runner-up"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                error={errors.position}
                id="position"
              />
              <FormInput
                label="Date of Achievement"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                error={errors.date}
                id="date"
              />
              <FormInput
                label="Description"
                type="textarea"
                placeholder="Describe the achievement in detail..."
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                id="description"
              />
              {/* File Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)' }}>
                  Certificate Upload
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '4px' }}>(Optional)</span>
                </label>
                <div style={{
                  border: '2px dashed rgba(59, 130, 246, 0.5)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--spacing-6)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-normal)'
                }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 1)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="certificate-upload"
                    accept=".pdf,.jpg,.png"
                  />
                  <label htmlFor="certificate-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                    <Upload size={32} color="var(--primary)" style={{ marginBottom: 'var(--spacing-2)' }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', margin: '0 0 var(--spacing-1) 0' }}>Click to upload or drag and drop</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>PDF, JPG, or PNG up to 10MB</p>
                    {formData.certificateFile && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={16} />
                        {formData.certificateFile.name}
                      </p>
                    )}
                  </label>
                </div>
                {/* Sharing Options (Only for Students who uploaded a file) */}
                {formData.certificateFile && !isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}
                  >
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)' }}>Certificate Options</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer', color: 'var(--text-light)' }}>
                        <input
                          type="radio"
                          name="sharingOption"
                          value="self"
                          checked={formData.sharingOption === 'self'}
                          onChange={handleInputChange}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        Store for Self
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer', color: 'var(--text-light)' }}>
                        <input
                          type="radio"
                          name="sharingOption"
                          value="mentor"
                          checked={formData.sharingOption === 'mentor'}
                          onChange={handleInputChange}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        Share with Mentor
                      </label>
                    </div>
                    {formData.sharingOption === 'mentor' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 'var(--spacing-2)' }}>
                        <FormInput
                          label="Mentor ID"
                          type="text"
                          placeholder="e.g., MENTOR-12345"
                          name="mentorId"
                          value={formData.mentorId}
                          onChange={handleInputChange}
                          error={errors.mentorId}
                          id="mentorId"
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          The certificate will be sent to this mentor for verification, and also saved in your personal storage.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
              <Button type="submit" variant="primary" disabled={isSubmitted} style={{ width: '100%' }}>
                {isSubmitted ? 'Achievement Added ✓' : 'Add Achievement'}
              </Button>
            </form>
          </Card>
        </motion.div>
        {/* Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}
        >
          <Card style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: 'var(--spacing-4)' }}>
            <h3 style={{ fontWeight: '600', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>💡 Tips</h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.875rem', color: 'rgba(191, 219, 254, 1)', lineHeight: 1.5 }}>
              <li>• Provide clear activity names</li>
              <li>• Select accurate categories</li>
              <li>• Level represents achievement scope</li>
              <li>• Upload certificates for verification</li>
              <li>• Detailed descriptions help recognition</li>
            </ul>
          </Card>
          <Card style={{ padding: 'var(--spacing-4)' }}>
            <h3 style={{ fontWeight: '600', color: 'var(--text-light)', margin: '0 0 var(--spacing-4) 0' }}>📊 Achievement Levels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Participation</span>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.2)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>All</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>College Level</span>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Restricted</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>State Level</span>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>National/Int'l</span>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Premium</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
export default AddAchievementPage;
