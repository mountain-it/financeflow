import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';


const ReportSelector = ({ selectedReport, onReportChange, onCustomReportClick }) => {
  const reportOptions = [
    { value: 'monthly-summary', label: 'Monthly Summary', description: 'Complete overview of monthly finances' },
    { value: 'spending-analysis', label: 'Spending Analysis', description: 'Detailed breakdown of expenses by category' },
    { value: 'budget-performance', label: 'Budget Performance', description: 'Budget vs actual spending comparison' },
    { value: 'goal-progress', label: 'Goal Progress', description: 'Financial goals tracking and achievements' },
    { value: 'income-trends', label: 'Income Trends', description: 'Income patterns and growth analysis' },
    { value: 'tax-summary', label: 'Tax Summary', description: 'Tax-related transactions and deductions' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground mb-2">Financial Reports</h2>
          <Select
            label="Select Report Type"
            placeholder="Choose a report template"
            options={reportOptions}
            value={selectedReport}
            onChange={onReportChange}
            searchable
            className="max-w-md"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCustomReportClick}
            iconName="Settings"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Custom Report
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportSelector;