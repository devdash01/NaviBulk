// Stage 7: Risk Mitigation Module
// Evaluates route risk heuristics with transparent labeling:
// Note: These are rule-based expert heuristics based on historical seasonal patterns and port guidelines,
// NOT real-time live API feeds.

import { EAST_COAST_PORTS } from '../data/portConstraints.js';

export function evaluateRouteRisks(originCountry, destinationPortKey) {
  const destPort = EAST_COAST_PORTS[destinationPortKey] || EAST_COAST_PORTS.paradip;
  const activeFlags = [];
  const riskCards = [];

  // Signal 1: Weather & Cyclone Seasonal Heuristic
  let weatherRiskLevel = 'Low';
  let weatherScore = 20;
  let weatherMessage = 'Sea conditions normal along East Coast shipping lanes under standard operational weather limits.';

  if (destinationPortKey === 'paradip' || destinationPortKey === 'dhamra' || destinationPortKey === 'sagar') {
    weatherRiskLevel = 'Moderate-High';
    weatherScore = 72;
    weatherMessage = '[HISTORICAL SEASONAL HEURISTIC] Northern Bay of Bengal seasonal depression pattern. Recommend factoring 2.5m-3.5m wave swell risk and 12-18 hour pilotage delay allowances.';
    activeFlags.push('Bay of Bengal Cyclone/Weather Heuristic');
  }

  riskCards.push({
    id: 'weather',
    title: 'East Coast Weather & Cyclone Risk',
    sourceLabel: '[ILLUSTRATIVE HEURISTIC — Seasonal weather pattern rule, not live IMD feed]',
    level: weatherRiskLevel,
    score: weatherScore,
    message: weatherMessage,
    mitigation: 'Incorporate 24-hour weather laycan extension clause in charter party agreement to avoid demurrage penalties during storm closures.',
  });

  // Signal 2: Port Congestion & Turnaround Estimate
  const waitDays = destPort.congestionProxyWaitDays || 2.0;
  let congestionLevel = waitDays > 3.0 ? 'High' : waitDays > 2.0 ? 'Moderate' : 'Low';
  let congestionScore = Math.min(100, Math.round(waitDays * 22));

  riskCards.push({
    id: 'congestion',
    title: 'Port Congestion & Berth Wait Estimate',
    sourceLabel: '[ILLUSTRATIVE HEURISTIC — Port Trust monthly turnaround estimates]',
    level: congestionLevel,
    score: congestionScore,
    message: `Estimated berth wait time at ${destPort.name} is ${waitDays} days based on indicative Port Trust operational benchmarks.`,
    mitigation: congestionLevel === 'High' ? 'Nominate mechanized unloader berths or request preference berthing clause for SAIL coal shipments.' : 'Standard berthing queue expected.',
  });

  if (congestionLevel === 'High') {
    activeFlags.push('Port Congestion Delay');
  }

  // Signal 3: Geopolitical & Route Disruption Rule
  let geoLevel = 'Low';
  let geoScore = 15;
  let geoMessage = 'Shipping lanes operating without designated geopolitical sanctions restrictions.';

  if (originCountry === 'Russia') {
    geoLevel = 'Elevated High';
    geoScore = 88;
    geoMessage = '[STATUTORY RISK RULE] Russia-origin cargo (Vostochny/Murmansk) triggers enhanced compliance: OFAC/EU marine sanctions verification, P&I Club insurance checks, and banking transfer delays.';
    activeFlags.push('Russia Sanctions & Marine Insurance Risk');
  } else if (originCountry === 'Mozambique') {
    geoLevel = 'Moderate';
    geoScore = 45;
    geoMessage = '[REGIONAL RISK RULE] Beira corridor periodic labor bottlenecks; recommend monitoring rail-to-port stockpiles before vessel nomination.';
    activeFlags.push('Port Labor Advisory');
  }

  riskCards.push({
    id: 'geopolitical',
    title: 'Geopolitical & Route Sanctions Risk',
    sourceLabel: '[ILLUSTRATIVE HEURISTIC — Country statutory sanction rule, not live news feed]',
    level: geoLevel,
    score: geoScore,
    message: geoMessage,
    mitigation: originCountry === 'Russia' ? 'Mandate non-sanctioned vessel ownership verification and dual-currency letter of credit clauses in charter contracts.' : 'Monitor routine maritime advisories.',
  });

  // Overall Risk Score Calculation
  const overallRiskScore = Math.round((weatherScore + congestionScore + geoScore) / 3);
  const highRiskCount = riskCards.filter((r) => r.level.includes('High')).length;

  return {
    overallRiskScore,
    highRiskCount,
    activeFlags,
    riskCards,
    isRussiaRoute: originCountry === 'Russia',
  };
}
