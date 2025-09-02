import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ScheduledReports = ({ scheduledReports, onAddSchedule, onEditSchedule, onDeleteSchedule }) => {
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    reportType: '',
    frequency: 'monthly',
    email: '',
    enabled: true
  });

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const reportTypeOptions = [
    { value: 'monthly-summary', label: 'Monthly Summary' },
    { value: 'spending-analysis', label: 'Spending Analysis' },
    { value: 'budget-performance', label: 'Budget Performance' },
    { value: 'goal-progress', label: 'Goal Progress' }
  ];

  const handleAddSchedule = () => {
    if (newSchedule?.name && newSchedule?.reportType && newSchedule?.email) {
      onAddSchedule({
        ...newSchedule,
        id: Date.now(),
        nextRun: getNextRunDate(newSchedule?.frequency),
        lastRun: null
      });
      setNewSchedule({
        name: '',
        reportType: '',
        frequency: 'monthly',
        email: '',
        enabled: true
      });
      setIsAddingSchedule(false);
    }
  };

  const getNextRunDate = (frequency) => {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, 1);
      case 'yearly':
        return new Date(now.getFullYear() + 1, 0, 1);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  };

  const getStatusColor = (enabled) => {
    return enabled ? 'text-success' : 'text-muted-foreground';
  };

  const getStatusIcon = (enabled) => {
    return enabled ? 'CheckCircle' : 'Pause';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Scheduled Reports</h3>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsAddingSchedule(true)}
          iconName="Plus"
          iconPosition="left"
        >
          Add Schedule
        </Button>
      </div>
      {/* Add Schedule Form */}
      {isAddingSchedule && (
        <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">New Scheduled Report</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingSchedule(false)}
              iconName="X"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Schedule Name"
              placeholder="Enter schedule name"
              value={newSchedule?.name}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e?.target?.value }))}
            />
            
            <Select
              label="Report Type"
              options={reportTypeOptions}
              value={newSchedule?.reportType}
              onChange={(value) => setNewSchedule(prev => ({ ...prev, reportType: value }))}
            />
            
            <Select
              label="Frequency"
              options={frequencyOptions}
              value={newSchedule?.frequency}
              onChange={(value) => setNewSchedule(prev => ({ ...prev, frequency: value }))}
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              value={newSchedule?.email}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, email: e?.target?.value }))}
            />
          </div>
          
          <Checkbox
            label="Enable Schedule"
            checked={newSchedule?.enabled}
            onChange={(e) => setNewSchedule(prev => ({ ...prev, enabled: e?.target?.checked }))}
          />
          
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleAddSchedule}
              disabled={!newSchedule?.name || !newSchedule?.reportType || !newSchedule?.email}
            >
              Add Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingSchedule(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {/* Scheduled Reports List */}
      <div className="space-y-3">
        {scheduledReports?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No scheduled reports yet</p>
            <p className="text-sm text-muted-foreground">Create your first scheduled report to get automated insights</p>
          </div>
        ) : (
          scheduledReports?.map((schedule) => (
            <div
              key={schedule?.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 financial-transition"
            >
              <div className="flex items-center space-x-3 flex-1">
                <Icon 
                  name={getStatusIcon(schedule?.enabled)} 
                  size={20} 
                  className={getStatusColor(schedule?.enabled)}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{schedule?.name}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground">
                    <span>{reportTypeOptions?.find(opt => opt?.value === schedule?.reportType)?.label}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Every {schedule?.frequency}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{schedule?.email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Next run: {schedule?.nextRun?.toLocaleDateString()}
                    {schedule?.lastRun && (
                      <span className="ml-4">Last run: {schedule?.lastRun?.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSchedule(schedule?.id)}
                  iconName="Edit"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSchedule(schedule?.id)}
                  iconName="Trash2"
                  className="text-destructive hover:text-destructive"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledReports;