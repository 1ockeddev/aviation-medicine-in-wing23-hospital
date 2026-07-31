'use client';

import { useRouter } from 'next/navigation';
import { useLiffAuth } from '@/hooks/useLiffAuth';
import { 
  PillIcon, 
  FolderIcon, 
  UsersIcon, 
  SettingsIcon
} from '@/components/icons/LiffIcons';
import LoadingScreen from '@/components/liff/LoadingScreen';

/**
 * LIFF Menu Page
 * 
 * Main menu for admin functions via LINE LIFF
 */
export default function LiffMenuPage() {
  const router = useRouter();
  const { isLoading, userProfile, liff } = useLiffAuth();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return <LoadingScreen message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          {userProfile?.pictureUrl && (
            <img 
              src={userProfile.pictureUrl} 
              alt={userProfile.displayName}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {userProfile?.displayName}
            </h1>
            <p className="text-sm text-gray-600">
              ระบบจัดการยา
            </p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
        {/* Medications */}
        {/* <MenuCard
          icon={<PillIcon size={32} className="text-white" />}
          title="จัดการยา"
          description="เพิ่ม แก้ไข ลบ รายการยา"
          onClick={() => navigateTo('/liff/medications')}
          color="from-blue-400 to-blue-600"
        /> */}

        {/* Categories */}
        {/* <MenuCard
          icon={<FolderIcon size={32} className="text-white" />}
          title="จัดการหมวดหมู่"
          description="จัดการหมวดหมู่ยา"
          onClick={() => navigateTo('/liff/categories')}
          color="from-green-400 to-green-600"
        /> */}

        {/* LINE Users */}
        {/* <MenuCard
          icon={<UsersIcon size={32} className="text-white" />}
          title="การตั้งค่า"
          description="การแจ้งเตือนยาหมดอายุ"
          onClick={() => navigateTo('/liff/line-users')}
          color="from-purple-400 to-purple-600"
        /> */}

        {/* Admin Panel (Web) */}
        {/* <MenuCard
          icon={<SettingsIcon size={32} className="text-white" />}
          title="Admin Panel"
          description="เข้าสู่หน้า Admin แบบเต็ม"
          onClick={() => {
            // Open in external browser
            if (liff.isInClient()) {
              liff.openWindow({
                url: `${window.location.origin}/admin`,
                external: true,
              });
            } else {
              window.open('/admin', '_blank');
            }
          }}
          color="from-gray-400 to-gray-600"
        />
      </div> */}

      {/* Close Button (if in LINE) */}
      {liff.isInClient() && (
        <div className="mt-6">
          <button
            onClick={() => liff.closeWindow()}
            className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      )}
    </div>
  );
}

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

function MenuCard({ icon, title, description, onClick, color }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
    >
      <div className={`bg-gradient-to-br ${color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
        {icon}
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-2 text-left">
        {title}
      </h2>
      <p className="text-sm text-gray-600 text-left">
        {description}
      </p>
    </button>
  );
}
