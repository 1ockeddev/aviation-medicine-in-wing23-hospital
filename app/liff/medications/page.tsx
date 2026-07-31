'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiffAuth } from '@/hooks/useLiffAuth';
import { 
  PillIcon, 
  ArrowLeftIcon, 
  AlertIcon,
  CheckIcon,
  XIcon,
  FolderIcon,
  CalendarIcon
} from '@/components/icons/LiffIcons';
import LoadingScreen, { LoadingSpinner } from '@/components/liff/LoadingScreen';
import { createMedication, updateMedication, deleteMedication } from '@/actions/medications';

interface Medication {
  id: string;
  name: string;
  tradeName: string | null;
  expirationDate: Date | null;
  status: string;
  dose: string | null;
  doseDetails: string | null;
  halfLife: string | null;
  sideEffects: string | null;
  notes: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    number: string;
  };
}

interface Category {
  id: string;
  name: string;
  number: string;
}

interface MedicationFormData {
  name: string;
  tradeName: string;
  expirationDate: string;
  status: string;
  dose: string;
  doseDetails: string;
  halfLife: string;
  sideEffects: string;
  notes: string;
  categoryId: string;
}

export default function LiffMedicationsPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, liff } = useLiffAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    tradeName: '',
    expirationDate: '',
    status: 'active',
    dose: '',
    doseDetails: '',
    halfLife: '',
    sideEffects: '',
    notes: '',
    categoryId: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchMedications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading]);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications');
      const data = await response.json();
      if (data.success) {
        setMedications(data.medications);
        setCategories(data.categories);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching medications', err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      tradeName: '',
      expirationDate: '',
      status: 'active',
      dose: '',
      doseDetails: '',
      halfLife: '',
      sideEffects: '',
      notes: '',
      categoryId: '',
    });
    setCurrentMedication(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (medication: Medication) => {
    setModalMode('edit');
    setFormData({
      name: medication.name,
      tradeName: medication.tradeName || '',
      expirationDate: medication.expirationDate 
        ? new Date(medication.expirationDate).toISOString().split('T')[0]
        : '',
      status: medication.status,
      dose: medication.dose || '',
      doseDetails: medication.doseDetails || '',
      halfLife: medication.halfLife || '',
      sideEffects: medication.sideEffects || '',
      notes: medication.notes || '',
      categoryId: medication.categoryId,
    });
    setCurrentMedication(medication);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      tradeName: '',
      expirationDate: '',
      status: 'active',
      dose: '',
      doseDetails: '',
      halfLife: '',
      sideEffects: '',
      notes: '',
      categoryId: '',
    });
    setCurrentMedication(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      // Get LIFF access token
      const accessToken = liff.getAccessToken();
      console.log('[LIFF Client] Access token check:', {
        hasToken: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null,
        liffInitialized: liff.isInClient(),
        isLoggedIn: liff.isLoggedIn()
      });
      
      if (!accessToken) {
        console.error('[LIFF Client] No access token available');
        setFormError('ไม่สามารถยืนยันตัวตนได้');
        setIsSubmitting(false);
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      if (formData.tradeName) formDataObj.append('tradeName', formData.tradeName);
      if (formData.expirationDate) formDataObj.append('expirationDate', formData.expirationDate);
      formDataObj.append('status', formData.status);
      if (formData.dose) formDataObj.append('dose', formData.dose);
      if (formData.doseDetails) formDataObj.append('doseDetails', formData.doseDetails);
      if (formData.halfLife) formDataObj.append('halfLife', formData.halfLife);
      if (formData.sideEffects) formDataObj.append('sideEffects', formData.sideEffects);
      if (formData.notes) formDataObj.append('notes', formData.notes);
      formDataObj.append('categoryId', formData.categoryId);
      // Add LIFF access token for authentication
      formDataObj.append('_liffAccessToken', accessToken);
      
      console.log('[LIFF Client] Calling server action:', modalMode);

      const result = modalMode === 'create'
        ? await createMedication(null, formDataObj)
        : await updateMedication(currentMedication!.id, null, formDataObj);

      console.log('[LIFF Client] Server action result:', result);

      if (result.success) {
        showToast(
          modalMode === 'create' ? 'เพิ่มยาสำเร็จ' : 'แก้ไขยาสำเร็จ',
          'success'
        );
        closeModal();
        await fetchMedications();
      } else {
        console.error('[LIFF Client] Server action error:', result.error);
        setFormError(typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('[LIFF Client] Exception in handleSubmit:', err);
      setFormError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (medication: Medication) => {
    if (!confirm(`ต้องการลบยา "${medication.name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      // Get LIFF access token
      const accessToken = liff.getAccessToken();
      console.log('[LIFF Client] Delete - Access token check:', {
        hasToken: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null
      });
      
      if (!accessToken) {
        console.error('[LIFF Client] Delete - No access token available');
        showToast('ไม่สามารถยืนยันตัวตนได้', 'error');
        return;
      }

      console.log('[LIFF Client] Calling deleteMedication...');
      const result = await deleteMedication(medication.id, accessToken);
      console.log('[LIFF Client] Delete result:', result);
      
      if (result.success) {
        showToast('ลบยาสำเร็จ', 'success');
        await fetchMedications();
      } else {
        console.error('[LIFF Client] Delete error:', result.error);
        showToast(typeof result.error === 'string' ? result.error : 'ไม่สามารถลบยาได้', 'error');
      }
    } catch (err) {
      console.error('[LIFF Client] Exception in handleDelete:', err);
      showToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  const filterMedications = () => {
    let filtered = medications;

    if (searchQuery) {
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.tradeName && med.tradeName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(med => med.categoryId === filterCategory);
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'discontinued': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ใช้งาน';
      case 'expired': return 'หมดอายุ';
      case 'discontinued': return 'ยกเลิก';
      default: return status;
    }
  };

  if (isAuthLoading || isLoading) {
    return <LoadingScreen message="กำลังโหลดข้อมูล..." />;
  }

  const filteredMedications = filterMedications();

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
                <PillIcon size={24} className="text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">
                  จัดการยา
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {medications.length} รายการ
              </p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="ค้นหายา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />

          {/* Filter by Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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

      {/* Medications List */}
      <div className="p-4 space-y-3">
        {filteredMedications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-3">
              <PillIcon size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-600">
              {searchQuery || filterCategory ? 'ไม่พบยาที่ค้นหา' : 'ยังไม่มียาในระบบ'}
            </p>
          </div>
        ) : (
          filteredMedications.map(medication => (
            <div key={medication.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-lg">{medication.name}</h3>
                  {medication.tradeName && (
                    <p className="text-sm text-gray-600 mt-1">{medication.tradeName}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getStatusColor(medication.status)}`}>
                  {getStatusText(medication.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <FolderIcon size={16} className="flex-shrink-0" />
                  <span className="truncate">{medication.category.name}</span>
                </div>
                {medication.expirationDate && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="flex-shrink-0" />
                    <span>หมดอายุ: {new Date(medication.expirationDate).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {medication.dose && (
                  <div className="text-xs text-gray-500">
                    ขนาดยา: {medication.dose}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(medication)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition font-medium"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(medication)}
                  className="flex-1 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition font-medium"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={openCreateModal}
          className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:bg-blue-700 transition flex items-center justify-center"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {modalMode === 'create' ? 'เพิ่มยา' : 'แก้ไขยา'}
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
                  ชื่อยา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อการค้า
                </label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันหมดอายุ
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="active">ใช้งาน</option>
                  <option value="expired">หมดอายุ</option>
                  <option value="discontinued">ยกเลิก</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ขนาดยา
                </label>
                <input
                  type="text"
                  value={formData.dose}
                  onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น 500mg"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดการใช้
                </label>
                <textarea
                  value={formData.doseDetails}
                  onChange={(e) => setFormData({ ...formData, doseDetails: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ครึ่งชีวิต
                </label>
                <input
                  type="text"
                  value={formData.halfLife}
                  onChange={(e) => setFormData({ ...formData, halfLife: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ผลข้างเคียง
                </label>
                <textarea
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isSubmitting}
                />
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
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
