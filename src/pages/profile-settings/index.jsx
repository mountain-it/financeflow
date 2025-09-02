import React, { useState, useEffect } from 'react';
import HeaderBar from '../../components/ui/HeaderBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ProfileHeader from './components/ProfileHeader';
import AccountSettings from './components/AccountSettings';
import SecuritySettings from './components/SecuritySettings';
import PreferencesSettings from './components/PreferencesSettings';
import PrivacySettings from './components/PrivacySettings';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ProfileSettings = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expandedSections, setExpandedSections] = useState({
    account: false,
    security: false,
    preferences: false,
    privacy: false
  });

  // Real user profile data from database
  const [userProfileData, setUserProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    accountType: 'Free',
    memberSince: '',
    stats: {
      totalTransactions: 0,
      budgetsCreated: 0,
      goalsAchieved: 0,
      streakDays: 0
    }
  });

  const [accountData, setAccountData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneCountry: '+1',
      phoneNumber: '',
      timezone: 'America/New_York'
    },
    emailPreferences: {
      marketing: true,
      security: true
    }
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '',
    activeDevices: 1
  });

  const [preferencesData, setPreferencesData] = useState({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    numberFormat: '1,000.00',
    notifications: {
      budgetAlerts: true,
      billReminders: true,
      goalProgress: true,
      aiInsights: true,
      weeklyReports: false,
      securityAlerts: true
    },
    autoCategorize: true,
    smartSuggestions: true,
    analytics: false
  });

  const [privacyData, setPrivacyData] = useState({
    dataRetention: '2years',
    sharing: {
      supportTeam: true,
      analytics: false,
      marketing: false,
      thirdParty: false
    }
  });

  // Load real user data on component mount
  useEffect(() => {
    if (user && userProfile) {
      loadUserData();
    }
  }, [user, userProfile]);

  // Load user statistics and profile data
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get user statistics from database
      const [transactionsResult, budgetsResult, goalsResult] = await Promise.allSettled([
        supabase.from('transactions').select('id').eq('user_id', user.id),
        supabase.from('budgets').select('id').eq('user_id', user.id),
        supabase.from('financial_goals').select('id').eq('user_id', user.id).eq('is_achieved', true)
      ]);

      const totalTransactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data?.length || 0 : 0;
      const budgetsCreated = budgetsResult.status === 'fulfilled' ? budgetsResult.value.data?.length || 0 : 0;
      const goalsAchieved = goalsResult.status === 'fulfilled' ? goalsResult.value.data?.length || 0 : 0;

      // Calculate streak days (simplified - days since account creation)
      const createdAt = new Date(userProfile.created_at);
      const now = new Date();
      const streakDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

      // Set profile data from userProfile
      setUserProfileData({
        name: userProfile.full_name || 'User',
        email: userProfile.email || user.email,
        avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.full_name || 'User')}&background=3B82F6&color=fff`,
        accountType: userProfile.role === 'admin' ? 'Admin' : 'Free',
        memberSince: new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        stats: {
          totalTransactions,
          budgetsCreated,
          goalsAchieved,
          streakDays
        }
      });

      // Parse name into first and last name
      const nameParts = (userProfile.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setAccountData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName,
          lastName
        }
      }));

      // Set theme preference
      setPreferencesData(prev => ({
        ...prev,
        language: userProfile.theme_preference === 'dark' ? 'en' : 'en' // You can extend this for actual language preferences
      }));

      setSecurityData(prev => ({
        ...prev,
        lastPasswordChange: new Date(userProfile.updated_at).toLocaleDateString()
      }));

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Check for saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('financeflow_language');
    if (savedLanguage) {
      setPreferencesData(prev => ({ ...prev, language: savedLanguage }));
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    if (preferencesData?.language) {
      localStorage.setItem('financeflow_language', preferencesData.language);
    }
  }, [preferencesData?.language]);

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      setError(null);
      
      // Update user_profiles table
      const { error: updateError } = await updateProfile({
        full_name: updatedProfile.name,
        email: updatedProfile.email
      });

      if (updateError) throw updateError;

      // Update local state
      setUserProfileData(updatedProfile);
      
      // Reload data to reflect changes
      await loadUserData();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleAccountUpdate = async (updatedAccount) => {
    try {
      setError(null);
      
      // Combine first and last name
      const fullName = `${updatedAccount.personalInfo.firstName} ${updatedAccount.personalInfo.lastName}`.trim();
      
      // Update user_profiles table
      const { error: updateError } = await updateProfile({
        full_name: fullName
      });

      if (updateError) throw updateError;

      setAccountData(updatedAccount);
      
      // Update profile data to reflect name change
      setUserProfileData(prev => ({
        ...prev,
        name: fullName
      }));
    } catch (err) {
      console.error('Error updating account:', err);
      setError('Failed to update account information');
    }
  };

  const handleSecurityUpdate = (updatedSecurity) => {
    setSecurityData(updatedSecurity);
  };

  const handlePreferencesUpdate = async (updatedPreferences) => {
    try {
      setError(null);
      
      // Update theme preference in database if changed
      if (updatedPreferences.theme !== preferencesData.theme) {
        const themeMode = updatedPreferences.theme === 'dark' ? 'dark' : 'light';
        
        const { error: updateError } = await updateProfile({
          theme_preference: themeMode
        });

        if (updateError) throw updateError;
      }

      setPreferencesData(updatedPreferences);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
    }
  };

  const handlePrivacyUpdate = (updatedPrivacy) => {
    setPrivacyData(updatedPrivacy);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <BottomTabNavigation />
        <main className="pt-16 pb-4 lg:pl-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <BottomTabNavigation />
      <main className="pt-16 pb-4 lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Profile & Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information, security preferences, and privacy settings
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Profile Header */}
            <ProfileHeader 
              userProfile={userProfileData}
              onProfileUpdate={handleProfileUpdate}
            />

            {/* Settings Sections */}
            <div className="space-y-4">
              {/* Account Settings */}
              <AccountSettings
                isExpanded={expandedSections?.account}
                onToggle={() => handleSectionToggle('account')}
                accountData={accountData}
                onAccountUpdate={handleAccountUpdate}
              />

              {/* Security Settings */}
              <SecuritySettings
                isExpanded={expandedSections?.security}
                onToggle={() => handleSectionToggle('security')}
                securityData={securityData}
                onSecurityUpdate={handleSecurityUpdate}
              />

              {/* Preferences Settings */}
              <PreferencesSettings
                isExpanded={expandedSections?.preferences}
                onToggle={() => handleSectionToggle('preferences')}
                preferencesData={preferencesData}
                onPreferencesUpdate={handlePreferencesUpdate}
              />

              {/* Privacy Settings */}
              <PrivacySettings
                isExpanded={expandedSections?.privacy}
                onToggle={() => handleSectionToggle('privacy')}
                privacyData={privacyData}
                onPrivacyUpdate={handlePrivacyUpdate}
              />
            </div>

            {/* Help & Support */}
            <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Our support team is here to help you with any questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 financial-transition">
                    Contact Support
                  </button>
                  <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted financial-transition">
                    View Help Center
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © {new Date()?.getFullYear()} FinanceFlow. All rights reserved.
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <button className="text-sm text-muted-foreground hover:text-foreground financial-transition">
                  Privacy Policy
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground financial-transition">
                  Terms of Service
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground financial-transition">
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;