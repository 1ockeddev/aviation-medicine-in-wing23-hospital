'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

export default function DatabaseManagementPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);

      const response = await fetch('/api/admin/database/export');
      
      if (!response.ok) {
        throw new Error('Failed to export database');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({
        type: 'success',
        text: 'Database exported successfully! File downloaded.',
      });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to export database',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Confirm before importing
    const confirmed = window.confirm(
      '⚠️ WARNING: Importing will DELETE ALL existing data and replace it with the imported data.\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsImporting(true);
      setMessage(null);
      setImportResult(null);

      // Read file content
      const text = await file.text();
      const importData = JSON.parse(text);

      console.log('Importing data:', {
        metadata: importData.metadata,
        counts: importData.counts,
      });

      // Send to import API
      const response = await fetch('/api/admin/database/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData),
      });

      const result = await response.json();

      console.log('Import API response:', {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok) {
        // Show detailed error from API
        const errorMessage = result.details 
          ? `${result.error}: ${result.details}`
          : result.error || 'Failed to import database';
        
        console.error('Import failed:', {
          status: response.status,
          error: result.error,
          details: result.details,
        });
        
        throw new Error(errorMessage);
      }

      setImportResult(result);
      setMessage({
        type: 'success',
        text: 'Database imported successfully!',
      });

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      
      // Extract more specific error message
      let errorMessage = 'Failed to import database';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        จัดการฐานข้อมูล
      </h1>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Import Summary:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Categories: {importResult.imported.categoriesImported}</li>
            <li>✅ Medications: {importResult.imported.medicationsImported}</li>
            <li>✅ LINE Users: {importResult.imported.lineUsersImported}</li>
          </ul>
          
          {/* Show warnings if categories were reparented */}
          {importResult.imported.categoriesReparented > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>{importResult.imported.categoriesReparented} categories</strong> had missing parent categories and were moved to root level.
              </p>
              {importResult.imported.orphanedCategories && importResult.imported.orphanedCategories.length > 0 && (
                <details className="mt-2 text-xs text-yellow-700">
                  <summary className="cursor-pointer hover:text-yellow-900">
                    View reparented categories ({importResult.imported.orphanedCategories.length})
                  </summary>
                  <ul className="mt-2 space-y-1 ml-4 list-disc">
                    {importResult.imported.orphanedCategories.map((cat: any) => (
                      <li key={cat.id}>
                        {cat.name} <span className="text-yellow-600">(missing parent: {cat.missingParentId.substring(0, 8)}...)</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          
          {importResult.metadata && (
            <p className="text-xs text-blue-600 mt-2">
              Exported by: {importResult.metadata.exportedBy} on {new Date(importResult.metadata.exportedAt).toLocaleString('th-TH')}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📥</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Export Database
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ดาวน์โหลดข้อมูลทั้งหมด (structure + data)
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p>✓ โครงสร้างฐานข้อมูล (schema)</p>
            <p>✓ ข้อมูลทั้งหมด (all tables)</p>
            <p>✓ Format: JSON</p>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? 'กำลัง Export...' : '📥 Export Database'}
          </Button>
        </div>

        {/* Import Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📤</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Import Database
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                นำเข้าข้อมูลจากไฟล์ที่ export ไว้
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium">⚠️ คำเตือน:</p>
              <p className="text-yellow-700 text-xs mt-1">
                การ Import จะ <strong>ลบข้อมูลเดิมทั้งหมด</strong> และแทนที่ด้วยข้อมูลใหม่
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleImportClick}
            disabled={isImporting}
            variant="destructive"
            className="w-full"
          >
            {isImporting ? 'กำลัง Import...' : '📤 Import Database'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📖 วิธีใช้งาน</h3>
        <div className="space-y-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Export Database:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1 ml-4">
              <li>คลิกปุ่ม &quot;Export Database&quot;</li>
              <li>ระบบจะดาวน์โหลดไฟล์ JSON อัตโนมัติ</li>
              <li>เก็บไฟล์ไว้สำหรับ backup หรือย้ายข้อมูล</li>
            </ol>
          </div>
          <div>
            <p className="font-medium">Import Database:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1 ml-4">
              <li>คลิกปุ่ม &quot;Import Database&quot;</li>
              <li>เลือกไฟล์ JSON ที่ export ไว้</li>
              <li>ยืนยันการ import (ข้อมูลเดิมจะถูกลบ)</li>
              <li>รอให้ระบบ import เสร็จ</li>
              <li>หน้าเพจจะ reload อัตโนมัติ</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">🔧 รายละเอียดทางเทคนิค</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Tables ที่จะ export/import:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Categories (หมวดหมู่ยา)</li>
            <li>Medications (ยา)</li>
            <li>LINE Users (ผู้ใช้ LINE)</li>
            <li className="text-gray-400">Users (admin users) - ไม่ถูก import เพื่อความปลอดภัย</li>
          </ul>
          <p className="mt-3"><strong>การจัดการ Foreign Keys:</strong></p>
          <p className="ml-4">ระบบจะลบและสร้างข้อมูลตามลำดับที่ถูกต้องเพื่อรักษา referential integrity</p>
        </div>
      </div>
    </div>
  );
}
