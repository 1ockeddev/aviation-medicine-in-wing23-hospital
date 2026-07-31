'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { 
  FolderIcon, 
  ArrowLeftIcon, 
  AlertIcon,
  CheckIcon,
  XIcon,
  PillIcon
} from '@/components/icons/LiffIcons';
import LoadingScreen, { LoadingSpinner } from '@/components/liff/LoadingScreen';
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories';

interface Category {
  id: string;
  name: string;
  number: string;
  parentId: string | null;
  order: number;
  _count: {
    medications: number;
  };
  children?: Category[];
}

interface CategoryFormData {
  name: string;
  parentId: string | null;
}

export default function LiffCategoriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', parentId: null });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    initializeLiff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeLiff = async () => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) throw new Error('LIFF ID not configured');
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) {
        router.push('/liff');
        return;
      }
      await fetchCategories();
      setIsLoading(false);
    } catch (err) {
      console.error('LIFF error', err);
      router.push('/liff');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        setParentCategories(data.parentCategories);
      }
    } catch (err) {
      console.error('Error fetching categories', err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openCreateModal = (parentId: string | null = null) => {
    setModalMode('create');
    setFormData({ name: '', parentId });
    setCurrentCategory(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setFormData({ name: category.name, parentId: category.parentId });
    setCurrentCategory(category);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', parentId: null });
    setCurrentCategory(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      if (formData.parentId) {
        formDataObj.append('parentId', formData.parentId);
      }

      const result = modalMode === 'create'
        ? await createCategory(null, formDataObj)
        : await updateCategory(currentCategory!.id, null, formDataObj);

      if (result.success) {
        showToast(
          modalMode === 'create' ? 'เพิ่มหมวดหมู่สำเร็จ' : 'แก้ไขหมวดหมู่สำเร็จ',
          'success'
        );
        closeModal();
        await fetchCategories();
      } else {
        setFormError(typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setFormError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`ต้องการลบหมวดหมู่ "${category.name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const result = await deleteCategory(category.id);
      if (result.success) {
        showToast('ลบหมวดหมู่สำเร็จ', 'success');
        await fetchCategories();
      } else {
        showToast(typeof result.error === 'string' ? result.error : 'ไม่สามารถลบหมวดหมู่ได้', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  const filterCategories = (cats: Category[]): Category[] => {
    if (!searchQuery) return cats;
    
    return cats.filter(cat => {
      const matchesName = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChildren = cat.children && filterCategories(cat.children).length > 0;
      return matchesName || matchesChildren;
    }).map(cat => ({
      ...cat,
      children: cat.children ? filterCategories(cat.children) : []
    }));
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const indent = level * 16;

    return (
      <div key={category.id} className="border-b border-gray-100 last:border-b-0">
        <div 
          className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 active:bg-gray-100 transition"
          style={{ paddingLeft: `${indent + 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(category.id)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500"
            >
              <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 truncate">
              {category.number}. {category.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <PillIcon size={12} />
                {category._count.medications} ยา
              </span>
              {hasChildren && (
                <span>
                  {category.children!.length} หมวดหมู่ย่อย
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => openEditModal(category)}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition"
            >
              แก้ไข
            </button>
            <button
              onClick={() => handleDelete(category)}
              className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition"
            >
              ลบ
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingScreen message="กำลังโหลดข้อมูล..." />;
  }

  const filteredCategories = filterCategories(categories);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/liff/menu')}
              className="text-gray-600 hover:text-gray-800 active:text-gray-900"
            >
              <ArrowLeftIcon size={24} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FolderIcon size={24} className="text-green-600" />
                <h1 className="text-xl font-bold text-gray-800">
                  จัดการหมวดหมู่
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {categories.length} หมวดหมู่
              </p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? <CheckIcon size={20} /> : <XIcon size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Categories List */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FolderIcon size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                {searchQuery ? 'ไม่พบหมวดหมู่ที่ค้นหา' : 'ยังไม่มีหมวดหมู่'}
              </p>
            </div>
          ) : (
            filteredCategories.map(category => renderCategory(category))
          )}
        </div>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => openCreateModal()}
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 active:bg-green-700 transition flex items-center justify-center"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {modalMode === 'create' ? 'เพิ่มหมวดหมู่' : 'แก้ไขหมวดหมู่'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-700 text-sm">
                  <AlertIcon size={20} className="flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ระบุชื่อหมวดหมู่"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่หลัก
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isSubmitting}
                >
                  <option value="">-- ไม่มี (หมวดหมู่หลัก) --</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.number}. {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition font-medium"
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <LoadingSpinner size={16} />}
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
