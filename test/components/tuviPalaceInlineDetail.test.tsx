import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TuViPalaceInlineDetail } from '@/components/TuVi/TuViPalaceInlineDetail';
import type { PalaceInterpretationResult } from '@/services/tuvi/palaceInterpretation';

const mockInterpretation: PalaceInterpretationResult = {
  palaceId: 2,
  palaceName: 'Mệnh',
  palaceBranch: 'Thìn',
  isMenh: true,
  isThan: false,
  coreThemeVi: 'Bản Mệnh & Cốt Cách',
  majorStarsAnalysisVi: 'Hội tụ Tử Vi, Thiên Phủ cai quản tài khố và đế tinh.',
  tuHoaAnalysisVi: ['Hóa Khoa trợ lực danh tiếng', 'Hóa Lộc hanh thông tài chính'],
  auxiliaryAndMaleficVi: 'Tả Phù Hữu Bật nâng đỡ.',
  tuanTrietAnalysisVi: 'Triệt Không kìm hãm giai đoạn tiền vận.',
  tamPhuongTuChinhVi: 'Tam hợp Thân Tý Thìn hội tụ Tài Bạch, Quan Lộc.',
  actionableGuidanceVi: 'Kiên trì phát triển chiều sâu chuyên môn sau tuổi 30.',
};

describe('TuViPalaceInlineDetail (Hybrid Adaptive Display)', () => {
  it('renders inline static card when not zoomed', () => {
    render(<TuViPalaceInlineDetail interpretation={mockInterpretation} onClose={() => {}} isZoomed={false} />);

    expect(screen.getByText(/Luận Giải Chi Tiết Cung Mệnh \(Thìn\)/i)).toBeDefined();
    expect(screen.getByText(/Hội tụ Tử Vi, Thiên Phủ/i)).toBeDefined();
    expect(screen.getByText(/Bản Mệnh & Cốt Cách/i)).toBeDefined();
  });

  it('renders compact pill HUD when zoomed', () => {
    render(<TuViPalaceInlineDetail interpretation={mockInterpretation} onClose={() => {}} isZoomed={true} />);

    expect(screen.getByText(/Cung Mệnh \(Thìn\)/i)).toBeDefined();
    expect(screen.getByText(/Chi tiết/i)).toBeDefined();
  });
});
