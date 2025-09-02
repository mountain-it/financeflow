import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

const ProfileHeader = ({ userProfile, onProfileUpdate }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(userProfile);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
  
    setIsUploadingPhoto(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
  
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id);
  
      if (updateError) throw updateError;
  
      setProfileData(prev => ({ ...prev, avatar: publicUrl }));
      onProfileUpdate({ ...profileData, avatar: publicUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = () => {
    onProfileUpdate(profileData);
    setIsEditingProfile(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Premium':
        return 'bg-accent text-accent-foreground';
      case 'Basic':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted">
            <Image
              src={profileData?.avatar}
              alt="Profile photo"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 financial-transition">
            <Icon name="Camera" size={14} />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploadingPhoto}
            />
          </label>
          {isUploadingPhoto && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Icon name="Loader2" size={20} className="animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          {isEditingProfile ? (
            <div className="space-y-3">
              <input
                type="text"
                value={profileData?.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Full Name"
              />
              <input
                type="email"
                value={profileData?.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Email Address"
              />
              <div className="flex space-x-2">
                <Button variant="default" size="sm" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h2 className="text-xl font-semibold text-foreground">{profileData?.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  iconName="Edit2"
                  iconPosition="left"
                  iconSize={16}
                >
                  Edit Profile
                </Button>
              </div>
              <p className="text-muted-foreground mb-3">{profileData?.email}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profileData?.accountType)}`}>
                  {profileData?.accountType} Account
                </span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Icon name="Calendar" size={16} className="mr-1" />
                  Member since {profileData?.memberSince}
                </div>
                <div className="flex items-center text-sm text-success">
                  <Icon name="Shield" size={16} className="mr-1" />
                  Verified Account
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Account Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{profileData?.stats?.totalTransactions}</p>
          <p className="text-sm text-muted-foreground">Transactions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{profileData?.stats?.budgetsCreated}</p>
          <p className="text-sm text-muted-foreground">Budgets</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{profileData?.stats?.goalsAchieved}</p>
          <p className="text-sm text-muted-foreground">Goals Achieved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{profileData?.stats?.streakDays}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;