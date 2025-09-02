import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'DollarSign'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableIcons = [
    'DollarSign', 'Utensils', 'Car', 'ShoppingBag', 'Film', 'Heart',
    'Home', 'Zap', 'BookOpen', 'Plane', 'Coffee', 'Gamepad2',
    'Music', 'Shirt', 'Fuel', 'Phone', 'Wifi', 'Gift'
  ];

  const availableColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Please enter a category name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: category, error: insertError } = await supabase
        .from('expense_categories')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onCategoryAdded(category);
      setFormData({ name: '', description: '', color: '#3B82F6', icon: 'DollarSign' });
      onClose();
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center">
      <div className="bg-card w-full lg:w-96 lg:rounded-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Category</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name"
              type="text"
              placeholder="e.g., Groceries, Gas, Entertainment"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <Input
              label="Description (Optional)"
              type="text"
              placeholder="Brief description of this category"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      formData.icon === iconName
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('icon', iconName)}
                  >
                    <Icon name={iconName} size={20} className="mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-foreground scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('color', color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;