import React, { useEffect, useRef, useState } from 'react';

// Professional Key Statistics Infographic with animated counters
export const KeyStatisticsInfographic = ({ darkMode }) => {
  const [counters, setCounters] = useState({
    grants: 0,
    funding: 0,
    orgs: 0,
    beneficiaries: 0
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounters({
        grants: Math.floor(107 * easeOutQuart),
        funding: Math.floor(63.5 * easeOutQuart),
        orgs: Math.floor(89 * easeOutQuart),
        beneficiaries: Math.floor(2.7 * easeOutQuart * 10) / 10
      });

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const cardBg = darkMode ? '#1e293b' : '#f8fafc';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const accentColor = '#3b82f6';
  const secondaryColor = '#10b981';
  const tertiaryColor = '#f59e0b';
  const quaternaryColor = '#ef4444';

  return (
    <svg viewBox="0 0 1200 600" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: tertiaryColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: quaternaryColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feFlood floodColor="#000000" floodOpacity="0.1"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="600" fill={bgColor} />
      
      <text x="600" y="50" textAnchor="middle" fontSize="32" fontWeight="700" fill={textColor}>
        Ukrainian Civil Society Impact Dashboard
      </text>
      <text x="600" y="85" textAnchor="middle" fontSize="18" fill={textColor} opacity="0.7">
        May-June 2025 Key Metrics
      </text>

      {/* Active Grants Card */}
      <g transform="translate(50, 130)">
        <rect width="250" height="180" rx="16" fill={cardBg} filter="url(#shadow)" />
        <rect width="250" height="8" rx="4" fill="url(#blueGradient)" />
        <circle cx="50" cy="50" r="30" fill="url(#blueGradient)" opacity="0.1" transform="translate(10, 30)" />
        <path d="M35 60 L35 40 L45 40 L45 60 M55 60 L55 30 L65 30 L65 60 M75 60 L75 50 L85 50 L85 60" 
              fill="url(#blueGradient)" transform="translate(10, 30)" />
        <text x="125" y="110" textAnchor="middle" fontSize="48" fontWeight="700" fill={textColor}>
          {counters.grants}
        </text>
        <text x="125" y="140" textAnchor="middle" fontSize="16" fill={textColor} opacity="0.7">
          Active Grants
        </text>
        <text x="125" y="160" textAnchor="middle" fontSize="14" fill={secondaryColor} fontWeight="600">
          +23% vs last quarter
        </text>
      </g>

      {/* Total Funding Card */}
      <g transform="translate(325, 130)">
        <rect width="250" height="180" rx="16" fill={cardBg} filter="url(#shadow)" />
        <rect width="250" height="8" rx="4" fill="url(#greenGradient)" />
        <circle cx="50" cy="50" r="30" fill="url(#greenGradient)" opacity="0.1" transform="translate(10, 30)" />
        <path d="M50 80 C30 80 30 40 50 40 C70 40 70 60 50 60 C70 60 70 80 50 80 Z" 
              fill="url(#greenGradient)" transform="translate(10, 30)" />
        <text x="125" y="110" textAnchor="middle" fontSize="48" fontWeight="700" fill={textColor}>
          €{counters.funding}M
        </text>
        <text x="125" y="140" textAnchor="middle" fontSize="16" fill={textColor} opacity="0.7">
          Total Funding
        </text>
        <text x="125" y="160" textAnchor="middle" fontSize="14" fill={secondaryColor} fontWeight="600">
          Available in 2025
        </text>
      </g>

      {/* Partner Organizations Card */}
      <g transform="translate(600, 130)">
        <rect width="250" height="180" rx="16" fill={cardBg} filter="url(#shadow)" />
        <rect width="250" height="8" rx="4" fill="url(#yellowGradient)" />
        <circle cx="50" cy="50" r="30" fill="url(#yellowGradient)" opacity="0.1" transform="translate(10, 30)" />
        <path d="M50 40 C50 40 30 50 30 70 C30 80 40 85 50 85 C60 85 70 80 70 70 C70 50 50 40 50 40 Z M50 60 L50 75 M40 65 L60 65" 
              fill="url(#yellowGradient)" transform="translate(10, 30)" />
        <text x="125" y="110" textAnchor="middle" fontSize="48" fontWeight="700" fill={textColor}>
          {counters.orgs}
        </text>
        <text x="125" y="140" textAnchor="middle" fontSize="16" fill={textColor} opacity="0.7">
          Partner Orgs
        </text>
        <text x="125" y="160" textAnchor="middle" fontSize="14" fill={tertiaryColor} fontWeight="600">
          International & Local
        </text>
      </g>

      {/* Beneficiaries Card */}
      <g transform="translate(875, 130)">
        <rect width="250" height="180" rx="16" fill={cardBg} filter="url(#shadow)" />
        <rect width="250" height="8" rx="4" fill="url(#redGradient)" />
        <circle cx="50" cy="50" r="30" fill="url(#redGradient)" opacity="0.1" transform="translate(10, 30)" />
        <g transform="translate(60, 80)">
          <circle cx="0" cy="0" r="8" fill="url(#redGradient)" />
          <circle cx="-20" cy="5" r="8" fill="url(#redGradient)" opacity="0.8" />
          <circle cx="20" cy="5" r="8" fill="url(#redGradient)" opacity="0.8" />
          <circle cx="-10" cy="20" r="8" fill="url(#redGradient)" opacity="0.6" />
          <circle cx="10" cy="20" r="8" fill="url(#redGradient)" opacity="0.6" />
        </g>
        <text x="125" y="110" textAnchor="middle" fontSize="48" fontWeight="700" fill={textColor}>
          {counters.beneficiaries}M
        </text>
        <text x="125" y="140" textAnchor="middle" fontSize="16" fill={textColor} opacity="0.7">
          Beneficiaries
        </text>
        <text x="125" y="160" textAnchor="middle" fontSize="14" fill={quaternaryColor} fontWeight="600">
          People Helped
        </text>
      </g>

      {/* Bottom visualization */}
      <g transform="translate(50, 350)">
        <text x="0" y="0" fontSize="20" fontWeight="600" fill={textColor}>
          Grant Distribution by Sector
        </text>
        
        {[
          { name: 'Humanitarian Aid', value: 35, color: quaternaryColor },
          { name: 'Democracy & Governance', value: 25, color: accentColor },
          { name: 'Human Rights', value: 20, color: secondaryColor },
          { name: 'Media & Information', value: 12, color: tertiaryColor },
          { name: 'Environmental', value: 8, color: '#8b5cf6' }
        ].map((item, index) => {
          const y = 30 + index * 35;
          const width = (item.value / 35) * 400;
          
          return (
            <g key={index}>
              <text x="0" y={y + 15} fontSize="14" fill={textColor}>
                {item.name}
              </text>
              <rect x="200" y={y} width={width} height="20" rx="10" fill={item.color} opacity="0.8">
                <animate attributeName="width" from="0" to={width} dur="1.5s" fill="freeze" />
              </rect>
              <text x={210 + width} y={y + 15} fontSize="14" fontWeight="600" fill={textColor}>
                {item.value}%
              </text>
            </g>
          );
        })}
      </g>

      {/* Trend indicator */}
      <g transform="translate(750, 380)">
        <rect width="380" height="160" rx="12" fill={cardBg} filter="url(#shadow)" />
        <text x="20" y="30" fontSize="18" fontWeight="600" fill={textColor}>
          Monthly Grant Applications Trend
        </text>
        <polyline 
          points="40,120 80,110 120,90 160,85 200,70 240,65 280,50 320,45 360,40"
          fill="none" 
          stroke={accentColor} 
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate attributeName="stroke-dasharray" from="0 1000" to="1000 0" dur="2s" fill="freeze" />
        </polyline>
        <text x="20" y="140" fontSize="24" fontWeight="700" fill={secondaryColor}>
          ↑ 45%
        </text>
        <text x="85" y="140" fontSize="14" fill={textColor} opacity="0.7">
          increase in applications
        </text>
      </g>
    </svg>
  );
};

// Professional Focus Areas Donut Chart
export const FocusAreasInfographic = ({ darkMode }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';

  const data = [
    { name: 'Humanitarian Response', value: 35, color: '#ef4444', icon: '🏥' },
    { name: 'Human Rights', value: 25, color: '#3b82f6', icon: '⚖️' },
    { name: 'Democracy Building', value: 20, color: '#10b981', icon: '🗳️' },
    { name: 'Media Freedom', value: 12, color: '#f59e0b', icon: '📰' },
    { name: 'Environmental', value: 8, color: '#8b5cf6', icon: '🌱' }
  ];

  let cumulativePercentage = 0;

  return (
    <svg viewBox="0 0 1200 600" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="4" result="offsetblur"/>
          <feFlood floodColor="#000000" floodOpacity="0.2"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {data.map((item, index) => (
          <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: item.color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: item.color, stopOpacity: 0.7 }} />
          </linearGradient>
        ))}
      </defs>

      <rect width="1200" height="600" fill={bgColor} />
      
      <text x="600" y="50" textAnchor="middle" fontSize="32" fontWeight="700" fill={textColor}>
        Civil Society Focus Areas 2025
      </text>

      {/* Main donut chart */}
      <g transform="translate(300, 300)">
        {data.map((segment, index) => {
          const startAngle = (cumulativePercentage * 360) / 100;
          cumulativePercentage += segment.value;
          const endAngle = (cumulativePercentage * 360) / 100;
          
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
          const outerRadius = hoveredSegment === index ? 165 : 150;
          const innerRadius = 80;
          
          const x1 = Math.cos(startAngleRad) * outerRadius;
          const y1 = Math.sin(startAngleRad) * outerRadius;
          const x2 = Math.cos(endAngleRad) * outerRadius;
          const y2 = Math.sin(endAngleRad) * outerRadius;
          
          const x3 = Math.cos(startAngleRad) * innerRadius;
          const y3 = Math.sin(startAngleRad) * innerRadius;
          const x4 = Math.cos(endAngleRad) * innerRadius;
          const y4 = Math.sin(endAngleRad) * innerRadius;
          
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${x4} ${y4}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
            'Z'
          ].join(' ');
          
          return (
            <g key={index}>
              <path
                d={pathData}
                fill={`url(#gradient-${index})`}
                filter={hoveredSegment === index ? "url(#shadow)" : ""}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                <animate 
                  attributeName="opacity" 
                  from="0" 
                  to="1" 
                  dur="0.5s" 
                  begin={`${index * 0.1}s`}
                  fill="freeze"
                />
              </path>
              
              {/* Percentage label */}
              <text
                x={Math.cos((startAngleRad + endAngleRad) / 2) * (outerRadius - 30)}
                y={Math.sin((startAngleRad + endAngleRad) / 2) * (outerRadius - 30)}
                textAnchor="middle"
                fontSize="20"
                fontWeight="700"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                {segment.value}%
              </text>
            </g>
          );
        })}
        
        {/* Center text */}
        <text x="0" y="0" textAnchor="middle" fontSize="24" fontWeight="700" fill={textColor}>
          Focus Areas
        </text>
        <text x="0" y="25" textAnchor="middle" fontSize="16" fill={textColor} opacity="0.7">
          Distribution
        </text>
      </g>

      {/* Legend with details */}
      <g transform="translate(700, 150)">
        {data.map((item, index) => (
          <g key={index} transform={`translate(0, ${index * 80})`}>
            <rect
              x="0"
              y="0"
              width="400"
              height="60"
              rx="8"
              fill={darkMode ? '#1e293b' : '#f8fafc'}
              stroke={hoveredSegment === index ? item.color : 'transparent'}
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
            <text x="50" y="25" fontSize="24">{item.icon}</text>
            <rect x="10" y="20" width="20" height="20" rx="4" fill={item.color} />
            <text x="90" y="25" fontSize="16" fontWeight="600" fill={textColor}>
              {item.name}
            </text>
            <text x="90" y="45" fontSize="14" fill={textColor} opacity="0.7">
              {item.value}% of total funding
            </text>
            <text x="350" y="35" fontSize="20" fontWeight="700" fill={item.color}>
              {item.value}%
            </text>
          </g>
        ))}
      </g>

      {/* Bottom insight */}
      <rect x="50" y="520" width="1100" height="60" rx="8" fill={darkMode ? '#1e293b' : '#f1f5f9'} />
      <text x="600" y="555" textAnchor="middle" fontSize="16" fill={textColor}>
        💡 <tspan fontWeight="600">Key Insight:</tspan> Humanitarian response remains the top priority, receiving over 1/3 of all grant funding
      </text>
    </svg>
  );
};

// Professional Timeline Visualization
export const TimelineInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const lineColor = darkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';

  const events = [
    { date: 'May 1', title: 'Housing Initiative Launch', detail: '3,200 homes renovation project begins', type: 'milestone' },
    { date: 'May 15', title: 'Mental Health Expansion', detail: '250 psychologists network established', type: 'success' },
    { date: 'May 28', title: 'Youth Mobilization', detail: '₴500M raised by youth organizations', type: 'achievement' },
    { date: 'Jun 5', title: 'Cultural Preservation', detail: '2.5M artifacts digitally preserved', type: 'milestone' },
    { date: 'Jun 18', title: 'International Partnership', detail: '€450M channeled through civil society', type: 'success' },
    { date: 'Jun 30', title: 'Q2 Impact Report', detail: '2.7M beneficiaries reached', type: 'achievement' }
  ];

  return (
    <svg viewBox="0 0 1200 700" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 0.2 }} />
          <stop offset="50%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: accentColor, stopOpacity: 0.2 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="700" fill={bgColor} />
      
      <text x="600" y="50" textAnchor="middle" fontSize="32" fontWeight="700" fill={textColor}>
        Civil Society Timeline: May-June 2025
      </text>

      {/* Main timeline line */}
      <line x1="100" y1="350" x2="1100" y2="350" stroke={lineColor} strokeWidth="4" />
      <line x1="100" y1="350" x2="1100" y2="350" stroke="url(#timelineGradient)" strokeWidth="4">
        <animate attributeName="x2" from="100" to="1100" dur="2s" fill="freeze" />
      </line>

      {/* Events */}
      {events.map((event, index) => {
        const x = 100 + (index * 180);
        const isTop = index % 2 === 0;
        const y = isTop ? 200 : 500;
        const lineY = isTop ? 280 : 420;
        
        const getEventColor = () => {
          switch(event.type) {
            case 'milestone': return '#3b82f6';
            case 'success': return '#10b981';
            case 'achievement': return '#f59e0b';
            default: return accentColor;
          }
        };

        const color = getEventColor();

        return (
          <g key={index}>
            {/* Connection line */}
            <line 
              x1={x} 
              y1="350" 
              x2={x} 
              y2={lineY} 
              stroke={color} 
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0"
            >
              <animate 
                attributeName="opacity" 
                from="0" 
                to="0.5" 
                dur="0.5s" 
                begin={`${0.3 * index + 0.5}s`}
                fill="freeze"
              />
            </line>

            {/* Event card */}
            <g opacity="0">
              <rect 
                x={x - 80} 
                y={y - 60} 
                width="160" 
                height="100" 
                rx="8" 
                fill={darkMode ? '#1e293b' : '#ffffff'}
                stroke={color}
                strokeWidth="2"
              />
              <text x={x} y={y - 35} textAnchor="middle" fontSize="14" fontWeight="600" fill={color}>
                {event.date}
              </text>
              <text x={x} y={y - 15} textAnchor="middle" fontSize="14" fontWeight="600" fill={textColor}>
                {event.title}
              </text>
              <foreignObject x={x - 70} y={y - 5} width="140" height="40">
                <div style={{ 
                  fontSize: '12px', 
                  color: darkMode ? '#94a3b8' : '#64748b',
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  {event.detail}
                </div>
              </foreignObject>
              
              <animate 
                attributeName="opacity" 
                from="0" 
                to="1" 
                dur="0.5s" 
                begin={`${0.3 * index + 0.5}s`}
                fill="freeze"
              />
            </g>

            {/* Timeline point */}
            <circle cx={x} cy="350" r="12" fill={color} filter="url(#glow)">
              <animate attributeName="r" from="0" to="12" dur="0.3s" begin={`${0.3 * index}s`} fill="freeze" />
            </circle>
            <circle cx={x} cy="350" r="6" fill="#ffffff" />
          </g>
        );
      })}

      {/* Month labels */}
      <text x="300" y="380" textAnchor="middle" fontSize="20" fontWeight="700" fill={textColor}>
        MAY 2025
      </text>
      <text x="900" y="380" textAnchor="middle" fontSize="20" fontWeight="700" fill={textColor}>
        JUNE 2025
      </text>

      {/* Progress indicator */}
      <g transform="translate(100, 600)">
        <rect width="1000" height="60" rx="30" fill={darkMode ? '#1e293b' : '#f1f5f9'} />
        <rect width="600" height="60" rx="30" fill={accentColor} opacity="0.2" />
        <rect width="600" height="60" rx="30" fill={accentColor}>
          <animate attributeName="width" from="0" to="600" dur="2s" fill="freeze" />
        </rect>
        <text x="500" y="38" textAnchor="middle" fontSize="18" fontWeight="600" fill="#ffffff">
          60% of 2025 Goals Achieved
        </text>
      </g>
    </svg>
  );
};

// Professional Regional Impact Map
export const RegionalImpactInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const mapBg = darkMode ? '#1e293b' : '#f8fafc';

  const regions = [
    { name: 'Kyiv', x: 350, y: 200, impact: 95, beneficiaries: '450K' },
    { name: 'Kharkiv', x: 500, y: 180, impact: 88, beneficiaries: '380K' },
    { name: 'Dnipro', x: 450, y: 280, impact: 82, beneficiaries: '320K' },
    { name: 'Odesa', x: 300, y: 380, impact: 75, beneficiaries: '290K' },
    { name: 'Lviv', x: 150, y: 250, impact: 70, beneficiaries: '260K' },
    { name: 'Zaporizhzhia', x: 480, y: 350, impact: 90, beneficiaries: '410K' }
  ];

  return (
    <svg viewBox="0 0 1200 600" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <radialGradient id="impactGradient">
          <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.2 }} />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      <rect width="1200" height="600" fill={bgColor} />
      
      <text x="600" y="50" textAnchor="middle" fontSize="32" fontWeight="700" fill={textColor}>
        Regional Impact Distribution
      </text>

      {/* Map container */}
      <g transform="translate(100, 100)">
        <rect width="600" height="400" rx="12" fill={mapBg} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="2" />
        
        {/* Simplified Ukraine outline */}
        <path
          d="M 50 200 Q 100 150 200 140 L 350 130 Q 450 140 520 180 L 530 250 Q 520 320 480 360 L 400 380 L 300 390 Q 200 380 120 340 L 80 280 Z"
          fill={darkMode ? '#0f172a' : '#ffffff'}
          stroke={darkMode ? '#475569' : '#cbd5e1'}
          strokeWidth="2"
        />

        {/* Impact circles */}
        {regions.map((region, index) => {
          const radius = (region.impact / 100) * 40;
          
          return (
            <g key={index}>
              {/* Impact area */}
              <circle
                cx={region.x}
                cy={region.y}
                r={radius * 2}
                fill="url(#impactGradient)"
                filter="url(#blur)"
                opacity="0"
              >
                <animate 
                  attributeName="opacity" 
                  from="0" 
                  to="0.6" 
                  dur="0.5s" 
                  begin={`${index * 0.2}s`}
                  fill="freeze"
                />
              </circle>
              
              {/* Main circle */}
              <circle
                cx={region.x}
                cy={region.y}
                r={radius}
                fill="#ef4444"
                opacity="0"
              >
                <animate 
                  attributeName="opacity" 
                  from="0" 
                  to="0.8" 
                  dur="0.5s" 
                  begin={`${index * 0.2}s`}
                  fill="freeze"
                />
                <animate 
                  attributeName="r" 
                  from="0" 
                  to={radius} 
                  dur="0.5s" 
                  begin={`${index * 0.2}s`}
                  fill="freeze"
                />
              </circle>
              
              {/* Center point */}
              <circle cx={region.x} cy={region.y} r="4" fill="#ffffff" />
              
              {/* Label */}
              <text x={region.x} y={region.y - radius - 10} textAnchor="middle" fontSize="14" fontWeight="600" fill={textColor}>
                {region.name}
              </text>
              <text x={region.x} y={region.y + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
                {region.beneficiaries}
              </text>
            </g>
          );
        })}
      </g>

      {/* Statistics panel */}
      <g transform="translate(750, 120)">
        <text x="0" y="0" fontSize="20" fontWeight="600" fill={textColor}>
          Impact by Numbers
        </text>
        
        {[
          { label: 'Total Beneficiaries', value: '2.7M', color: '#ef4444' },
          { label: 'Communities Reached', value: '78', color: '#f59e0b' },
          { label: 'Active Programs', value: '234', color: '#10b981' },
          { label: 'Volunteer Hours', value: '5M/mo', color: '#3b82f6' }
        ].map((stat, index) => (
          <g key={index} transform={`translate(0, ${40 + index * 80})`}>
            <rect width="350" height="60" rx="8" fill={darkMode ? '#1e293b' : '#f8fafc'} />
            <circle cx="30" cy="30" r="20" fill={stat.color} opacity="0.2" />
            <circle cx="30" cy="30" r="12" fill={stat.color} />
            <text x="60" y="25" fontSize="14" fill={textColor} opacity="0.7">
              {stat.label}
            </text>
            <text x="60" y="45" fontSize="24" fontWeight="700" fill={textColor}>
              {stat.value}
            </text>
          </g>
        ))}
      </g>

      {/* Heat map legend */}
      <g transform="translate(100, 540)">
        <text x="0" y="0" fontSize="14" fontWeight="600" fill={textColor}>
          Impact Intensity:
        </text>
        <rect x="120" y="-15" width="200" height="20" rx="10" fill="url(#impactGradient)" />
        <text x="100" y="0" fontSize="12" fill={textColor}>Low</text>
        <text x="330" y="0" fontSize="12" fill={textColor}>High</text>
      </g>
    </svg>
  );
};

// Professional International Support Network
export const InternationalSupportInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const nodeColor = darkMode ? '#334155' : '#e2e8f0';

  const centerX = 600;
  const centerY = 300;

  const supporters = [
    { name: 'European Union', amount: '€180M', angle: 0, color: '#003399' },
    { name: 'United States', amount: '€120M', angle: 60, color: '#b22234' },
    { name: 'Germany', amount: '€45M', angle: 120, color: '#ffcc00' },
    { name: 'Canada', amount: '€38M', angle: 180, color: '#ff0000' },
    { name: 'United Kingdom', amount: '€32M', angle: 240, color: '#012169' },
    { name: 'Nordic Countries', amount: '€35M', angle: 300, color: '#006aa7' }
  ];

  return (
    <svg viewBox="0 0 1200 600" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <filter id="networkGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="600" fill={bgColor} />
      
      <text x="600" y="50" textAnchor="middle" fontSize="32" fontWeight="700" fill={textColor}>
        International Support Network
      </text>

      {/* Connection lines */}
      {supporters.map((supporter, index) => {
        const angleRad = (supporter.angle * Math.PI) / 180;
        const x = centerX + Math.cos(angleRad) * 200;
        const y = centerY + Math.sin(angleRad) * 200;
        
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke={supporter.color}
            strokeWidth="2"
            opacity="0.3"
            strokeDasharray="5,5"
          >
            <animate 
              attributeName="stroke-dashoffset" 
              from="10" 
              to="0" 
              dur="1s" 
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {/* Central Ukraine node */}
      <g>
        <circle cx={centerX} cy={centerY} r="80" fill="#005bbb" filter="url(#networkGlow)" />
        <circle cx={centerX} cy={centerY} r="70" fill="#ffd700" />
        <text x={centerX} y={centerY - 10} textAnchor="middle" fontSize="20" fontWeight="700" fill="#005bbb">
          UKRAINE
        </text>
        <text x={centerX} y={centerY + 15} textAnchor="middle" fontSize="16" fill="#005bbb">
          Civil Society
        </text>
        <text x={centerX} y={centerY + 35} textAnchor="middle" fontSize="24" fontWeight="700" fill="#005bbb">
          €450M
        </text>
      </g>

      {/* Supporter nodes */}
      {supporters.map((supporter, index) => {
        const angleRad = (supporter.angle * Math.PI) / 180;
        const x = centerX + Math.cos(angleRad) * 200;
        const y = centerY + Math.sin(angleRad) * 200;
        const amountNum = parseInt(supporter.amount.replace(/[€M]/g, ''));
        const radius = 30 + (amountNum / 10);
        
        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={supporter.color}
              opacity="0"
            >
              <animate 
                attributeName="opacity" 
                from="0" 
                to="0.8" 
                dur="0.5s" 
                begin={`${index * 0.1 + 0.5}s`}
                fill="freeze"
              />
            </circle>
            <circle cx={x} cy={y} r={radius - 5} fill={bgColor} />
            <text x={x} y={y - radius - 10} textAnchor="middle" fontSize="14" fontWeight="600" fill={textColor}>
              {supporter.name}
            </text>
            <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill={supporter.color}>
              {supporter.amount}
            </text>
          </g>
        );
      })}

      {/* Additional partnerships info */}
      <g transform="translate(100, 480)">
        <rect width="1000" height="80" rx="12" fill={darkMode ? '#1e293b' : '#f1f5f9'} />
        <text x="50" y="35" fontSize="18" fontWeight="600" fill={textColor}>
          Global Partnership Impact:
        </text>
        <text x="50" y="60" fontSize="16" fill={textColor} opacity="0.8">
          90 partner countries • 50 advocacy campaigns • 100+ knowledge exchange programs
        </text>
        
        {/* Animated flow indicators */}
        {[0, 200, 400, 600, 800].map((offset, i) => (
          <circle key={i} cx={offset} cy="20" r="3" fill="#3b82f6">
            <animate 
              attributeName="cx" 
              from={offset} 
              to={offset + 200} 
              dur="2s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="opacity" 
              values="0;1;0" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
};

// Professional Future Priorities Radar Chart
export const FuturePrioritiesInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';

  const priorities = [
    { name: 'Winterization', value: 95, icon: '❄️' },
    { name: 'Mental Health', value: 88, icon: '🧠' },
    { name: 'Demining', value: 92, icon: '⚠️' },
    { name: 'Economic Recovery', value: 78, icon: '📈' },
    { name: 'Justice', value: 85, icon: '⚖️' },
    { name: 'Infrastructure', value: 82, icon: '🏗️' }
  ];

  const levels = [20, 40, 60, 80, 100];
  const angleStep = 360 / priorities.length;
  const centerX = 400;
  const centerY = 300;
  const maxRadius = 180;

  return (
    <svg viewBox="0 0 1200 600" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>

      <rect width="1200" height="600" fill={bgColor} />
      
      <text x="600" y="50" textAnchor="middle" fontSize="32" fontWeight="700" fill={textColor}>
        Future Priorities Assessment
      </text>

      <g transform="translate(0, 0)">
        {/* Grid circles */}
        {levels.map((level, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={(level / 100) * maxRadius}
            fill="none"
            stroke={gridColor}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Grid lines */}
        {priorities.map((_, index) => {
          const angle = (index * angleStep - 90) * Math.PI / 180;
          const x = centerX + Math.cos(angle) * maxRadius;
          const y = centerY + Math.sin(angle) * maxRadius;
          
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={gridColor}
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={priorities.map((priority, index) => {
            const angle = (index * angleStep - 90) * Math.PI / 180;
            const radius = (priority.value / 100) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            return `${x},${y}`;
          }).join(' ')}
          fill="url(#radarGradient)"
          stroke="#3b82f6"
          strokeWidth="3"
          opacity="0"
        >
          <animate 
            attributeName="opacity" 
            from="0" 
            to="1" 
            dur="1.5s" 
            fill="freeze"
          />
        </polygon>

        {/* Data points and labels */}
        {priorities.map((priority, index) => {
          const angle = (index * angleStep - 90) * Math.PI / 180;
          const dataRadius = (priority.value / 100) * maxRadius;
          const labelRadius = maxRadius + 40;
          const dataX = centerX + Math.cos(angle) * dataRadius;
          const dataY = centerY + Math.sin(angle) * dataRadius;
          const labelX = centerX + Math.cos(angle) * labelRadius;
          const labelY = centerY + Math.sin(angle) * labelRadius;
          
          return (
            <g key={index}>
              {/* Data point */}
              <circle cx={dataX} cy={dataY} r="6" fill="#3b82f6" />
              <circle cx={dataX} cy={dataY} r="3" fill="#ffffff" />
              
              {/* Label */}
              <text x={labelX} y={labelY - 10} textAnchor="middle" fontSize="24">
                {priority.icon}
              </text>
              <text x={labelX} y={labelY + 10} textAnchor="middle" fontSize="14" fontWeight="600" fill={textColor}>
                {priority.name}
              </text>
              <text x={labelX} y={labelY + 28} textAnchor="middle" fontSize="16" fontWeight="700" fill="#3b82f6">
                {priority.value}%
              </text>
            </g>
          );
        })}
      </g>

      {/* Priority details */}
      <g transform="translate(700, 150)">
        <text x="0" y="0" fontSize="20" fontWeight="600" fill={textColor}>
          Priority Breakdown
        </text>
        
        {priorities.slice(0, 3).map((priority, index) => (
          <g key={index} transform={`translate(0, ${40 + index * 100})`}>
            <rect width="400" height="80" rx="8" fill={darkMode ? '#1e293b' : '#f8fafc'} />
            <text x="40" y="25" fontSize="24">{priority.icon}</text>
            <text x="80" y="25" fontSize="16" fontWeight="600" fill={textColor}>
              {priority.name}
            </text>
            <rect x="80" y="35" width="250" height="8" rx="4" fill={gridColor} />
            <rect x="80" y="35" width={250 * priority.value / 100} height="8" rx="4" fill="#3b82f6">
              <animate attributeName="width" from="0" to={250 * priority.value / 100} dur="1s" fill="freeze" />
            </rect>
            <text x="80" y="60" fontSize="14" fill={textColor} opacity="0.7">
              Priority Score: {priority.value}/100
            </text>
            <text x="340" y="45" fontSize="20" fontWeight="700" fill="#3b82f6">
              {priority.value}%
            </text>
          </g>
        ))}
      </g>

      {/* Legend */}
      <rect x="700" y="480" width="400" height="80" rx="12" fill={darkMode ? '#1e293b' : '#f1f5f9'} />
      <circle cx="730" cy="520" r="15" fill="#3b82f6" opacity="0.2" />
      <circle cx="730" cy="520" r="8" fill="#3b82f6" />
      <text x="760" y="515" fontSize="14" fontWeight="600" fill={textColor}>
        Critical Priority Areas
      </text>
      <text x="760" y="535" fontSize="12" fill={textColor} opacity="0.7">
        Based on community needs assessment and stakeholder input
      </text>
    </svg>
  );
};

// Professional Call to Action
export const CallToActionInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#0f172a' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const accentColor = '#3b82f6';

  return (
    <svg viewBox="0 0 1200 600" style={{ width: '100%', height: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <defs>
        <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="ctaShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
          <feOffset dx="0" dy="5" result="offsetblur"/>
          <feFlood floodColor="#000000" floodOpacity="0.2"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="600" fill={bgColor} />
      
      {/* Background pattern */}
      <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill={darkMode ? '#334155' : '#e2e8f0'} opacity="0.3" />
      </pattern>
      <rect width="1200" height="600" fill="url(#dotPattern)" />

      {/* Main CTA Card */}
      <g transform="translate(100, 100)">
        <rect width="1000" height="400" rx="20" fill="url(#ctaGradient)" filter="url(#ctaShadow)" />
        
        {/* Icon */}
        <g transform="translate(500, 80)">
          <circle cx="0" cy="0" r="50" fill="#ffffff" opacity="0.2" />
          <path d="M-20 -10 L-20 10 L0 20 L20 10 L20 -10 L0 -20 Z M-20 10 L0 0 L20 10 M0 0 L0 20" 
                fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Main text */}
        <text x="500" y="180" textAnchor="middle" fontSize="48" fontWeight="700" fill="#ffffff">
          Support Ukrainian Civil Society
        </text>
        <text x="500" y="220" textAnchor="middle" fontSize="24" fill="#ffffff" opacity="0.9">
          Your contribution makes a lasting impact
        </text>

        {/* Action items */}
        <g transform="translate(150, 280)">
          {[
            { icon: '🤝', text: 'Partner with NGOs', desc: 'Direct collaboration opportunities' },
            { icon: '💰', text: 'Fund Programs', desc: 'Support verified initiatives' },
            { icon: '📢', text: 'Advocate', desc: 'Amplify Ukrainian voices' }
          ].map((item, index) => (
            <g key={index} transform={`translate(${index * 250}, 0)`}>
              <rect x="-10" y="-10" width="220" height="80" rx="12" fill="#ffffff" opacity="0.1" />
              <text x="20" y="20" fontSize="32">{item.icon}</text>
              <text x="70" y="15" fontSize="18" fontWeight="600" fill="#ffffff">
                {item.text}
              </text>
              <text x="70" y="35" fontSize="14" fill="#ffffff" opacity="0.8">
                {item.desc}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* Bottom action bar */}
      <g transform="translate(100, 540)">
        <rect width="1000" height="50" rx="25" fill={darkMode ? '#1e293b' : '#ffffff'} stroke={accentColor} strokeWidth="2" />
        <text x="500" y="32" textAnchor="middle" fontSize="18" fontWeight="600" fill={textColor}>
          Visit the Grant Portal → <tspan fill={accentColor} style={{ textDecoration: 'underline' }}>civil-society-grants-database.netlify.app</tspan>
        </text>
      </g>

      {/* Animated elements */}
      <g>
        {[...Array(5)].map((_, i) => (
          <circle key={i} cx={100 + i * 250} cy={50} r="3" fill={accentColor} opacity="0">
            <animate 
              attributeName="opacity" 
              values="0;1;0" 
              dur="3s" 
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate 
              attributeName="cy" 
              from="50" 
              to="550" 
              dur="3s" 
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
};

export default {
  KeyStatisticsInfographic,
  FocusAreasInfographic,
  TimelineInfographic,
  RegionalImpactInfographic,
  InternationalSupportInfographic,
  FuturePrioritiesInfographic,
  CallToActionInfographic
};