import React from 'react';

// Key Statistics Infographic
export const KeyStatisticsInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const accentColor = '#3b82f6';
  const secondaryColor = '#60a5fa';

  return (
    <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill={bgColor} />
      
      {/* Title */}
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="28" fontWeight="bold">
        Ukraine Humanitarian Crisis: Key Numbers
      </text>
      
      {/* Stats Cards */}
      <g transform="translate(50, 80)">
        {/* Card 1 */}
        <rect x="0" y="0" width="160" height="120" rx="10" fill={accentColor} opacity="0.1" />
        <text x="80" y="40" textAnchor="middle" fill={accentColor} fontSize="36" fontWeight="bold">12.5M</text>
        <text x="80" y="65" textAnchor="middle" fill={textColor} fontSize="14">People need</text>
        <text x="80" y="85" textAnchor="middle" fill={textColor} fontSize="14">humanitarian aid</text>
        
        {/* Card 2 */}
        <rect x="190" y="0" width="160" height="120" rx="10" fill={secondaryColor} opacity="0.1" />
        <text x="270" y="40" textAnchor="middle" fill={secondaryColor} fontSize="36" fontWeight="bold">3.5M</text>
        <text x="270" y="65" textAnchor="middle" fill={textColor} fontSize="14">Internally</text>
        <text x="270" y="85" textAnchor="middle" fill={textColor} fontSize="14">displaced persons</text>
        
        {/* Card 3 */}
        <rect x="380" y="0" width="160" height="120" rx="10" fill={accentColor} opacity="0.1" />
        <text x="460" y="40" textAnchor="middle" fill={accentColor} fontSize="36" fontWeight="bold">6.3M</text>
        <text x="460" y="65" textAnchor="middle" fill={textColor} fontSize="14">Refugees</text>
        <text x="460" y="85" textAnchor="middle" fill={textColor} fontSize="14">across Europe</text>
        
        {/* Card 4 */}
        <rect x="570" y="0" width="160" height="120" rx="10" fill={secondaryColor} opacity="0.1" />
        <text x="650" y="40" textAnchor="middle" fill={secondaryColor} fontSize="36" fontWeight="bold">9M+</text>
        <text x="650" y="65" textAnchor="middle" fill={textColor} fontSize="14">Living in</text>
        <text x="650" y="85" textAnchor="middle" fill={textColor} fontSize="14">poverty</text>
      </g>
      
      {/* Bottom section with icons */}
      <g transform="translate(100, 250)">
        <circle cx="50" cy="50" r="40" fill={accentColor} opacity="0.2" />
        <text x="50" y="55" textAnchor="middle" fill={accentColor} fontSize="20" fontWeight="bold">56%</text>
        <text x="50" y="110" textAnchor="middle" fill={textColor} fontSize="12">Need financial</text>
        <text x="50" y="125" textAnchor="middle" fill={textColor} fontSize="12">support</text>
        
        <circle cx="200" cy="50" r="40" fill={secondaryColor} opacity="0.2" />
        <text x="200" y="55" textAnchor="middle" fill={secondaryColor} fontSize="20" fontWeight="bold">49%</text>
        <text x="200" y="110" textAnchor="middle" fill={textColor} fontSize="12">Cannot cover</text>
        <text x="200" y="125" textAnchor="middle" fill={textColor} fontSize="12">€100 expense</text>
        
        <circle cx="350" cy="50" r="40" fill={accentColor} opacity="0.2" />
        <text x="350" y="55" textAnchor="middle" fill={accentColor} fontSize="20" fontWeight="bold">38%</text>
        <text x="350" y="110" textAnchor="middle" fill={textColor} fontSize="12">Lack access to</text>
        <text x="350" y="125" textAnchor="middle" fill={textColor} fontSize="12">healthcare</text>
        
        <circle cx="500" cy="50" r="40" fill={secondaryColor} opacity="0.2" />
        <text x="500" y="55" textAnchor="middle" fill={secondaryColor} fontSize="20" fontWeight="bold">500K+</text>
        <text x="500" y="110" textAnchor="middle" fill={textColor} fontSize="12">Legal counselling</text>
        <text x="500" y="125" textAnchor="middle" fill={textColor} fontSize="12">sessions</text>
      </g>
    </svg>
  );
};

// Displacement Infographic
export const DisplacementInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const primaryColor = '#3b82f6';
  const secondaryColor = '#10b981';
  const warningColor = '#f59e0b';

  return (
    <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="500" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="26" fontWeight="bold">
        Displacement & Return Dynamics (June 2025)
      </text>
      
      {/* Flow diagram */}
      <g transform="translate(100, 100)">
        {/* Left box - Currently Displaced */}
        <rect x="0" y="0" width="200" height="150" rx="15" fill={primaryColor} opacity="0.1" stroke={primaryColor} strokeWidth="2" />
        <text x="100" y="40" textAnchor="middle" fill={primaryColor} fontSize="32" fontWeight="bold">3.8M</text>
        <text x="100" y="65" textAnchor="middle" fill={textColor} fontSize="16">Currently</text>
        <text x="100" y="85" textAnchor="middle" fill={textColor} fontSize="16">Displaced</text>
        <circle cx="100" cy="120" r="5" fill={primaryColor} />
        
        {/* Right box - Returned */}
        <rect x="400" y="0" width="200" height="150" rx="15" fill={secondaryColor} opacity="0.1" stroke={secondaryColor} strokeWidth="2" />
        <text x="500" y="40" textAnchor="middle" fill={secondaryColor} fontSize="32" fontWeight="bold">4.1M</text>
        <text x="500" y="65" textAnchor="middle" fill={textColor} fontSize="16">Have</text>
        <text x="500" y="85" textAnchor="middle" fill={textColor} fontSize="16">Returned</text>
        <circle cx="500" cy="120" r="5" fill={secondaryColor} />
        
        {/* Arrow */}
        <path d="M 200 75 L 400 75" fill="none" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={textColor} />
          </marker>
        </defs>
        
        {/* Bottom section - Frontline */}
        <rect x="150" y="200" width="300" height="100" rx="15" fill={warningColor} opacity="0.1" stroke={warningColor} strokeWidth="2" />
        <text x="300" y="235" textAnchor="middle" fill={warningColor} fontSize="28" fontWeight="bold">1M+</text>
        <text x="300" y="260" textAnchor="middle" fill={textColor} fontSize="16">In frontline areas</text>
        <text x="300" y="280" textAnchor="middle" fill={textColor} fontSize="14">(Most vulnerable)</text>
      </g>
      
      {/* Legend */}
      <g transform="translate(150, 430)">
        <circle cx="0" cy="0" r="8" fill={primaryColor} />
        <text x="20" y="5" fill={textColor} fontSize="14">Internally Displaced</text>
        
        <circle cx="200" cy="0" r="8" fill={secondaryColor} />
        <text x="220" y="5" fill={textColor} fontSize="14">Returned Home</text>
        
        <circle cx="380" cy="0" r="8" fill={warningColor} />
        <text x="400" y="5" fill={textColor} fontSize="14">High Risk Areas</text>
      </g>
    </svg>
  );
};

// Civilian Casualties Infographic
export const CivilianCasualtiesInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const dangerColor = '#ef4444';
  const warningColor = '#f59e0b';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';

  return (
    <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="500" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="26" fontWeight="bold">
        Civilian Casualties: April 2025 - Deadliest Month
      </text>
      
      {/* Main stats */}
      <g transform="translate(100, 80)">
        <rect x="0" y="0" width="600" height="120" rx="10" fill={dangerColor} opacity="0.1" />
        
        <g transform="translate(50, 30)">
          <text x="0" y="30" fill={dangerColor} fontSize="48" fontWeight="bold">209</text>
          <text x="0" y="55" fill={textColor} fontSize="16">Civilians killed</text>
          
          <text x="200" y="30" fill={warningColor} fontSize="48" fontWeight="bold">1,146</text>
          <text x="200" y="55" fill={textColor} fontSize="16">Civilians injured</text>
          
          <text x="420" y="30" fill={dangerColor} fontSize="48" fontWeight="bold">97%</text>
          <text x="420" y="55" fill={textColor} fontSize="16">In Ukrainian-</text>
          <text x="420" y="75" fill={textColor} fontSize="16">controlled areas</text>
        </g>
      </g>
      
      {/* Child casualties highlight */}
      <g transform="translate(200, 240)">
        <rect x="0" y="0" width="400" height="80" rx="10" fill={dangerColor} opacity="0.2" stroke={dangerColor} strokeWidth="2" />
        <text x="200" y="35" textAnchor="middle" fill={textColor} fontSize="18" fontWeight="bold">
          Child Casualties - Highest Since June 2022
        </text>
        <text x="100" y="60" textAnchor="middle" fill={dangerColor} fontSize="24" fontWeight="bold">19 killed</text>
        <text x="300" y="60" textAnchor="middle" fill={warningColor} fontSize="24" fontWeight="bold">78 injured</text>
      </g>
      
      {/* Comparison chart */}
      <g transform="translate(150, 350)">
        <text x="0" y="0" fill={textColor} fontSize="16" fontWeight="bold">Jan-Apr 2025 vs 2024:</text>
        <rect x="0" y="20" width="200" height="30" rx="5" fill={gridColor} />
        <rect x="0" y="20" width="120" height="30" rx="5" fill={dangerColor} opacity="0.3" />
        <text x="10" y="40" fill={textColor} fontSize="14">2024</text>
        
        <rect x="0" y="60" width="200" height="30" rx="5" fill={gridColor} />
        <rect x="0" y="60" width="190" height="30" rx="5" fill={dangerColor} opacity="0.6" />
        <text x="10" y="80" fill={textColor} fontSize="14">2025</text>
        
        <text x="250" y="75" fill={dangerColor} fontSize="20" fontWeight="bold">+59% increase</text>
      </g>
      
      {/* Attack types */}
      <g transform="translate(500, 350)">
        <text x="0" y="0" fill={textColor} fontSize="16" fontWeight="bold">Primary causes:</text>
        <circle cx="10" cy="25" r="5" fill={dangerColor} />
        <text x="25" y="30" fill={textColor} fontSize="14">Missile attacks</text>
        <circle cx="10" cy="50" r="5" fill={warningColor} />
        <text x="25" y="55" fill={textColor} fontSize="14">Drone strikes</text>
        <circle cx="10" cy="75" r="5" fill={dangerColor} />
        <text x="25" y="80" fill={textColor} fontSize="14">Loitering munitions</text>
      </g>
    </svg>
  );
};

// CSO Response Infographic
export const CSOResponseInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="26" fontWeight="bold">
        Civil Society Organizations: May-June 2025 Response
      </text>
      
      {/* Organization cards */}
      <g transform="translate(50, 80)">
        {/* Razom for Ukraine */}
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="350" height="140" rx="10" fill={colors[0]} opacity="0.1" stroke={colors[0]} strokeWidth="2" />
          <text x="175" y="30" textAnchor="middle" fill={colors[0]} fontSize="20" fontWeight="bold">Razom for Ukraine</text>
          <text x="20" y="55" fill={textColor} fontSize="14">• $100,000 aid to Sumy hospitals</text>
          <text x="20" y="75" fill={textColor} fontSize="14">• 11 mobile medical units delivered</text>
          <text x="20" y="95" fill={textColor} fontSize="14">• Medical backpacks for frontline medics</text>
          <text x="20" y="115" fill={textColor} fontSize="14">• "Stabnet" mobile stabilization points</text>
        </g>
        
        {/* Serhiy Prytula Foundation */}
        <g transform="translate(400, 0)">
          <rect x="0" y="0" width="350" height="140" rx="10" fill={colors[1]} opacity="0.1" stroke={colors[1]} strokeWidth="2" />
          <text x="175" y="30" textAnchor="middle" fill={colors[1]} fontSize="20" fontWeight="bold">Serhiy Prytula Foundation</text>
          <text x="20" y="55" fill={textColor} fontSize="14">• 38 Electronic Warfare systems</text>
          <text x="20" y="75" fill={textColor} fontSize="14">• "Invisible Shield" drone defense</text>
          <text x="20" y="95" fill={textColor} fontSize="14">• European fundraising tour</text>
          <text x="20" y="115" fill={textColor} fontSize="14">• $165M raised since Feb 2022</text>
        </g>
        
        {/* IsraAID Ukraine */}
        <g transform="translate(0, 170)">
          <rect x="0" y="0" width="350" height="140" rx="10" fill={colors[2]} opacity="0.1" stroke={colors[2]} strokeWidth="2" />
          <text x="175" y="30" textAnchor="middle" fill={colors[2]} fontSize="20" fontWeight="bold">IsraAID Ukraine</text>
          <text x="20" y="55" fill={textColor} fontSize="14">• "Quokka Hub" shelter painting festivals</text>
          <text x="20" y="75" fill={textColor} fontSize="14">• Child-friendly spaces in villages</text>
          <text x="20" y="95" fill={textColor} fontSize="14">• 400,000+ people supported</text>
          <text x="20" y="115" fill={textColor} fontSize="14">• Mental health & psychosocial support</text>
        </g>
        
        {/* ZMINA Human Rights */}
        <g transform="translate(400, 170)">
          <rect x="0" y="0" width="350" height="140" rx="10" fill={colors[3]} opacity="0.1" stroke={colors[3]} strokeWidth="2" />
          <text x="175" y="30" textAnchor="middle" fill={colors[3]} fontSize="20" fontWeight="bold">ZMINA Human Rights Centre</text>
          <text x="20" y="55" fill={textColor} fontSize="14">• EU Integration Shadow Report 2025</text>
          <text x="20" y="75" fill={textColor} fontSize="14">• "Free Voices of Crimea" book launch</text>
          <text x="20" y="95" fill={textColor} fontSize="14">• War crimes documentation</text>
          <text x="20" y="115" fill={textColor} fontSize="14">• Political prisoner advocacy</text>
        </g>
      </g>
      
      {/* United24 Platform Stats */}
      <g transform="translate(100, 360)">
        <rect x="0" y="0" width="600" height="180" rx="15" fill="#1e40af" opacity="0.1" />
        <text x="300" y="35" textAnchor="middle" fill="#1e40af" fontSize="24" fontWeight="bold">United24 Platform Impact</text>
        
        <g transform="translate(50, 60)">
          <rect x="0" y="0" width="120" height="80" rx="8" fill="#3b82f6" opacity="0.2" />
          <text x="60" y="30" textAnchor="middle" fill="#3b82f6" fontSize="20" fontWeight="bold">$1.4B</text>
          <text x="60" y="50" textAnchor="middle" fill={textColor} fontSize="12">Total raised</text>
          <text x="60" y="65" textAnchor="middle" fill={textColor} fontSize="12">since 2022</text>
          
          <rect x="140" y="0" width="120" height="80" rx="8" fill="#10b981" opacity="0.2" />
          <text x="200" y="30" textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="bold">$398M</text>
          <text x="200" y="50" textAnchor="middle" fill={textColor} fontSize="12">Raised in</text>
          <text x="200" y="65" textAnchor="middle" fill={textColor} fontSize="12">2025 (4 mo)</text>
          
          <rect x="280" y="0" width="120" height="80" rx="8" fill="#f59e0b" opacity="0.2" />
          <text x="340" y="30" textAnchor="middle" fill="#f59e0b" fontSize="20" fontWeight="bold">10,852</text>
          <text x="340" y="50" textAnchor="middle" fill={textColor} fontSize="12">Drones</text>
          <text x="340" y="65" textAnchor="middle" fill={textColor} fontSize="12">delivered</text>
          
          <rect x="420" y="0" width="120" height="80" rx="8" fill="#8b5cf6" opacity="0.2" />
          <text x="480" y="30" textAnchor="middle" fill="#8b5cf6" fontSize="20" fontWeight="bold">240</text>
          <text x="480" y="50" textAnchor="middle" fill={textColor} fontSize="12">Medical evac</text>
          <text x="480" y="65" textAnchor="middle" fill={textColor} fontSize="12">vehicles</text>
        </g>
      </g>
    </svg>
  );
};

// Civil Society Roadmap Infographic
export const RoadmapInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const primaryColor = '#3b82f6';
  const secondaryColor = '#10b981';

  return (
    <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="500" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="26" fontWeight="bold">
        Civil Society Development Roadmap 2025-2026
      </text>
      
      <text x="400" y="70" textAnchor="middle" fill={textColor} fontSize="16">
        34 Key Measures to Strengthen Ukrainian Civil Society
      </text>
      
      {/* Main categories */}
      <g transform="translate(50, 100)">
        {/* Digital Innovation */}
        <g transform="translate(0, 0)">
          <circle cx="50" cy="50" r="45" fill={primaryColor} opacity="0.2" />
          <text x="50" y="55" textAnchor="middle" fill={primaryColor} fontSize="16" fontWeight="bold">Digital</text>
          <rect x="120" y="20" width="250" height="60" rx="8" fill={primaryColor} opacity="0.1" />
          <text x="130" y="40" fill={textColor} fontSize="14">• Online CSO registration via Diia</text>
          <text x="130" y="60" fill={textColor} fontSize="14">• Digital consultation platforms</text>
        </g>
        
        {/* Legal Framework */}
        <g transform="translate(400, 0)">
          <circle cx="50" cy="50" r="45" fill={secondaryColor} opacity="0.2" />
          <text x="50" y="55" textAnchor="middle" fill={secondaryColor} fontSize="16" fontWeight="bold">Legal</text>
          <rect x="120" y="20" width="250" height="60" rx="8" fill={secondaryColor} opacity="0.1" />
          <text x="130" y="40" fill={textColor} fontSize="14">• Model charters for CSOs</text>
          <text x="130" y="60" fill={textColor} fontSize="14">• Enhanced humanitarian aid laws</text>
        </g>
        
        {/* Financial Support */}
        <g transform="translate(0, 120)">
          <circle cx="50" cy="50" r="45" fill={secondaryColor} opacity="0.2" />
          <text x="50" y="55" textAnchor="middle" fill={secondaryColor} fontSize="16" fontWeight="bold">Finance</text>
          <rect x="120" y="20" width="250" height="60" rx="8" fill={secondaryColor} opacity="0.1" />
          <text x="130" y="40" fill={textColor} fontSize="14">• Tax incentives for CSOs</text>
          <text x="130" y="60" fill={textColor} fontSize="14">• Competitive grant mechanisms</text>
        </g>
        
        {/* Civic Participation */}
        <g transform="translate(400, 120)">
          <circle cx="50" cy="50" r="45" fill={primaryColor} opacity="0.2" />
          <text x="50" y="55" textAnchor="middle" fill={primaryColor} fontSize="16" fontWeight="bold">Civic</text>
          <rect x="120" y="20" width="250" height="60" rx="8" fill={primaryColor} opacity="0.1" />
          <text x="130" y="40" fill={textColor} fontSize="14">• School participatory budgets</text>
          <text x="130" y="60" fill={textColor} fontSize="14">• Volunteerism incentives</text>
        </g>
        
        {/* Service Delivery */}
        <g transform="translate(200, 240)">
          <circle cx="50" cy="50" r="45" fill="#f59e0b" opacity="0.2" />
          <text x="50" y="55" textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="bold">Services</text>
          <rect x="120" y="20" width="250" height="60" rx="8" fill="#f59e0b" opacity="0.1" />
          <text x="130" y="40" fill={textColor} fontSize="14">• CSOs as social service providers</text>
          <text x="130" y="60" fill={textColor} fontSize="14">• Public-civil society partnerships</text>
        </g>
      </g>
      
      {/* Timeline arrow */}
      <g transform="translate(100, 380)">
        <line x1="0" y1="0" x2="600" y2="0" stroke={textColor} strokeWidth="2" />
        <circle cx="0" cy="0" r="6" fill={primaryColor} />
        <text x="0" y="25" textAnchor="middle" fill={textColor} fontSize="14">Mar 2025</text>
        <text x="0" y="40" textAnchor="middle" fill={textColor} fontSize="12">Approved</text>
        
        <circle cx="300" cy="0" r="6" fill={secondaryColor} />
        <text x="300" y="25" textAnchor="middle" fill={textColor} fontSize="14">2025-2026</text>
        <text x="300" y="40" textAnchor="middle" fill={textColor} fontSize="12">Implementation</text>
        
        <circle cx="600" cy="0" r="6" fill="#f59e0b" />
        <text x="600" y="25" textAnchor="middle" fill={textColor} fontSize="14">2026</text>
        <text x="600" y="40" textAnchor="middle" fill={textColor} fontSize="12">Full Integration</text>
      </g>
    </svg>
  );
};

// European Support Network Infographic
export const EuropeSupportInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const nodeColor = '#3b82f6';
  const linkColor = '#60a5fa';

  return (
    <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="26" fontWeight="bold">
        European Civil Society Support Network
      </text>
      
      {/* Central Ukraine node */}
      <g transform="translate(400, 300)">
        <circle cx="0" cy="0" r="60" fill={nodeColor} opacity="0.3" />
        <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="18" fontWeight="bold">Ukraine</text>
      </g>
      
      {/* Support nodes */}
      <g>
        {/* Nordic Summit - Oslo */}
        <g transform="translate(200, 150)">
          <line x1="0" y1="0" x2="200" y2="150" stroke={linkColor} strokeWidth="2" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill={nodeColor} opacity="0.2" />
          <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">Oslo</text>
          <text x="0" y="-50" textAnchor="middle" fill={textColor} fontSize="12">Nordic Summit</text>
          <text x="0" y="-35" textAnchor="middle" fill={textColor} fontSize="12">June 6-7</text>
        </g>
        
        {/* Germany - Municipal Partnerships */}
        <g transform="translate(600, 150)">
          <line x1="0" y1="0" x2="-200" y2="150" stroke={linkColor} strokeWidth="2" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill={nodeColor} opacity="0.2" />
          <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">Münster</text>
          <text x="0" y="-50" textAnchor="middle" fill={textColor} fontSize="12">Municipal Conference</text>
          <text x="0" y="-35" textAnchor="middle" fill={textColor} fontSize="12">June 16-18</text>
        </g>
        
        {/* Poland - Caritas */}
        <g transform="translate(150, 350)">
          <line x1="0" y1="0" x2="250" y2="-50" stroke={linkColor} strokeWidth="2" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill={nodeColor} opacity="0.2" />
          <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">Poland</text>
          <text x="0" y="60" textAnchor="middle" fill={textColor} fontSize="12">Caritas: 30,000</text>
          <text x="0" y="75" textAnchor="middle" fill={textColor} fontSize="12">sheltered</text>
        </g>
        
        {/* Denmark - Fundraising */}
        <g transform="translate(250, 450)">
          <line x1="0" y1="0" x2="150" y2="-150" stroke={linkColor} strokeWidth="2" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill={nodeColor} opacity="0.2" />
          <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">Copenhagen</text>
          <text x="0" y="60" textAnchor="middle" fill={textColor} fontSize="12">Prytula Tour</text>
          <text x="0" y="75" textAnchor="middle" fill={textColor} fontSize="12">May 27</text>
        </g>
        
        {/* France - Strasbourg */}
        <g transform="translate(550, 450)">
          <line x1="0" y1="0" x2="-150" y2="-150" stroke={linkColor} strokeWidth="2" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill={nodeColor} opacity="0.2" />
          <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">Strasbourg</text>
          <text x="0" y="60" textAnchor="middle" fill={textColor} fontSize="12">Youth Refugees</text>
          <text x="0" y="75" textAnchor="middle" fill={textColor} fontSize="12">June 19-20</text>
        </g>
        
        {/* Italy - URC2025 */}
        <g transform="translate(650, 350)">
          <line x1="0" y1="0" x2="-250" y2="-50" stroke={linkColor} strokeWidth="2" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill={nodeColor} opacity="0.2" />
          <text x="0" y="5" textAnchor="middle" fill={textColor} fontSize="14" fontWeight="bold">Rome</text>
          <text x="0" y="60" textAnchor="middle" fill={textColor} fontSize="12">URC2025</text>
          <text x="0" y="75" textAnchor="middle" fill={textColor} fontSize="12">July 10-11</text>
        </g>
      </g>
      
      {/* Key stats */}
      <g transform="translate(100, 520)">
        <rect x="0" y="0" width="600" height="60" rx="10" fill={nodeColor} opacity="0.1" />
        <text x="150" y="25" textAnchor="middle" fill={nodeColor} fontSize="20" fontWeight="bold">€108B</text>
        <text x="150" y="45" textAnchor="middle" fill={textColor} fontSize="12">EU support total</text>
        
        <text x="300" y="25" textAnchor="middle" fill={nodeColor} fontSize="20" fontWeight="bold">90+</text>
        <text x="300" y="45" textAnchor="middle" fill={textColor} fontSize="12">Museums engaged</text>
        
        <text x="450" y="25" textAnchor="middle" fill={nodeColor} fontSize="20" fontWeight="bold">700+</text>
        <text x="450" y="45" textAnchor="middle" fill={textColor} fontSize="12">Psychosocial support</text>
      </g>
    </svg>
  );
};

// Trends Timeline Infographic
export const TrendsTimelineInfographic = ({ darkMode }) => {
  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill={bgColor} />
      
      <text x="400" y="40" textAnchor="middle" fill={textColor} fontSize="26" fontWeight="bold">
        Key Trends in Ukrainian Civil Society (May-June 2025)
      </text>
      
      {/* Trend 1 */}
      <g transform="translate(50, 100)">
        <circle cx="30" cy="30" r="25" fill={colors[0]} opacity="0.2" />
        <text x="30" y="35" textAnchor="middle" fill={colors[0]} fontSize="20" fontWeight="bold">1</text>
        <rect x="70" y="0" width="630" height="80" rx="10" fill={colors[0]} opacity="0.05" />
        <text x="80" y="25" fill={colors[0]} fontSize="18" fontWeight="bold">Dual Pressure Intensifies</text>
        <text x="80" y="45" fill={textColor} fontSize="14">Balancing urgent humanitarian needs with long-term democratic development</text>
        <text x="80" y="65" fill={textColor} fontSize="14">CSOs stretched between frontline aid and EU accession reform participation</text>
      </g>
      
      {/* Trend 2 */}
      <g transform="translate(50, 200)">
        <circle cx="30" cy="30" r="25" fill={colors[1]} opacity="0.2" />
        <text x="30" y="35" textAnchor="middle" fill={colors[1]} fontSize="20" fontWeight="bold">2</text>
        <rect x="70" y="0" width="630" height="80" rx="10" fill={colors[1]} opacity="0.05" />
        <text x="80" y="25" fill={colors[1]} fontSize="18" fontWeight="bold">Sophisticated European Advocacy</text>
        <text x="80" y="45" fill={textColor} fontSize="14">Moving from general solidarity to targeted policy influence</text>
        <text x="80" y="65" fill={textColor} fontSize="14">Direct confrontation of narrative misrepresentation (e.g., True Story Festival)</text>
      </g>
      
      {/* Trend 3 */}
      <g transform="translate(50, 300)">
        <circle cx="30" cy="30" r="25" fill={colors[2]} opacity="0.2" />
        <text x="30" y="35" textAnchor="middle" fill={colors[2]} fontSize="20" fontWeight="bold">3</text>
        <rect x="70" y="0" width="630" height="80" rx="10" fill={colors[2]} opacity="0.05" />
        <text x="80" y="25" fill={colors[2]} fontSize="18" fontWeight="bold">Technology Arms Race</text>
        <text x="80" y="45" fill={textColor} fontSize="14">CSOs directly procuring defensive tech (EW systems, drones)</text>
        <text x="80" y="65" fill={textColor} fontSize="14">Responding to escalating tech-enabled attacks on civilians</text>
      </g>
      
      {/* Trend 4 */}
      <g transform="translate(50, 400)">
        <circle cx="30" cy="30" r="25" fill={colors[3]} opacity="0.2" />
        <text x="30" y="35" textAnchor="middle" fill={colors[3]} fontSize="20" fontWeight="bold">4</text>
        <rect x="70" y="0" width="630" height="80" rx="10" fill={colors[3]} opacity="0.05" />
        <text x="80" y="25" fill={colors[3]} fontSize="18" fontWeight="bold">The Return Dilemma</text>
        <text x="80" y="45" fill={textColor} fontSize="14">Ukraine needs citizens for reconstruction vs. ongoing security threats</text>
        <text x="80" y="65" fill={textColor} fontSize="14">TPD extension discussions amid 4.1M already returned, 3.8M still displaced</text>
      </g>
      
      {/* Bottom summary */}
      <g transform="translate(100, 510)">
        <rect x="0" y="0" width="600" height="70" rx="10" fill={textColor} opacity="0.1" />
        <text x="300" y="25" textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">
          Implications for Support
        </text>
        <text x="300" y="45" textAnchor="middle" fill={textColor} fontSize="14">
          Flexible funding • Tech-aware capacity building • Rights-based return policies
        </text>
        <text x="300" y="60" textAnchor="middle" fill={textColor} fontSize="14">
          Sustained advocacy • Mental health support • Long-term integration planning
        </text>
      </g>
    </svg>
  );
};

// Export all infographics
export default {
  KeyStatisticsInfographic,
  DisplacementInfographic,
  CivilianCasualtiesInfographic,
  CSOResponseInfographic,
  RoadmapInfographic,
  EuropeSupportInfographic,
  TrendsTimelineInfographic
};