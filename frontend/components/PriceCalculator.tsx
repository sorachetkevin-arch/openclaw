import React, { useState, useMemo } from 'react';
import { InsectType, PropertyType } from '../types';
import {
  INSECT_LABELS, INSECT_EMOJI, PROPERTY_LABELS, ALL_INSECT_TYPES, ALL_PROPERTY_TYPES,
  calculatePrice, formatPrice, FAQ, PRICE_TABLE,
} from '../constants';
import { Icon } from './Icons';

interface Props {
  onCreateJob?: (insects: InsectType[], property: PropertyType, area: number) => void;
}

export const PriceCalculator: React.FC<Props> = ({ onCreateJob }) => {
  const [insects, setInsects] = useState<InsectType[]>([]);
  const [property, setProperty] = useState<PropertyType>('house');
  const [area, setArea] = useState('');
  const [showFAQ, setShowFAQ] = useState(false);

  const toggleInsect = (t: InsectType) =>
    setInsects(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const areaNum = parseFloat(area) || 0;
  const breakdown = useMemo(
    () => insects.length > 0 && areaNum > 0 ? calculatePrice(insects, property, areaNum) : null,
    [insects, property, areaNum]
  );

  const maxWarranty = insects.length > 0
    ? Math.max(...insects.map(t => PRICE_TABLE[t].warranty))
    : null;

  const reset = () => {
    setInsects([]);
    setProperty('house');
    setArea('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">คำนวณราคา</h1>
          <p className="text-sm text-slate-500 mt-1">ประเมินราคาเบื้องต้นให้ลูกค้า</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center space-x-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-colors"
        >
          <Icon name="RotateCcw" className="w-4 h-4" />
          <span>รีเซ็ต</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Insect */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <span className="bg-emerald-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">1</span>
              <span>เลือกประเภทแมลง</span>
              <span className="text-xs text-slate-400">(เลือกได้หลายประเภท)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_INSECT_TYPES.map(t => {
                const sel = insects.includes(t);
                const p = PRICE_TABLE[t];
                return (
                  <button
                    key={t}
                    onClick={() => toggleInsect(t)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center ${
                      sel
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-3xl mb-1">{INSECT_EMOJI[t]}</span>
                    <span className="text-sm font-semibold">{INSECT_LABELS[t]}</span>
                    <span className="text-xs text-slate-400 mt-0.5">เริ่ม {formatPrice(p.base)}</span>
                    {sel && (
                      <div className="absolute top-1.5 right-1.5">
                        <Icon name="CheckCircle" className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Property + Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <span className="bg-emerald-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">2</span>
              <span>ประเภทสถานที่และพื้นที่</span>
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PROPERTY_TYPES.map(pt => (
                  <button
                    key={pt}
                    onClick={() => setProperty(pt)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      property === pt
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {PROPERTY_LABELS[pt]}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">พื้นที่ (ตร.ม.)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="เช่น 120"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    min="1"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-500 font-medium">ตร.ม.</span>
                </div>
                {/* Quick area buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[50, 100, 150, 200, 300, 500].map(n => (
                    <button
                      key={n}
                      onClick={() => setArea(String(n))}
                      className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                    >
                      {n} ตร.ม.
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: result */}
        <div className="space-y-5">
          {/* Price result */}
          <div className={`rounded-2xl border shadow-sm p-5 transition-all ${
            breakdown ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`font-semibold mb-4 flex items-center space-x-2 ${breakdown ? 'text-emerald-100' : 'text-slate-700'}`}>
              <Icon name="Banknote" className="w-5 h-5" />
              <span>ราคาประมาณการ</span>
            </h2>

            {!breakdown ? (
              <div className={`flex flex-col items-center py-8 ${breakdown ? '' : 'text-slate-300'}`}>
                <Icon name="Calculator" className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm text-center">เลือกประเภทแมลง<br />และกรอกพื้นที่เพื่อดูราคา</p>
              </div>
            ) : (
              <div className="space-y-3">
                {breakdown.insectBreakdown.map(b => (
                  <div key={b.type} className="flex justify-between items-center">
                    <span className="text-emerald-100 text-sm">
                      {INSECT_EMOJI[b.type]} {b.label}
                    </span>
                    <span className="font-semibold">{formatPrice(b.price)}</span>
                  </div>
                ))}

                <div className="border-t border-emerald-500 pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-emerald-100">รวม</span>
                    <span className="text-3xl font-black">{formatPrice(breakdown.total)}</span>
                  </div>
                  <div className="text-emerald-200 text-xs mt-1">
                    {PROPERTY_LABELS[property]} • {areaNum} ตร.ม.
                  </div>
                  {maxWarranty && (
                    <div className="flex items-center space-x-1.5 text-emerald-200 text-xs mt-2">
                      <Icon name="Shield" className="w-3.5 h-3.5" />
                      <span>รับประกัน {maxWarranty} เดือน</span>
                    </div>
                  )}
                </div>

                {onCreateJob && (
                  <button
                    onClick={() => onCreateJob(insects, property, areaNum)}
                    className="w-full mt-2 flex items-center justify-center space-x-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Icon name="Plus" className="w-4 h-4" />
                    <span>สร้างงานจากราคานี้</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start space-x-2">
              <Icon name="Info" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-semibold">หมายเหตุ</p>
                <p>ราคานี้เป็นการประเมินเบื้องต้นเท่านั้น ราคาจริงอาจแตกต่างขึ้นกับความรุนแรงของปัญหาและการสำรวจหน้างาน</p>
              </div>
            </div>
          </div>

          {/* Annual contract */}
          {breakdown && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <div className="font-semibold text-purple-800 text-sm mb-2 flex items-center space-x-2">
                <Icon name="Star" className="w-4 h-4" />
                <span>สัญญารายปี (4 ครั้ง)</span>
              </div>
              <div className="text-purple-700 text-sm">
                ลด 20% = <span className="font-bold text-lg">{formatPrice(Math.round(breakdown.total * 4 * 0.8 / 100) * 100)}</span>
                <span className="text-xs text-purple-500 ml-1">/ ปี</span>
              </div>
              <div className="text-xs text-purple-500 mt-1">ประหยัด {formatPrice(Math.round(breakdown.total * 4 * 0.2 / 100) * 100)}</div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowFAQ(f => !f)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <h2 className="font-semibold text-slate-700 flex items-center space-x-2">
            <Icon name="HelpCircle" className="w-5 h-5 text-emerald-600" />
            <span>คำถามที่พบบ่อย (FAQ)</span>
          </h2>
          <Icon name={showFAQ ? 'ChevronUp' : 'ChevronDown'} className="w-5 h-5 text-slate-400" />
        </button>
        {showFAQ && (
          <div className="divide-y divide-slate-50 border-t border-slate-100">
            {FAQ.map((f, i) => (
              <div key={i} className="px-6 py-4">
                <div className="font-medium text-slate-700 text-sm">❓ {f.q}</div>
                <div className="text-slate-500 text-sm mt-1">→ {f.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
