import React from 'react';
import type { TuViCenterInfo, TuViHanContext, TuViEngineMeta } from '../../types/tuvi';

interface TuViCenterPanelProps {
  centerInfo: TuViCenterInfo;
  hanContext?: TuViHanContext;
  engineMeta?: TuViEngineMeta;
}

const FieldRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="tuvi-center-row">
    <span className="tuvi-center-label">{label}</span>
    <span className="tuvi-center-values">
      <strong className="tuvi-center-value-primary" title={value}>
        {value}
      </strong>
    </span>
  </div>
);

export const TuViCenterPanel: React.FC<TuViCenterPanelProps> = ({ centerInfo, hanContext, engineMeta }) => {
  const hanLabel =
    hanContext?.daiHanPalaceName && hanContext.daiHanAgeRange
      ? `${hanContext.daiHanPalaceName} · ${hanContext.daiHanAgeRange}`
      : '—';

  const centerRows = [
    { label: 'Trường phái', value: centerInfo.schoolLabel },
    { label: 'Âm dương', value: centerInfo.amDuongLabel },
    { label: 'Mệnh', value: centerInfo.menhNapAm },
    { label: 'Cục', value: centerInfo.cuc },
    { label: 'Chủ cục', value: centerInfo.saoChuCuc || '—' },
    { label: 'Mệnh chủ', value: centerInfo.menhChu },
    { label: 'Thân chủ', value: centerInfo.thanChu },
    { label: 'Lai nhân', value: centerInfo.laiNhanCung || '—' },
    { label: 'Nguyên thần', value: centerInfo.nguyenThan || '—' },
    { label: 'Mệnh cung', value: centerInfo.menhCung },
    { label: 'Thân cung', value: centerInfo.thanCungLabel },
    { label: 'Đại hạn', value: hanLabel },
  ];

  return (
    <div className="tuvi-center">
      <div className="tuvi-center-title">
        <h3>{centerInfo.hoTen || 'Lá số Tử Vi'}</h3>
        <p>{centerInfo.amDuongLabel}</p>
      </div>

      <div className="tuvi-center-body">
        <div className="tuvi-center-column">
          {centerRows.map((field) => (
            <FieldRow key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </div>
      {engineMeta?.warnings?.length ? (
        <div className="tuvi-center-warnings">
          {engineMeta.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
};
