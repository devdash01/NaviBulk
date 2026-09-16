import React, { useMemo } from 'react';

/**
 * RouteLine — The Unifying Creative Device of SAIL NaviBulk
 * 
 * A continuous 2px brass dashed line that morphs across screens.
 * Contains an animated dash drift (8s) and a persistent vessel marker.
 */
export default function RouteLine({
  variant = 'home',
  progress = 0.45,
  activeStep = 1,
  onStepClick = null,
  corridor = null,
  className = '',
  style = {}
}) {
  // Compute path and vessel position based on variant
  const { pathData, vesselPos, waypoints, viewBox } = useMemo(() => {
    if (variant === 'planner') {
      // Horizontal stepper track for 5-Step Voyage Planner
      // Steps: 1: Consignment, 2: Feasibility, 3: Economics, 4: Timing & Risk, 5: Requisition
      const width = 1000;
      const height = 60;
      const y = 30;
      const stepX = {
        1: 100,
        2: 300,
        3: 500,
        4: 700,
        5: 900
      };
      
      const vX = stepX[activeStep] || 100;
      const d = `M 60 ${y} L 940 ${y}`;
      
      return {
        pathData: d,
        vesselPos: { x: vX, y, rotation: 0 },
        waypoints: [
          { x: 100, y, step: 1, label: '01 Consignment' },
          { x: 300, y, step: 2, label: '02 Feasibility' },
          { x: 500, y, step: 3, label: '03 Economics' },
          { x: 700, y, step: 4, label: '04 Timing & Risk' },
          { x: 900, y, step: 5, label: '05 Requisition' },
        ],
        viewBox: `0 0 ${width} ${height}`
      };
    }

    if (variant === 'port') {
      // Waterline cross-section: sea level horizontal then bends into draft measurement
      const width = 800;
      const height = 180;
      const d = `M 40 40 L 400 40 C 460 40 480 120 540 120 L 760 120`;
      return {
        pathData: d,
        vesselPos: { x: 360, y: 40, rotation: 0 },
        waypoints: [],
        viewBox: `0 0 ${width} ${height}`
      };
    }

    if (variant === 'market') {
      // Baseline for forecast chart
      const width = 800;
      const height = 80;
      const d = `M 40 50 L 760 50`;
      return {
        pathData: d,
        vesselPos: { x: 420, y: 50, rotation: 0 },
        waypoints: [],
        viewBox: `0 0 ${width} ${height}`
      };
    }

    // Default: 'home' variant (origin -> destination graceful sweeping arc)
    const width = 1000;
    const height = 240;
    
    // Coordinates for the hero arc
    const startX = 80;
    const startY = 170;
    const endX = 920;
    const endY = 110;
    const cpX = 490;
    const cpY = 20;

    const d = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;

    // Quadratic Bezier interpolation for vessel marker at progress t
    const t = Math.max(0.05, Math.min(0.95, progress));
    const invT = 1 - t;
    const vX = invT * invT * startX + 2 * invT * t * cpX + t * t * endX;
    const vY = invT * invT * startY + 2 * invT * t * cpY + t * t * endY;
    
    // Tangent angle
    const dx = 2 * invT * (cpX - startX) + 2 * t * (endX - cpX);
    const dy = 2 * invT * (cpY - startY) + 2 * t * (endY - cpY);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      pathData: d,
      vesselPos: { x: vX, y: vY, rotation: angle },
      waypoints: [
        { x: startX, y: startY, label: corridor ? corridor.origin : 'Origin' },
        { x: endX, y: endY, label: corridor ? corridor.destination : 'Destination' }
      ],
      viewBox: `0 0 ${width} ${height}`
    };
  }, [variant, progress, activeStep, corridor]);

  return (
    <div 
      className={`route-line-container ${className}`}
      style={{ 
        position: 'relative', 
        width: '100%', 
        overflow: 'visible',
        pointerEvents: 'none',
        ...style 
      }}
    >
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Subtle brass glow filter */}
          <filter id="brassGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#C9973F" floodOpacity="0.4" />
          </filter>
          {/* Gradient for subtle corridor path depth */}
          <linearGradient id="brassPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9973F" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#E8B968" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C9973F" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Ambient route line: 2px brass dashed stroke with dashoffset drift */}
        <path
          d={pathData}
          stroke="url(#brassPathGrad)"
          strokeWidth="2"
          strokeDasharray="8 6"
          strokeLinecap="round"
          className="route-line-animated"
          style={{
            transition: 'd 400ms cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        />

        {/* Waypoint terminals or step nodes */}
        {waypoints.map((wp, idx) => (
          <g 
            key={idx} 
            transform={`translate(${wp.x}, ${wp.y})`}
            onClick={() => onStepClick && wp.step && onStepClick(wp.step)}
            style={{ cursor: onStepClick && wp.step ? 'pointer' : 'default', pointerEvents: 'auto' }}
          >
            {/* Outer subtle ring */}
            <circle
              r="7"
              fill="#16191E"
              stroke={activeStep === wp.step ? "#E8B968" : "#C9973F"}
              strokeWidth={activeStep === wp.step ? "2" : "1.5"}
              strokeOpacity={activeStep === wp.step ? "1" : "0.7"}
            />
            {/* Inner brass core */}
            <circle
              r={activeStep === wp.step ? "3.5" : "2.5"}
              fill={activeStep === wp.step ? "#FFFFFF" : "#E8B968"}
            />
          </g>
        ))}

        {/* Vessel Marker: Small ship silhouette that glides along the continuous route */}
        <g
          transform={`translate(${vesselPos.x}, ${vesselPos.y}) rotate(${vesselPos.rotation})`}
          style={{
            transition: 'transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          {/* Pulse ring */}
          <circle
            r="12"
            fill="rgba(201, 151, 63, 0.15)"
            stroke="rgba(201, 151, 63, 0.4)"
            strokeWidth="1"
          />
          {/* Vessel Silhouette Icon */}
          <g transform="translate(-10, -8) scale(0.8)">
            <path
              d="M3 13 L6 16 L18 16 L22 13 L21 11 L19 11 L19 7 L17 7 L17 11 L12 11 L12 5 L10 5 L10 11 L3 11 Z"
              fill="#E8B968"
              filter="url(#brassGlow)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
