import React, { useState } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { computeVedicDignity, computeVimshottariDasha } from '@omce/core-logic';
import { unixMsToJulianDay } from '@omce/core-logic';
import {
  getVedicSignInterpretation,
  getVedicPlanetInSignInterpretation,
  getVedicBhavaInterpretation,
  getVedicPlanetInHouseInterpretation,
} from '../../../services/astrology/interpretations';

const BODY_LABELS: Record<string, string> = {
  sun: 'Mặt Trời',
  moon: 'Mặt Trăng',
  mercury: 'Sao Thủy',
  venus: 'Sao Kim',
  mars: 'Sao Hỏa',
  jupiter: 'Sao Mộc',
  saturn: 'Sao Thổ',
  rahu: 'Rahu (La Hầu)',
  ketu: 'Ketu (Kế Đô)',
};

const DIGNITY_LABELS: Record<string, string> = {
  uchha_peak: 'Miếu vượng (Đỉnh)',
  uchha_sign: 'Miếu vượng',
  neecha_peak: 'Hãm địa (Đáy)',
  neecha_sign: 'Hãm địa',
  moolatrikona: 'Moolatrikona',
  neutral: 'Bình hòa',
};

const DIGNITY_COLORS: Record<string, string> = {
  uchha_peak: 'text-green-600 dark:text-green-400',
  uchha_sign: 'text-green-500 dark:text-green-400',
  neecha_peak: 'text-red-600 dark:text-red-400',
  neecha_sign: 'text-red-500 dark:text-red-400',
  moolatrikona: 'text-blue-500 dark:text-blue-400',
  neutral: 'text-text-secondary-light dark:text-text-secondary-dark',
};

const ZODIAC_SIGNS = [
  'Bạch Dương',
  'Kim Ngưu',
  'Song Tử',
  'Cự Giải',
  'Sư Tử',
  'Xử Nữ',
  'Thiên Bình',
  'Bọ Cạp',
  'Nhân Mã',
  'Ma Kết',
  'Bảo Bình',
  'Song Ngư',
];

export const VedicTechnicalTables: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'planets' | 'bhavas'>('planets');
  const vedicInput = useAstrologyStore((s) => s.vedicInput);
  const birthDate = vedicInput.birthDate instanceof Date ? vedicInput.birthDate : new Date(vedicInput.birthDate);
  const birthYear = birthDate.getFullYear();
  const birthJulianDay = unixMsToJulianDay(birthDate.getTime());

  const moon = result.planets.find((p) => p.body === 'moon');
  const dashas = moon ? computeVimshottariDasha(moon.siderealLongitude, birthJulianDay, birthYear) : [];

  const mainPlanets = result.planets.filter((p) =>
    ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'].includes(p.body),
  );

  // Compute vedic house placements based on Whole Sign Houses
  const ayanamsha =
    result.planets.length > 0
      ? (result.planets[0].tropicalLongitude - result.planets[0].siderealLongitude + 360) % 360
      : 0;
  const lagnaDegrees = (result.ascendant - ayanamsha + 360) % 360;
  const lagnaSignIndex = Math.floor(lagnaDegrees / 30);
  const lagnaSign = ZODIAC_SIGNS[lagnaSignIndex];

  return (
    <div className="space-y-6 mt-6">
      <div className="glass-card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title text-sm flex items-center gap-2">
            <span className="material-icons-round text-purple-500 dark:text-purple-400 text-base">star</span>
            Trạng thái hành tinh (Dignities)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-light/60 dark:border-border-dark/60 label-standard">
                <th className="py-2 px-3">Hành tinh</th>
                <th className="py-2 px-3 text-center">Trạng thái (Dignity)</th>
              </tr>
            </thead>
            <tbody>
              {mainPlanets.map((planet) => {
                const dignity = computeVedicDignity(planet.body, planet.siderealLongitude);
                return (
                  <tr
                    key={planet.body + '_dignity'}
                    className="border-b border-border-light/40 dark:border-border-dark/40"
                  >
                    <td className="py-2 px-3 text-sm font-semibold">{BODY_LABELS[planet.body] || planet.body}</td>
                    <td className={`py-2 px-3 text-sm text-center font-medium ${DIGNITY_COLORS[dignity] || ''}`}>
                      {DIGNITY_LABELS[dignity] || dignity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dashas.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="card-header">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-purple-500 dark:text-purple-400 text-base">timelapse</span>
              Đại vận Vimshottari Dasha (120 năm)
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {dashas.map(
                (dasha: { startYear: number; endYear: number; lord: string; duration: number }, idx: number) => {
                  const isCurrent = birthYear >= dasha.startYear && birthYear < dasha.endYear; // Approximate current logic
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border ${isCurrent ? 'border-purple-500 bg-purple-500/10' : 'border-border-light/40 dark:border-border-dark/40 surface-card'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold">{BODY_LABELS[dasha.lord] || dasha.lord}</span>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {dasha.duration} năm
                        </span>
                      </div>
                      <div className="text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark">
                        {Math.floor(dasha.startYear)} - {Math.floor(dasha.endYear)}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diễn giải cơ bản */}
      <div className="glass-card overflow-hidden">
        <div className="card-header border-b border-border-light/40 dark:border-border-dark/40">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-purple-500 dark:text-purple-400 text-base">menu_book</span>
              Luận Giải Chi Tiết (Vedic)
            </h3>
            <div className="flex bg-surface-light dark:bg-surface-dark rounded-lg p-1">
              <button
                onClick={() => setActiveTab('planets')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'planets' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                Hành Tinh
              </button>
              <button
                onClick={() => setActiveTab('bhavas')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'bhavas' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                12 Bhava (Nhà)
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {activeTab === 'planets' && (
            <>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-purple-600 dark:text-purple-400">
                  Lagna (Cung Mọc) - {lagnaSign}
                </h4>
                <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                  {getVedicSignInterpretation(lagnaSign) ||
                    'Lagna là điểm bắt đầu, bản ngã vật lý và phương hướng cuộc đời.'}
                </p>
              </div>

              {mainPlanets.map((p) => {
                const planetSignIndex = Math.floor(p.siderealLongitude / 30);
                const planetSignName = ZODIAC_SIGNS[planetSignIndex];
                const bhava = ((planetSignIndex - lagnaSignIndex + 12) % 12) + 1; // Whole sign house index

                const inSign = getVedicPlanetInSignInterpretation(p.body, planetSignName);
                const inHouse = getVedicPlanetInHouseInterpretation(p.body, bhava);

                if (!inSign && !inHouse) return null;

                return (
                  <div
                    key={p.body + 'interp'}
                    className="space-y-3 bg-surface-light dark:bg-surface-dark p-3 rounded-xl"
                  >
                    <h4 className="font-bold text-md text-purple-600 dark:text-purple-400">{BODY_LABELS[p.body]}</h4>

                    {inSign && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark tracking-wider">
                          Ở Cung {planetSignName}:
                        </p>
                        <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                          {inSign}
                        </p>
                      </div>
                    )}

                    {inHouse && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark tracking-wider">
                          Ở Nhà (Bhava) {bhava}:
                        </p>
                        <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                          {inHouse}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'bhavas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bhava) => {
                const meaning = getVedicBhavaInterpretation(bhava);
                if (!meaning) return null;
                return (
                  <div
                    key={'bhava' + bhava}
                    className="bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-border-light/20 dark:border-border-dark/20"
                  >
                    <h4 className="font-bold text-md text-purple-600 dark:text-purple-400 mb-2">Nhà (Bhava) {bhava}</h4>
                    <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark opacity-90">
                      {meaning}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
