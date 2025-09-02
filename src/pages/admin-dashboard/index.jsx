import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Shield, Settings, TrendingUp, AlertCircle, Search, Filter, Download, RefreshCw, Eye, Edit, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';


const AdminDashboard = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const { theme } = useTheme();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    systemHealth: 'Good'
  });
  
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchActivityLogs(),
        fetchSystemSettings()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: users, error } = await supabase?.from('user_profiles')?.select('role, is_active');

      if (error) throw error;

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u?.is_active)?.length || 0;
      const adminUsers = users?.filter(u => u?.role === 'admin')?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        adminUsers,
        systemHealth: activeUsers > 0 ? 'Good' : 'Warning'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase?.from('admin_activity_logs')?.select(`
          *,
          admin:user_profiles(full_name, email)
        `)?.order('created_at', { ascending: false })?.limit(50);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase?.from('system_settings')?.select('*')?.order('setting_key', { ascending: true });

      if (error) throw error;
      setSystemSettings(data || []);
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase?.from('user_profiles')?.update({ is_active: !currentStatus })?.eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase?.from('admin_activity_logs')?.insert({
          admin_id: user?.id,
          action: !currentStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          target_type: 'user_profile',
          target_id: userId,
          details: { previous_status: currentStatus }
        });

      // Refresh data
      await fetchUsers();
      await fetchStats();
      await fetchActivityLogs();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase?.from('user_profiles')?.update({ role: newRole })?.eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase?.from('admin_activity_logs')?.insert({
          admin_id: user?.id,
          action: 'USER_ROLE_CHANGED',
          target_type: 'user_profile',
          target_id: userId,
          details: { new_role: newRole }
        });

      // Refresh data
      await fetchUsers();
      await fetchStats();
      await fetchActivityLogs();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = filterRole === 'all' || user?.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                System oversight and user management
              </p>
            </div>
            <Button
              onClick={fetchDashboardData}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Admin Users"
            value={stats?.adminUsers}
            icon={Shield}
            color="purple"
          />
          <StatCard
            title="System Health"
            value={stats?.systemHealth}
            icon={TrendingUp}
            color={stats?.systemHealth === 'Good' ? 'green' : 'orange'}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'logs', label: 'Activity Logs', icon: Shield },
                { id: 'settings', label: 'System Settings', icon: Settings }
              ]?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setSelectedView(tab?.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedView === tab?.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {selectedView === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Overview</h3>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="flex items-center justify-center gap-2 py-4">
                    <Download className="h-4 w-4" />
                    Export User Data
                  </Button>
                  <Button className="flex items-center justify-center gap-2 py-4" variant="secondary">
                    <Shield className="h-4 w-4" />
                    Security Audit
                  </Button>
                  <Button className="flex items-center justify-center gap-2 py-4" variant="secondary">
                    <Settings className="h-4 w-4" />
                    System Configuration
                  </Button>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {activityLogs?.slice(0, 5)?.map(log => (
                      <div key={log?.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log?.action?.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {log?.admin?.full_name} • {new Date(log?.created_at)?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {selectedView === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e?.target?.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 h-4 w-4" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e?.target?.value)}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers?.map(user => (
                        <tr key={user?.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.full_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user?.role}
                              onChange={(e) => updateUserRole(user?.id, e?.target?.value)}
                              className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleUserStatus(user?.id, user?.is_active)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user?.is_active
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {user?.is_active ? (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user?.created_at)?.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="secondary">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Logs Tab */}
            {selectedView === 'logs' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Logs</h3>
                
                <div className="space-y-3">
                  {activityLogs?.map(log => (
                    <div key={log?.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log?.action?.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Admin: {log?.admin?.full_name} ({log?.admin?.email})
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log?.created_at)?.toLocaleString()}
                          </p>
                        </div>
                        {log?.details && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <pre>{JSON.stringify(log?.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {selectedView === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h3>
                
                <div className="space-y-4">
                  {systemSettings?.map(setting => (
                    <div key={setting?.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {setting?.setting_key?.replace(/_/g, ' ')?.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {setting?.description}
                          </p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {typeof setting?.setting_value === 'string' ? setting?.setting_value?.replace(/"/g,'') 
                            : JSON.stringify(setting?.setting_value)
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;