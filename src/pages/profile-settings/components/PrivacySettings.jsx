import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const PrivacySettings = ({ isExpanded, onToggle, privacyData, onPrivacyUpdate }) => {
  const [isExportingData, setIsExportingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  const exportFormatOptions = [
    { value: 'json', label: 'JSON Format' },
    { value: 'csv', label: 'CSV (Excel Compatible)' },
    { value: 'pdf', label: 'PDF Report' },
    { value: 'xlsx', label: 'Excel Spreadsheet' }
  ];

  const dataRetentionOptions = [
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' },
    { value: '5years', label: '5 Years' },
    { value: 'indefinite', label: 'Keep Indefinitely' }
  ];

  const sharingPermissions = [
    {
      id: 'supportTeam',
      title: 'Customer Support Team',
      description: 'Allow support team to access your data for troubleshooting',
      enabled: privacyData?.sharing?.supportTeam ?? true,
      required: true
    },
    {
      id: 'analytics',
      title: 'Anonymous Analytics',
      description: 'Share anonymized usage data to improve the service',
      enabled: privacyData?.sharing?.analytics ?? false,
      required: false
    },
    {
      id: 'marketing',
      title: 'Marketing Insights',
      description: 'Use your data for personalized marketing recommendations',
      enabled: privacyData?.sharing?.marketing ?? false,
      required: false
    },
    {
      id: 'thirdParty',
      title: 'Third-Party Integrations',
      description: 'Share data with connected financial services and apps',
      enabled: privacyData?.sharing?.thirdParty ?? false,
      required: false
    }
  ];

  const handleDataExport = async () => {
    setIsExportingData(true);
    // Simulate data export
    setTimeout(() => {
      setIsExportingData(false);
      alert('Your data export has been prepared and will be sent to your email address within 24 hours.');
    }, 3000);
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    // Simulate account deletion process
    setTimeout(() => {
      setIsDeletingAccount(false);
      alert('Account deletion request submitted. You will receive a confirmation email with next steps.');
      setShowDeleteForm(false);
      setDeleteConfirmation('');
    }, 2000);
  };

  const handleSharingToggle = (permissionId, enabled) => {
    const updatedSharing = {
      ...privacyData?.sharing,
      [permissionId]: enabled
    };
    onPrivacyUpdate({
      ...privacyData,
      sharing: updatedSharing
    });
  };

  const dataCategories = [
    {
      category: 'Financial Data',
      items: ['Transaction history', 'Account balances', 'Budget information', 'Financial goals'],
      size: '2.4 MB'
    },
    {
      category: 'Personal Information',
      items: ['Profile details', 'Contact information', 'Preferences', 'Security settings'],
      size: '156 KB'
    },
    {
      category: 'Usage Analytics',
      items: ['App usage patterns', 'Feature interactions', 'Performance metrics', 'Error logs'],
      size: '892 KB'
    },
    {
      category: 'Communication History',
      items: ['Support conversations', 'Email communications', 'Notification history'],
      size: '234 KB'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg financial-shadow-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 financial-transition"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Lock" size={20} className="text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground">Data export, account deletion, and sharing permissions</p>
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
          {/* Data Overview */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Your Data Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataCategories?.map((category, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-foreground">{category?.category}</h5>
                    <span className="text-sm text-muted-foreground">{category?.size}</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {category?.items?.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center">
                        <Icon name="Dot" size={16} className="mr-1" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Data Export */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Data Export</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-4">
                <Icon name="Download" size={20} className="text-primary mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">Export Your Data</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a complete copy of your financial data. This includes all transactions, budgets, goals, and personal information.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Select
                      label="Export Format"
                      options={exportFormatOptions}
                      value="json"
                      onChange={() => {}}
                    />
                    <Select
                      label="Data Retention Period"
                      options={dataRetentionOptions}
                      value={privacyData?.dataRetention || '2years'}
                      onChange={(value) => onPrivacyUpdate({ ...privacyData, dataRetention: value })}
                    />
                  </div>
                  <Button
                    variant="default"
                    onClick={handleDataExport}
                    loading={isExportingData}
                    iconName="Download"
                    iconPosition="left"
                  >
                    {isExportingData ? 'Preparing Export...' : 'Export My Data'}
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-background rounded p-3">
                <Icon name="Info" size={14} className="inline mr-1" />
                Your data export will be sent to your registered email address within 24 hours. The download link will be valid for 7 days.
              </div>
            </div>
          </div>

          {/* Sharing Permissions */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Data Sharing Permissions</h4>
            <div className="space-y-4">
              {sharingPermissions?.map((permission) => (
                <div key={permission?.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-foreground">{permission?.title}</h5>
                      {permission?.required && (
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                          Required
                        </span>
                      )}
                      {permission?.enabled && !permission?.required && (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                          Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{permission?.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={permission?.enabled}
                      disabled={permission?.required}
                      onChange={(e) => handleSharingToggle(permission?.id, e?.target?.checked)}
                    />
                    <div className={`w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${permission?.required ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Policies */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Privacy Policies</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" iconName="FileText" iconPosition="left">
                Privacy Policy
              </Button>
              <Button variant="outline" iconName="FileText" iconPosition="left">
                Terms of Service
              </Button>
              <Button variant="outline" iconName="FileText" iconPosition="left">
                Cookie Policy
              </Button>
              <Button variant="outline" iconName="FileText" iconPosition="left">
                Data Processing Agreement
              </Button>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="border-t border-border pt-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={20} className="text-destructive mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  {!showDeleteForm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteForm(true)}
                      iconName="Trash2"
                      iconPosition="left"
                    >
                      Delete My Account
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-background rounded p-3">
                        <h5 className="font-medium text-foreground mb-2">What will be deleted:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• All financial transactions and data</li>
                          <li>• Budget and goal information</li>
                          <li>• Personal profile and preferences</li>
                          <li>• Communication history</li>
                          <li>• Account access and login credentials</li>
                        </ul>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Type "DELETE MY ACCOUNT" to confirm:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="DELETE MY ACCOUNT"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          onClick={handleAccountDeletion}
                          loading={isDeletingAccount}
                          disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
                        >
                          {isDeletingAccount ? 'Deleting...' : 'Confirm Deletion'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteForm(false);
                            setDeleteConfirmation('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;