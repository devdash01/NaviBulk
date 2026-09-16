// Stage 1: Input Layer Component (Single-form layout)
import React from 'react';
import { Package, Globe, Anchor, Calendar, Scale, Layers } from 'lucide-react';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS } from '../data/portConstraints';

export default function Stage1InputForm({ inputs, setInputs, onCalculate }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === 'tonnage' ? Number(value) : value,
    }));
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-hero)' }}>Voyage &amp; Cargo Configuration</h2>
        </div>
        <span className="proxy-badge-cyan">Single Form Input</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCalculate();
        }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}
      >
        {/* 1. Cargo Type */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Package size={14} color="var(--accent-cyan)" /> Cargo Type
          </label>
          <select className="form-select" name="cargoType" value={inputs.cargoType} onChange={handleChange}>
            <option value="Coking Coal">Coking Coal (Prime Hard)</option>
            <option value="Thermal Coal">Thermal Coal (High GCV)</option>
            <option value="Iron Ore Fines">Iron Ore Fines (Fe 64%)</option>
            <option value="Iron Ore Lump">Iron Ore Lump</option>
            <option value="Limestone">Limestone (Steel Grade)</option>
            <option value="Dolomite">Dolomite</option>
          </select>
        </div>

        {/* 2. Tonnage (DWT) */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Scale size={14} color="var(--accent-cyan)" /> Parcel Tonnage (DWT)
          </label>
          <select className="form-select" name="tonnage" value={inputs.tonnage} onChange={handleChange}>
            <option value={35000}>35,000 DWT (Handysize Parcel)</option>
            <option value={58000}>58,000 DWT (Supramax Parcel)</option>
            <option value={75000}>75,000 DWT (Panamax Standard)</option>
            <option value={90000}>90,000 DWT (Kamsarmax Bulk)</option>
            <option value={150000}>150,000 DWT (Baby-Capesize)</option>
            <option value={180000}>180,000 DWT (Capesize Full Load)</option>
          </select>
        </div>

        {/* 3. Origin Country */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} color="var(--accent-cyan)" /> Origin Load Country
          </label>
          <select className="form-select" name="originCountry" value={inputs.originCountry} onChange={handleChange}>
            <option value="Australia">Australia (Gladstone / Hay Pt)</option>
            <option value="US">United States (Hampton Roads)</option>
            <option value="Mozambique">Mozambique (Beira / Nacala)</option>
            <option value="Russia">Russia (Vostochny / Far East) ⚠️</option>
            <option value="Indonesia">Indonesia (Taboneo / E. Kalimantan)</option>
          </select>
        </div>

        {/* 4. Destination Indian Port */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Anchor size={14} color="var(--accent-cyan)" /> Destination East Coast Port
          </label>
          <select className="form-select" name="destinationPortKey" value={inputs.destinationPortKey} onChange={handleChange}>
            {Object.keys(EAST_COAST_PORTS).map((pKey) => (
              <option key={pKey} value={pKey}>
                {EAST_COAST_PORTS[pKey].name} ({EAST_COAST_PORTS[pKey].maxDraft}m Draft)
              </option>
            ))}
          </select>
        </div>

        {/* 5. Contract Duration / Strategy */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} color="var(--accent-cyan)" /> Contract Framework
          </label>
          <select className="form-select" name="contractType" value={inputs.contractType} onChange={handleChange}>
            <option value="single_voyage">Single Spot Voyage (Spot Fixture)</option>
            <option value="multi_voyage">6-Month Multi-Voyage COA (Contract of Affreightment)</option>
          </select>
        </div>
      </form>
    </div>
  );
}
