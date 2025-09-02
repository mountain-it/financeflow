import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';

const AccountSettings = ({ isExpanded, onToggle, accountData, onAccountUpdate }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [personalInfo, setPersonalInfo] = useState(accountData?.personalInfo);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  const phoneCountryOptions = [
    { value: '+1', label: 'United States (+1)' },
    { value: '+44', label: 'United Kingdom (+44)' },
    { value: '+91', label: 'India (+91)' },
    { value: '+86', label: 'China (+86)' },
    { value: '+49', label: 'Germany (+49)' }
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
  ];

  const handlePasswordChange = async () => {
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData?.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
  
      if (error) throw error;
  
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePersonalInfoUpdate = async () => {
    setIsUpdatingInfo(true);
    try {
      // Update user profile in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          phone_number: `${personalInfo.phoneCountry}${personalInfo.phoneNumber}`,
          timezone: personalInfo.timezone,
          date_of_birth: personalInfo.dateOfBirth
        })
        .eq('id', userProfile.id);
  
      if (error) throw error;
  
      onAccountUpdate({ ...accountData, personalInfo });
      alert('Personal information updated successfully');
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Failed to update personal information. Please try again.');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg financial-shadow-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 financial-transition"
      >
        <div className="flex items-center space-x-3">
          <Icon name="User" size={20} className="text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Account Settings</h3>
            <p className="text-sm text-muted-foreground">Personal information, password, and preferences</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-border">
          {/* Personal Information */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={personalInfo?.firstName}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e?.target?.value }))}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                type="text"
                value={personalInfo?.lastName}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e?.target?.value }))}
                placeholder="Enter last name"
              />
              <Input
                label="Date of Birth"
                type="date"
                value={personalInfo?.dateOfBirth}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e?.target?.value }))}
              />
              <Select
                label="Phone Country Code"
                options={phoneCountryOptions}
                value={personalInfo?.phoneCountry}
                onChange={(value) => setPersonalInfo(prev => ({ ...prev, phoneCountry: value }))}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={personalInfo?.phoneNumber}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, phoneNumber: e?.target?.value }))}
                placeholder="Enter phone number"
                className="md:col-span-1"
              />
              <Select
                label="Timezone"
                options={timezoneOptions}
                value={personalInfo?.timezone}
                onChange={(value) => setPersonalInfo(prev => ({ ...prev, timezone: value }))}
              />
            </div>
            <div className="mt-4">
              <Button
                variant="default"
                onClick={handlePersonalInfoUpdate}
                loading={isUpdatingInfo}
                iconName="Save"
                iconPosition="left"
              >
                Update Information
              </Button>
            </div>
          </div>

          {/* Password Change */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Change Password</h4>
            <div className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={passwordData?.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e?.target?.value }))}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e?.target?.value }))}
                placeholder="Enter new password"
                description="Password must be at least 8 characters long"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e?.target?.value }))}
                placeholder="Confirm new password"
              />
              <Button
                variant="default"
                onClick={handlePasswordChange}
                loading={isChangingPassword}
                disabled={!passwordData?.currentPassword || !passwordData?.newPassword || !passwordData?.confirmPassword}
                iconName="Lock"
                iconPosition="left"
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Email Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and tips</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">Important security notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;