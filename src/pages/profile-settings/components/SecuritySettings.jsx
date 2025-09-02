import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SecuritySettings = ({ isExpanded, onToggle, securityData, onSecurityUpdate }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(securityData?.twoFactorEnabled);
  const [showQRCode, setShowQRCode] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);

  const mockBackupCodes = [
    'A1B2-C3D4-E5F6',
    'G7H8-I9J0-K1L2',
    'M3N4-O5P6-Q7R8',
    'S9T0-U1V2-W3X4',
    'Y5Z6-A7B8-C9D0',
    'E1F2-G3H4-I5J6',
    'K7L8-M9N0-O1P2',
    'Q3R4-S5T6-U7V8'
  ];

  const loginHistory = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, NY',
      timestamp: '2025-08-29 08:30:00',
      status: 'success',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'New York, NY',
      timestamp: '2025-08-28 19:45:00',
      status: 'success',
      current: false
    },
    {
      id: 3,
      device: 'Chrome on Android',
      location: 'Brooklyn, NY',
      timestamp: '2025-08-27 14:20:00',
      status: 'success',
      current: false
    },
    {
      id: 4,
      device: 'Firefox on Windows',
      location: 'Unknown Location',
      timestamp: '2025-08-26 22:15:00',
      status: 'failed',
      current: false
    }
  ];

  const activeDevices = [
    {
      id: 1,
      name: 'Chrome on Windows',
      location: 'New York, NY',
      lastActive: '2025-08-29 09:27:00',
      current: true
    },
    {
      id: 2,
      name: 'Safari on iPhone 15',
      location: 'New York, NY',
      lastActive: '2025-08-28 19:45:00',
      current: false
    },
    {
      id: 3,
      name: 'Chrome on Android',
      location: 'Brooklyn, NY',
      lastActive: '2025-08-27 14:20:00',
      current: false
    }
  ];

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    setShowQRCode(true);
    // Simulate 2FA setup
    setTimeout(() => {
      setBackupCodes(mockBackupCodes);
      setIsEnabling2FA(false);
    }, 2000);
  };

  const handleVerify2FA = async () => {
    if (verificationCode?.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }
    
    setIs2FAEnabled(true);
    setShowQRCode(false);
    onSecurityUpdate({ ...securityData, twoFactorEnabled: true });
    alert('Two-factor authentication enabled successfully!');
  };

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      setIs2FAEnabled(false);
      setShowQRCode(false);
      setBackupCodes([]);
      onSecurityUpdate({ ...securityData, twoFactorEnabled: false });
    }
  };

  const handleRevokeDevice = (deviceId) => {
    if (confirm('Are you sure you want to revoke access for this device?')) {
      alert('Device access revoked successfully');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleDateString() + ' at ' + date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-card border border-border rounded-lg financial-shadow-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 financial-transition"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Shield" size={20} className="text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Security Settings</h3>
            <p className="text-sm text-muted-foreground">Two-factor authentication, login history, and device management</p>
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
          {/* Two-Factor Authentication */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center space-x-2">
                {is2FAEnabled && (
                  <span className="flex items-center text-sm text-success">
                    <Icon name="CheckCircle" size={16} className="mr-1" />
                    Enabled
                  </span>
                )}
                <Button
                  variant={is2FAEnabled ? "destructive" : "default"}
                  size="sm"
                  onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                  loading={isEnabling2FA}
                >
                  {is2FAEnabled ? 'Disable' : 'Enable'} 2FA
                </Button>
              </div>
            </div>

            {showQRCode && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white border-2 border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="QrCode" size={64} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">QR Code for 2FA Setup</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
                
                <div className="max-w-md mx-auto">
                  <Input
                    label="Verification Code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e?.target?.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <Button
                    variant="default"
                    onClick={handleVerify2FA}
                    disabled={verificationCode?.length !== 6}
                    className="w-full mt-3"
                  >
                    Verify and Enable 2FA
                  </Button>
                </div>

                {backupCodes?.length > 0 && (
                  <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2 flex items-center">
                      <Icon name="AlertTriangle" size={16} className="mr-2 text-warning" />
                      Backup Codes
                    </h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes?.map((code, index) => (
                        <div key={index} className="bg-background p-2 rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Login History */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Recent Login Activity</h4>
            <div className="space-y-3">
              {loginHistory?.map((login) => (
                <div key={login?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      login?.status === 'success' ? 'bg-success' : 'bg-error'
                    }`}></div>
                    <div>
                      <p className="font-medium text-foreground flex items-center">
                        {login?.device}
                        {login?.current && (
                          <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {login?.location} • {formatTimestamp(login?.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Icon 
                    name={login?.status === 'success' ? 'CheckCircle' : 'XCircle'} 
                    size={16} 
                    className={login?.status === 'success' ? 'text-success' : 'text-error'} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Active Devices */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Active Devices</h4>
            <div className="space-y-3">
              {activeDevices?.map((device) => (
                <div key={device?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name="Monitor" size={20} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground flex items-center">
                        {device?.name}
                        {device?.current && (
                          <span className="ml-2 px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                            This Device
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {device?.location} • Last active: {formatTimestamp(device?.lastActive)}
                      </p>
                    </div>
                  </div>
                  {!device?.current && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeDevice(device?.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Certifications */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Security Certifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-success/10 rounded-lg">
                <Icon name="Shield" size={20} className="text-success" />
                <div>
                  <p className="font-medium text-success">SSL Encrypted</p>
                  <p className="text-xs text-success/80">256-bit encryption</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-success/10 rounded-lg">
                <Icon name="Lock" size={20} className="text-success" />
                <div>
                  <p className="font-medium text-success">SOC 2 Compliant</p>
                  <p className="text-xs text-success/80">Data protection</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-success/10 rounded-lg">
                <Icon name="CheckCircle" size={20} className="text-success" />
                <div>
                  <p className="font-medium text-success">GDPR Ready</p>
                  <p className="text-xs text-success/80">Privacy compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;