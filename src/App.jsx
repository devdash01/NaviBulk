// SAIL NaviBulk — Commercial Maritime Decision Support Platform
// Institutional Application Shell & Orchestration Layer (< 120 lines)
import React, { useState } from 'react';
import { DecisionProvider, useDecisionEngine } from './context/DecisionContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import StageRouter from './components/StageRouter.jsx';
import PortOperationsView from './components/PortOperationsView.jsx';
import MethodologyDossierModal from './components/MethodologyDossierModal.jsx';

export default function App() {
  return (
    <DecisionProvider>
      <AppWorkspace />
    </DecisionProvider>
  );
}

function AppWorkspace() {
  const { handleRequirementChange, setActiveStage } = useDecisionEngine();
  const [activeTab, setActiveTab] = useState('decision'); // 'decision' | 'ports'
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  return (
    <div 
      className="app-shell" 
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        background: 'var(--bg-app, #F8FAFC)',
        color: '#0F172A',
        position: 'relative'
      }}
    >
      {/* 232px Desktop Minimal Workstation Sidebar */}
      <Sidebar
        onOpenPortsModal={() => setActiveTab('ports')}
        onOpenMethodologyModal={() => setIsMethodologyModalOpen(true)}
      />

      {/* Main Workstation Container */}
      <div 
        className="workspace-container" 
        style={{ 
          flex: 1, 
          minWidth: 0, 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-app, #F8FAFC)'
        }}
      >
        {/* Compact 56px Top Bar */}
        <TopBar 
          onOpenMethodologyModal={() => setIsMethodologyModalOpen(true)} 
        />

        {/* Focused Stage Workspace / View */}
        <main 
          className="workspace-content" 
          style={{ 
            flex: 1, 
            padding: '1.75rem 2rem',
            overflowY: 'auto'
          }}
        >
          {activeTab === 'decision' && <StageRouter />}

          {activeTab === 'ports' && (
            <PortOperationsView
              onSelectPortForVoyage={(portKey) => {
                handleRequirementChange({ destinationPortKey: portKey });
                setActiveStage('requirement');
                setActiveTab('decision');
              }}
            />
          )}
        </main>

        {/* Restrained Institutional Footer */}
        <footer 
          style={{
            borderTop: '1px solid #E2E8F0',
            padding: '0.85rem 2rem',
            fontSize: '0.73rem',
            color: '#64748B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            background: '#FFFFFF'
          }}
        >
          <div>
            Steel Authority of India Limited • Central Raw Materials Logistics Directorate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>ISO 9001 / IMO MEPC 76 Compliant</span>
            <span>•</span>
            <span style={{ color: '#16A34A', fontWeight: 600 }}>Decision Engine V2 Validated</span>
          </div>
        </footer>
      </div>

      {/* Mathematical Model Audit Dossier Modal */}
      <MethodologyDossierModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
    </div>
  );
}
