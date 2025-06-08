import React from 'react';

// Key Statistics Infographic - Overview of civil society impact
export const KeyStatisticsInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const accentColor = '#3b82f6';
  const secondaryColor = darkMode ? '#374151' : '#e5e7eb';
  
  return (
    <svg width="800" height="400" viewBox="0 0 800 400" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="400" fill={bgColor} />
      
      {/* Title */}
      <text x="400" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Ukrainian Civil Society: Key Impact Statistics
      </text>
      
      {/* Statistics Grid */}
      <g transform="translate(50, 80)">
        {/* Stat 1: Organizations */}
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="160" height="120" fill={secondaryColor} rx="8" />
          <text x="80" y="40" textAnchor="middle" fontSize="36" fontWeight="bold" fill={accentColor}>3,200</text>
          <text x="80" y="60" textAnchor="middle" fontSize="14" fill={textColor}>Active CSOs</text>
          <text x="80" y="80" textAnchor="middle" fontSize="12" fill={textColor}>providing aid</text>
        </g>
        
        {/* Stat 2: People Helped */}
        <g transform="translate(180, 0)">
          <rect x="0" y="0" width="160" height="120" fill={secondaryColor} rx="8" />
          <text x="80" y="40" textAnchor="middle" fontSize="36" fontWeight="bold" fill={accentColor}>12.5M</text>
          <text x="80" y="60" textAnchor="middle" fontSize="14" fill={textColor}>People</text>
          <text x="80" y="80" textAnchor="middle" fontSize="12" fill={textColor}>assisted</text>
        </g>
        
        {/* Stat 3: Funding */}
        <g transform="translate(360, 0)">
          <rect x="0" y="0" width="160" height="120" fill={secondaryColor} rx="8" />
          <text x="80" y="40" textAnchor="middle" fontSize="36" fontWeight="bold" fill={accentColor}>€450M</text>
          <text x="80" y="60" textAnchor="middle" fontSize="14" fill={textColor}>International</text>
          <text x="80" y="80" textAnchor="middle" fontSize="12" fill={textColor}>funding</text>
        </g>
        
        {/* Stat 4: Volunteers */}
        <g transform="translate(540, 0)">
          <rect x="0" y="0" width="160" height="120" fill={secondaryColor} rx="8" />
          <text x="80" y="40" textAnchor="middle" fontSize="36" fontWeight="bold" fill={accentColor}>5M hrs</text>
          <text x="80" y="60" textAnchor="middle" fontSize="14" fill={textColor}>Monthly volunteer</text>
          <text x="80" y="80" textAnchor="middle" fontSize="12" fill={textColor}>contributions</text>
        </g>
      </g>
      
      {/* Bottom Statistics */}
      <g transform="translate(50, 240)">
        <rect x="0" y="0" width="700" height="120" fill={secondaryColor} rx="8" />
        <text x="350" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill={textColor}>
          Impact Across Ukraine
        </text>
        
        {/* Mini stats */}
        <g transform="translate(50, 50)">
          <circle cx="20" cy="20" r="20" fill={accentColor} />
          <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">24</text>
          <text x="70" y="26" fontSize="14" fill={textColor}>Regions covered</text>
        </g>
        
        <g transform="translate(250, 50)">
          <circle cx="20" cy="20" r="20" fill={accentColor} />
          <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">67</text>
          <text x="70" y="26" fontSize="14" fill={textColor}>Safe spaces created</text>
        </g>
        
        <g transform="translate(450, 50)">
          <circle cx="20" cy="20" r="20" fill={accentColor} />
          <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">90</text>
          <text x="70" y="26" fontSize="14" fill={textColor}>Partner countries</text>
        </g>
      </g>
    </svg>
  );
};

// Focus Areas Chart
export const FocusAreasInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  
  const areas = [
    { name: 'Humanitarian Aid', percentage: 35, color: '#ef4444' },
    { name: 'Human Rights', percentage: 25, color: '#3b82f6' },
    { name: 'Healthcare', percentage: 20, color: '#10b981' },
    { name: 'Education', percentage: 12, color: '#f59e0b' },
    { name: 'Democracy', percentage: 8, color: '#8b5cf6' }
  ];
  
  return (
    <svg width="800" height="400" viewBox="0 0 800 400" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="400" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Civil Society Focus Areas
      </text>
      
      <g transform="translate(100, 80)">
        {areas.map((area, index) => (
          <g key={area.name} transform={`translate(0, ${index * 60})`}>
            <text x="0" y="20" fontSize="14" fill={textColor}>{area.name}</text>
            <rect x="150" y="5" width={area.percentage * 4} height="30" fill={area.color} rx="4" />
            <text x={160 + area.percentage * 4} y="25" fontSize="14" fontWeight="bold" fill={textColor}>
              {area.percentage}%
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// Timeline Infographic
export const TimelineInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const lineColor = darkMode ? '#4b5563' : '#d1d5db';
  const accentColor = '#3b82f6';
  
  const events = [
    { date: 'May 2025', title: 'Housing Initiative Launch', desc: '3,200 homes renovated' },
    { date: 'May 2025', title: 'Mental Health Expansion', desc: '250 psychologists network' },
    { date: 'June 2025', title: 'Youth Mobilization', desc: '1.2M students online' },
    { date: 'June 2025', title: 'Anti-Corruption Win', desc: '₴2.8B saved' }
  ];
  
  return (
    <svg width="800" height="400" viewBox="0 0 800 400" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="400" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        May-June 2025: Key Milestones
      </text>
      
      {/* Timeline line */}
      <line x1="100" y1="200" x2="700" y2="200" stroke={lineColor} strokeWidth="2" />
      
      {events.map((event, index) => (
        <g key={index} transform={`translate(${150 + index * 150}, 200)`}>
          <circle cx="0" cy="0" r="8" fill={accentColor} />
          <text x="0" y="-30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
            {event.date}
          </text>
          <text x="0" y="40" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
            {event.title}
          </text>
          <text x="0" y="60" textAnchor="middle" fontSize="12" fill={textColor}>
            {event.desc}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Regional Impact Map
export const RegionalImpactInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const mapColor = darkMode ? '#374151' : '#e5e7eb';
  const highlightColor = '#3b82f6';
  
  return (
    <svg width="800" height="400" viewBox="0 0 800 400" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="400" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Regional Impact Across Ukraine
      </text>
      
      {/* Simplified Ukraine map */}
      <g transform="translate(200, 80)">
        <path d="M50 50 L350 50 L400 100 L400 200 L350 250 L50 250 L0 200 L0 100 Z" 
              fill={mapColor} stroke={textColor} strokeWidth="2" />
        
        {/* Regional highlights */}
        <circle cx="100" cy="100" r="20" fill={highlightColor} opacity="0.7" />
        <circle cx="200" cy="120" r="25" fill={highlightColor} opacity="0.7" />
        <circle cx="300" cy="150" r="30" fill={highlightColor} opacity="0.7" />
        <circle cx="150" cy="180" r="22" fill={highlightColor} opacity="0.7" />
      </g>
      
      {/* Legend */}
      <g transform="translate(50, 350)">
        <text x="0" y="0" fontSize="14" fill={textColor}>Coverage: </text>
        <circle cx="100" cy="-5" r="10" fill={highlightColor} opacity="0.7" />
        <text x="120" y="0" fontSize="14" fill={textColor}>Active CSO presence in 24 regions</text>
      </g>
    </svg>
  );
};

// International Support Visualization
export const InternationalSupportInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  
  const supporters = [
    { name: 'EU', amount: 150, color: '#3b82f6' },
    { name: 'USA', amount: 120, color: '#ef4444' },
    { name: 'UK', amount: 80, color: '#10b981' },
    { name: 'Germany', amount: 60, color: '#f59e0b' },
    { name: 'Others', amount: 40, color: '#8b5cf6' }
  ];
  
  return (
    <svg width="800" height="400" viewBox="0 0 800 400" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="400" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        International Support (€ millions)
      </text>
      
      <g transform="translate(100, 100)">
        {supporters.map((supporter, index) => (
          <g key={supporter.name} transform={`translate(${index * 120}, 0)`}>
            <rect 
              x="20" 
              y={250 - supporter.amount} 
              width="80" 
              height={supporter.amount} 
              fill={supporter.color} 
              rx="4"
            />
            <text x="60" y={240 - supporter.amount} textAnchor="middle" fontSize="16" fontWeight="bold" fill={textColor}>
              €{supporter.amount}M
            </text>
            <text x="60" y="270" textAnchor="middle" fontSize="14" fill={textColor}>
              {supporter.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// Future Priorities Diagram
export const FuturePrioritiesInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const boxColor = darkMode ? '#374151' : '#f3f4f6';
  const accentColor = '#3b82f6';
  
  const priorities = [
    'Winterization Support',
    'Mental Health Scaling',
    'Demining Advocacy',
    'Economic Recovery',
    'Justice Mechanisms'
  ];
  
  return (
    <svg width="800" height="400" viewBox="0 0 800 400" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="400" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Future Priorities for Civil Society
      </text>
      
      {/* Central circle */}
      <circle cx="400" cy="200" r="80" fill={accentColor} />
      <text x="400" y="200" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        2025-2026
      </text>
      <text x="400" y="220" textAnchor="middle" fontSize="14" fill="white">
        Priorities
      </text>
      
      {/* Priority boxes */}
      {priorities.map((priority, index) => {
        const angle = (index * 72 - 90) * Math.PI / 180;
        const x = 400 + 150 * Math.cos(angle);
        const y = 200 + 150 * Math.sin(angle);
        
        return (
          <g key={index}>
            <line x1="400" y1="200" x2={x} y2={y} stroke={accentColor} strokeWidth="2" opacity="0.5" />
            <rect x={x - 60} y={y - 20} width="120" height="40" fill={boxColor} rx="4" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="12" fill={textColor}>
              {priority}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Call to Action
export const CallToActionInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const accentColor = '#3b82f6';
  const secondaryColor = '#10b981';
  
  return (
    <svg width="800" height="300" viewBox="0 0 800 300" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect width="800" height="300" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fill={textColor}>
        Support Ukrainian Civil Society
      </text>
      
      <g transform="translate(100, 80)">
        {/* Action 1 */}
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="180" height="120" fill={accentColor} rx="8" />
          <text x="90" y="40" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
            DONATE
          </text>
          <text x="90" y="65" textAnchor="middle" fontSize="14" fill="white">
            Support CSOs
          </text>
          <text x="90" y="85" textAnchor="middle" fontSize="14" fill="white">
            directly
          </text>
        </g>
        
        {/* Action 2 */}
        <g transform="translate(200, 0)">
          <rect x="0" y="0" width="180" height="120" fill={secondaryColor} rx="8" />
          <text x="90" y="40" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
            ADVOCATE
          </text>
          <text x="90" y="65" textAnchor="middle" fontSize="14" fill="white">
            Share their
          </text>
          <text x="90" y="85" textAnchor="middle" fontSize="14" fill="white">
            stories
          </text>
        </g>
        
        {/* Action 3 */}
        <g transform="translate(400, 0)">
          <rect x="0" y="0" width="180" height="120" fill={accentColor} rx="8" />
          <text x="90" y="40" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
            PARTNER
          </text>
          <text x="90" y="65" textAnchor="middle" fontSize="14" fill="white">
            Collaborate
          </text>
          <text x="90" y="85" textAnchor="middle" fontSize="14" fill="white">
            & support
          </text>
        </g>
      </g>
      
      <text x="400" y="250" textAnchor="middle" fontSize="16" fill={textColor} fontStyle="italic">
        "Together, we build a free and democratic Ukraine"
      </text>
    </svg>
  );
};