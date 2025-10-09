import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/admin';
import categoryService from '../../services/category';
import { Button, Input, LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react';

const CategoryTreeItem = ({ category, level = 0, onEdit, onDelete, onToggle, expandedCategories }) => {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const isExpanded = expandedCategories.includes(category._id);
  
  return (
    <div>
      <div className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded ${level > 0 ? 'ml-6' : ''}`}>
        {hasSubcategories ? (
          <button
            onClick={() => onToggle(category._id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className="flex items-center gap-2">
          {hasSubcategories ? (
            isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <div className="w-4 h-4" />
          )}
          <span className="font-medium">{category.name}</span>
          <span className="text-xs text-gray-500">({category.slug})</span>
          {!category.isActive && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Inactive</span>
          )}
        </div>
        
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {hasSubcategories && isExpanded && (
        <div>
          {category.subcategories.map(subcategory => (
            <CategoryTreeItem
              key={subcategory._id}
              category={subcategory}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              expandedCategories={expandedCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategory: '',
    isActive: true,
    order: 0
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories();
      return response?.data || response || [];
    }
  });

  const categories = data?.categories || data || [];

  // Build tree structure
  const categoryTree = useMemo(() => {
    const categoryMap = {};
    const rootCategories = [];

    // Create map of all categories
    categories.forEach(cat => {
      categoryMap[cat._id] = { 
        ...cat, 
        subcategories: cat.subcategories || [] 
      };
    });

    // Build tree structure - use populated subcategories if available
    categories.forEach(cat => {
      if (cat.parentCategory) {
        const parent = categoryMap[cat.parentCategory];
        if (parent) {
          parent.subcategories.push(categoryMap[cat._id]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return rootCategories;
  }, [categories]);

  // Filter categories based on search
  const filteredTree = useMemo(() => {
    if (!search) return categoryTree;

    const filterRecursive = (cats) => {
      return (cats || []).map(cat => {
        const matchesSearch = (cat.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (cat.slug || '').toLowerCase().includes(search.toLowerCase());
        const children = filterRecursive(cat.subcategories || []);
        if (matchesSearch || children.length > 0) {
          return { ...cat, subcategories: children };
        }
        return null;
      }).filter(Boolean);
    };

    return filterRecursive(categoryTree);
  }, [categoryTree, search]);

  const createCategory = useMutation({
    mutationFn: async (data) => adminService.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create category');
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }) => adminService.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update category');
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id) => adminService.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete category');
    }
  });

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      parentCategory: '',
      isActive: true,
      order: 0
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      isActive: category.isActive,
      order: category.order || 0
    });
    setShowModal(true);
  };

  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all subcategories.`)) {
      deleteCategory.mutate(category._id);
    }
  };

  const handleToggle = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...form,
      parentCategory: form.parentCategory === '' ? null : form.parentCategory
    };

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory._id, data: submitData });
    } else {
      createCategory.mutate(submitData);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name)
    }));
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Categories</h1>
          <p className='text-gray-600'>Manage product categories and subcategories</p>
        </div>
        <div className='flex items-center gap-2'>
          <Input 
            placeholder='Search categories...' 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className='w-64'
          />
          <Button onClick={() => setShowModal(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Category
          </Button>
        </div>
      </div>

      <div className='card p-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className='text-red-600'>Failed to load categories</div>
        ) : filteredTree.length === 0 ? (
          <div className='text-gray-600'>No categories found</div>
        ) : (
          <div className='space-y-1'>
            {filteredTree.map(category => (
              <CategoryTreeItem
                key={category._id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                expandedCategories={expandedCategories}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
          <div className='card p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                <Input
                  placeholder='Category name'
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Slug</label>
                <Input
                  placeholder='Slug'
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                <textarea
                  className='input-base'
                  placeholder='Description'
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Parent Category</label>
                <select
                  className='input-base'
                  value={form.parentCategory}
                  onChange={(e) => setForm(prev => ({ ...prev, parentCategory: e.target.value }))}
                >
                  <option value=''>Root Category</option>
                  {categories
                    .filter(cat => !cat.parentCategory && cat._id !== editingCategory?._id)
                    .map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Order</label>
                <Input
                  type='number'
                  placeholder='Order'
                  value={form.order}
                  onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='isActive'
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className='rounded'
                  />
                  <label htmlFor='isActive' className='text-sm text-gray-700'>Active</label>
                </div>
              </div>
              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type='submit'>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
