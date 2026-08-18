import React, { useState, useEffect } from 'react';
import { useDamGioStore } from '@/stores/damGioStore';
import { CreateDamGioDto } from '@lich-viet/contracts';
import { Plus, Trash2, Calendar, X, Heart } from 'lucide-react';

interface DamGioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLunarDay?: number;
  currentLunarMonth?: number;
}

export const DamGioModal: React.FC<DamGioModalProps> = ({ isOpen, onClose, currentLunarDay, currentLunarMonth }) => {
  const { records, isLoading, fetchDamGio, createDamGio, deleteDamGio } = useDamGioStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<CreateDamGioDto>({
    deceasedName: '',
    relationship: '',
    lunarDay: currentLunarDay || 1,
    lunarMonth: currentLunarMonth || 1,
    isLeapMonth: false,
    notes: '',
    alarmLeadDays: [1, 3],
  });

  useEffect(() => {
    if (isOpen) {
      fetchDamGio();
    }
  }, [isOpen, fetchDamGio]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deceasedName.trim() || !formData.relationship.trim()) return;

    await createDamGio(formData);
    setFormData({
      deceasedName: '',
      relationship: '',
      lunarDay: currentLunarDay || 1,
      lunarMonth: currentLunarMonth || 1,
      isLeapMonth: false,
      notes: '',
      alarmLeadDays: [1, 3],
    });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                Sổ Đám Giỗ & Tưởng Nhớ
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Quản lý và nhắc nhở ngày giỗ gia tiên theo Âm Lịch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Action button */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Ngày Giỗ Mới
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
              <h4 className="font-medium text-sm text-text-primary-light dark:text-text-primary-dark">
                Thêm Ngày Giỗ Gia Tiên
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    Tên người đã khuất *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cụ Nguyễn Văn A"
                    value={formData.deceasedName}
                    onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 text-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    Mối quan hệ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Ông Nội, Cụ Cố"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 text-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    Ngày Âm Lịch (1-30)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.lunarDay}
                    onChange={(e) => setFormData({ ...formData, lunarDay: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-1.5 text-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    Tháng Âm Lịch (1-12)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.lunarMonth}
                    onChange={(e) => setFormData({ ...formData, lunarMonth: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-1.5 text-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Ghi chú lễ cúng / Tập tục gia đình
                </label>
                <input
                  type="text"
                  placeholder="VD: Cúng mâm cơm chay, thắp hương vào giờ Thìn"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 text-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Lưu Ngày Giỗ
                </button>
              </div>
            </form>
          )}

          {/* List of records */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Đang tải danh sách ngày giỗ...
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Chưa có ngày giỗ nào được ghi nhận.
              </div>
            ) : (
              records.map((r) => {
                const isTodayMatch = currentLunarDay === r.lunarDay && currentLunarMonth === r.lunarMonth;

                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isTodayMatch
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text-primary-light dark:text-text-primary-dark">
                          {r.deceasedName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {r.relationship}
                        </span>
                        {isTodayMatch && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-medium">
                            Hôm nay
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Ngày {r.lunarDay}/{r.lunarMonth} Âm lịch
                        </span>
                        {r.notes && <span className="italic truncate max-w-[200px]">{r.notes}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteDamGio(r.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Xóa ngày giỗ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <span>{records.length} ngày giỗ được lưu</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
