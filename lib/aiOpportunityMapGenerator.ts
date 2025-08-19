/**
 * AI Opportunity Map Generator
 * Creates SVG visualizations for strategic planning workshops
 */

export interface OpportunityMapData {
  institutionName: string;
  overallReadinessScore: number;
  domains: {
    name: string;
    score: number;
    opportunities: string[];
    priority: 'high' | 'medium' | 'low';
  }[];
  strategicPriorities: string[];
  quickWins: string[];
  longTermGoals: string[];
}

export interface MapVisualizationOptions {
  width?: number;
  height?: number;
  colorScheme?: 'blue' | 'green' | 'purple';
  includeHeader?: boolean;
  includeMetrics?: boolean;
  workshopReady?: boolean;
}

export class AIOpportunityMapGenerator {
  /**
   * Generates an SVG opportunity map for workshop use
   */
  static generateOpportunityMap(
    data: OpportunityMapData, 
    options: MapVisualizationOptions = {}
  ): string {
    const {
      width = 1200,
      height = 800,
      colorScheme = 'blue',
      includeHeader = true,
      includeMetrics = true,
      workshopReady = true
    } = options;

    const colors = this.getColorScheme(colorScheme);
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="#f8fafc"/>`;
    
    // Header section
    if (includeHeader) {
      svg += this.generateHeader(data, width, colors);
    }
    
    // Main content area
    const contentY = includeHeader ? 120 : 20;
    const contentHeight = height - contentY - 40;
    
    // Domain readiness radar chart
    svg += this.generateRadarChart(data.domains, width * 0.4, contentY, colors);
    
    // Opportunity matrix
    svg += this.generateOpportunityMatrix(data, width * 0.55, contentY, width * 0.4, contentHeight * 0.6, colors);
    
    // Strategic priorities section
    svg += this.generateStrategicPriorities(data, width * 0.55, contentY + contentHeight * 0.65, width * 0.4, colors);
    
    // Metrics panel
    if (includeMetrics) {
      svg += this.generateMetricsPanel(data, 20, contentY + contentHeight * 0.6, width * 0.35, colors);
    }
    
    // Workshop elements
    if (workshopReady) {
      svg += this.generateWorkshopElements(data, width, height, colors);
    }
    
    svg += '</svg>';
    
    return svg;
  }

  private static getColorScheme(scheme: string) {
    const schemes = {
      blue: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        accent: '#60a5fa',
        light: '#dbeafe',
        text: '#1e40af'
      },
      green: {
        primary: '#10b981',
        secondary: '#047857',
        accent: '#34d399',
        light: '#d1fae5',
        text: '#065f46'
      },
      purple: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        light: '#ede9fe',
        text: '#6d28d9'
      }
    };
    
    return schemes[scheme as keyof typeof schemes] || schemes.blue;
  }

  private static generateHeader(data: OpportunityMapData, width: number, colors: any): string {
    return `
      <rect x="0" y="0" width="${width}" height="100" fill="${colors.primary}"/>
      <text x="40" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">
        AI Readiness Opportunity Map
      </text>
      <text x="40" y="60" font-family="Arial, sans-serif" font-size="16" fill="white">
        ${data.institutionName}
      </text>
      <text x="${width - 200}" y="35" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">
        Overall Score: ${data.overallReadinessScore}%
      </text>
      <text x="${width - 200}" y="60" font-family="Arial, sans-serif" font-size="14" fill="white">
        AI Readiness Level
      </text>
    `;
  }

  private static generateRadarChart(domains: any[], centerX: number, centerY: number, colors: any): string {
    const radius = 120;
    const center = { x: centerX, y: centerY + radius + 40 };
    const angleStep = (2 * Math.PI) / domains.length;
    
    let chart = `<g transform="translate(${center.x}, ${center.y})">`;
    
    // Grid circles
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      chart += `<circle cx="0" cy="0" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
    }
    
    // Grid lines
    domains.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      chart += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
    });
    
    // Data polygon
    let pathData = 'M';
    domains.forEach((domain, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (radius * domain.score) / 100;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      pathData += `${i === 0 ? '' : 'L'}${x},${y}`;
    });
    pathData += 'Z';
    
    chart += `<path d="${pathData}" fill="${colors.accent}" fill-opacity="0.3" stroke="${colors.primary}" stroke-width="2"/>`;
    
    // Labels
    domains.forEach((domain, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelR = radius + 30;
      const x = labelR * Math.cos(angle);
      const y = labelR * Math.sin(angle);
      
      chart += `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${colors.text}">
        ${domain.name.substring(0, 15)}${domain.name.length > 15 ? '...' : ''}
      </text>`;
      chart += `<text x="${x}" y="${y + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${colors.primary}">
        ${domain.score}%
      </text>`;
    });
    
    chart += '</g>';
    
    // Chart title
    chart += `<text x="${centerX}" y="${centerY + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}">
      Domain Readiness Scores
    </text>`;
    
    return chart;
  }

  private static generateOpportunityMatrix(data: OpportunityMapData, x: number, y: number, width: number, height: number, colors: any): string {
    let matrix = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="white" stroke="${colors.light}" stroke-width="2" rx="8"/>`;
    
    matrix += `<text x="${x + 20}" y="${y + 25}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}">
      Strategic Opportunity Matrix
    </text>`;
    
    // Quick Wins section
    matrix += `<rect x="${x + 20}" y="${y + 40}" width="${width * 0.4}" height="${height * 0.4}" fill="${colors.light}" rx="4"/>`;
    matrix += `<text x="${x + 30}" y="${y + 60}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${colors.primary}">
      Quick Wins
    </text>`;
    
    data.quickWins.slice(0, 3).forEach((win, i) => {
      matrix += `<text x="${x + 30}" y="${y + 80 + i * 20}" font-family="Arial, sans-serif" font-size="11" fill="${colors.text}">
        • ${win.substring(0, 35)}${win.length > 35 ? '...' : ''}
      </text>`;
    });
    
    // Long Term Goals section
    matrix += `<rect x="${x + width * 0.55}" y="${y + 40}" width="${width * 0.4}" height="${height * 0.4}" fill="${colors.accent}" fill-opacity="0.1" rx="4"/>`;
    matrix += `<text x="${x + width * 0.55 + 10}" y="${y + 60}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${colors.primary}">
      Long-term Goals
    </text>`;
    
    data.longTermGoals.slice(0, 3).forEach((goal, i) => {
      matrix += `<text x="${x + width * 0.55 + 10}" y="${y + 80 + i * 20}" font-family="Arial, sans-serif" font-size="11" fill="${colors.text}">
        • ${goal.substring(0, 35)}${goal.length > 35 ? '...' : ''}
      </text>`;
    });
    
    return matrix;
  }

  private static generateStrategicPriorities(data: OpportunityMapData, x: number, y: number, width: number, colors: any): string {
    let priorities = `<rect x="${x}" y="${y}" width="${width}" height="120" fill="white" stroke="${colors.light}" stroke-width="2" rx="8"/>`;
    
    priorities += `<text x="${x + 20}" y="${y + 25}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}">
      Strategic Priorities
    </text>`;
    
    data.strategicPriorities.slice(0, 4).forEach((priority, i) => {
      const priorityColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
      priorities += `<rect x="${x + 20}" y="${y + 40 + i * 18}" width="12" height="12" fill="${priorityColors[i]}" rx="2"/>`;
      priorities += `<text x="${x + 40}" y="${y + 50 + i * 18}" font-family="Arial, sans-serif" font-size="12" fill="${colors.text}">
        ${priority.substring(0, 50)}${priority.length > 50 ? '...' : ''}
      </text>`;
    });
    
    return priorities;
  }

  private static generateMetricsPanel(data: OpportunityMapData, x: number, y: number, width: number, colors: any): string {
    let metrics = `<rect x="${x}" y="${y}" width="${width}" height="140" fill="white" stroke="${colors.light}" stroke-width="2" rx="8"/>`;
    
    metrics += `<text x="${x + 20}" y="${y + 25}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}">
      Key Metrics
    </text>`;
    
    // Domain breakdown
    const topDomains = data.domains
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    topDomains.forEach((domain, i) => {
      const barWidth = (domain.score / 100) * (width - 100);
      metrics += `<rect x="${x + 20}" y="${y + 45 + i * 30}" width="${barWidth}" height="20" fill="${colors.accent}" rx="10"/>`;
      metrics += `<text x="${x + 25}" y="${y + 58 + i * 30}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white">
        ${domain.name.substring(0, 20)}
      </text>`;
      metrics += `<text x="${x + width - 40}" y="${y + 58 + i * 30}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.primary}">
        ${domain.score}%
      </text>`;
    });
    
    return metrics;
  }

  private static generateWorkshopElements(data: OpportunityMapData, width: number, height: number, colors: any): string {
    let workshop = '';
    
    // Workshop instructions box
    workshop += `<rect x="20" y="${height - 100}" width="300" height="80" fill="${colors.light}" stroke="${colors.primary}" stroke-width="1" stroke-dasharray="5,5" rx="4"/>`;
    workshop += `<text x="30" y="${height - 80}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.text}">
      Workshop Instructions:
    </text>`;
    workshop += `<text x="30" y="${height - 65}" font-family="Arial, sans-serif" font-size="10" fill="${colors.text}">
      1. Review domain scores and identify gaps
    </text>`;
    workshop += `<text x="30" y="${height - 50}" font-family="Arial, sans-serif" font-size="10" fill="${colors.text}">
      2. Prioritize quick wins for immediate impact
    </text>`;
    workshop += `<text x="30" y="${height - 35}" font-family="Arial, sans-serif" font-size="10" fill="${colors.text}">
      3. Develop 90-day action plan
    </text>`;
    
    // Notes section
    workshop += `<rect x="${width - 320}" y="${height - 100}" width="300" height="80" fill="white" stroke="${colors.primary}" stroke-width="1" stroke-dasharray="5,5" rx="4"/>`;
    workshop += `<text x="${width - 310}" y="${height - 80}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.text}">
      Workshop Notes:
    </text>`;
    
    // Add lines for notes
    for (let i = 0; i < 4; i++) {
      workshop += `<line x1="${width - 310}" y1="${height - 65 + i * 15}" x2="${width - 30}" y2="${height - 65 + i * 15}" stroke="${colors.light}" stroke-width="1"/>`;
    }
    
    return workshop;
  }

  /**
   * Generates a simplified opportunity map for quick reference
   */
  static generateSimpleOpportunityMap(data: OpportunityMapData): string {
    return this.generateOpportunityMap(data, {
      width: 800,
      height: 600,
      includeHeader: true,
      includeMetrics: false,
      workshopReady: false
    });
  }

  /**
   * Generates a workshop-ready opportunity map with interactive elements
   */
  static generateWorkshopOpportunityMap(data: OpportunityMapData): string {
    return this.generateOpportunityMap(data, {
      width: 1200,
      height: 900,
      includeHeader: true,
      includeMetrics: true,
      workshopReady: true
    });
  }

  /**
   * Exports the opportunity map data structure for external use
   */
  static exportOpportunityData(data: OpportunityMapData): string {
    return JSON.stringify(data, null, 2);
  }
}
