import React from 'react';
import type { TuViHanContext, TuViPalace } from '../../types/tuvi';
import { getStarColor, getStarBrightnessMarker } from '../../services/tuvi/starGrouping';
import { BRIGHTNESS_MARKERS } from '../../services/tuvi/constants';
import { getKhongLabel } from './tuviChartLayout';

interface TuViPalaceCellProps {
  palace: TuViPalace;
  hanContext?: TuViHanContext;
  isSelected: boolean;
  isTrine?: boolean;
  isOpposite?: boolean;
  onSelect: () => void;
}

const TU_HOA_CLASS_MAP: Record<string, string> = {
  Lộc: 'loc',
  Quyền: 'quyen',
  Khoa: 'khoa',
  Kỵ: 'ky',
};

const TU_HOA_LABEL_MAP: Record<string, string> = {
  Lộc: 'Hóa Lộc',
  Quyền: 'Hóa Quyền',
  Khoa: 'Hóa Khoa',
  Kỵ: 'Hóa Kỵ',
};

export const TuViPalaceCell: React.FC<TuViPalaceCellProps> = ({
  palace,
  hanContext,
  isSelected,
  isTrine = false,
  isOpposite = false,
  onSelect,
}) => {
  const nguyetHanMonth = hanContext?.nguyetHanMonthByPalace[palace.id];
  const isNguyetHanPalace = hanContext?.nguyetHanPalaceIndex === palace.id;
  const classes = [
    'tuvi-palace',
    palace.isMenh ? 'menh' : '',
    palace.isThan ? 'than' : '',
    isSelected ? 'selected' : '',
    isTrine ? 'trine' : '',
    isOpposite ? 'opposite' : '',
    isNguyetHanPalace ? 'nguyet-han-active' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const visiblePhuTinh = palace.phuTinh;
  const visibleSatTinh = palace.satTinh;
  const daiHanMeta = hanContext
    ? {
        startAge: palace.daiHanAgeRange.split('–')[0] ?? '',
      }
    : null;
  const renderStar = (star: (typeof palace.chinhTinh)[number], className = '') => {
    const color = getStarColor(star);
    const marker = getStarBrightnessMarker(star);
    return (
      <span key={star.name} className={className} style={{ color }} title={`${star.name} ${star.nguHanh} • ${star.brightness}`}>
        {star.name}
        {marker && <small>{marker}</small>}
      </span>
    );
  };
  const renderTuHoa = (tuHoa: TuViPalace['tuHoa'][number]) => {
    const brightness = palace.brightness[tuHoa.starName];
    const marker = brightness ? (BRIGHTNESS_MARKERS[brightness] ?? '') : '';

    return (
      <span
        key={tuHoa.type}
        className={`tuvi-tu-hoa ${TU_HOA_CLASS_MAP[tuHoa.type] ?? ''}`}
        title={`${tuHoa.starName} Hóa ${tuHoa.type}`}
      >
        {TU_HOA_LABEL_MAP[tuHoa.type] ?? tuHoa.type}
        {marker && <small>{marker}</small>}
      </span>
    );
  };
  const khongLabel = getKhongLabel(palace);
  return (
    <div
      className={classes}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Cung ${palace.name}`}
    >
      <div className="tuvi-palace-header">
        <span className="tuvi-can-chi">{palace.canChi}</span>
        <div className="tuvi-palace-title">
          <span>{palace.name}</span>
          {palace.isThan && <em>THÂN</em>}
        </div>
        <span className="tuvi-dai-han-number">
          <strong>{daiHanMeta?.startAge ?? palace.daiHanAgeRange.split('–')[0] ?? ''}</strong>
        </span>
      </div>

      <div className="tuvi-chinh-tinh">
        {palace.chinhTinh.length > 0 ? (
          <>
            {palace.chinhTinh.map((star) => renderStar(star))}
            {palace.chinhTinh.length === 1 && <span className="tuvi-major-placeholder">&nbsp;</span>}
          </>
        ) : (
          <span className="tuvi-empty-star">Vô chính diệu</span>
        )}
      </div>

      {khongLabel && (
        <div className="tuvi-khong-banner" aria-hidden="true">
          <span className="tuvi-khong-badge">{khongLabel}</span>
        </div>
      )}

      <div className="tuvi-phu-tinh-grid">
        <div>
          {visiblePhuTinh.map((star) => renderStar(star))}
          {palace.tuHoa.map((tuHoa) => renderTuHoa(tuHoa))}
        </div>
        <div>{visibleSatTinh.map((star) => renderStar(star, 'sat'))}</div>
      </div>

      <div className="tuvi-palace-footer">
        <div className="tuvi-footer-primary">
          <span className="tuvi-branch-label">{palace.chi}</span>
          {palace.rings?.truongSinh && <span className="tuvi-truong-sinh-label">{palace.rings.truongSinh}</span>}
          {nguyetHanMonth ? (
            <span className={isNguyetHanPalace ? 'tuvi-nguyet-han active' : 'tuvi-nguyet-han'}>
              Tháng {nguyetHanMonth}
            </span>
          ) : (
            <span>Đại hạn {palace.daiHanAgeRange}</span>
          )}
        </div>
      </div>
    </div>
  );
};
