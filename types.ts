export interface DailyData {
  date: string;
  revenue: number;
  orders: number;
  ad_spend: number;
}

export interface AggregatedMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalAdSpend: number;
  aov: number; // Average Order Value
  roas: number; // Return on Ad Spend
  conversionRateProxy: number; // Revenue / AdSpend is simplistic, so maybe Orders / AdSpend contextually
}

export interface ComparisonData {
  currentPeriod: AggregatedMetrics;
  previousPeriod: AggregatedMetrics;
  delta: {
    revenuePct: number;
    ordersPct: number;
    adSpendPct: number;
    aovPct: number;
    roasPct: number;
  };
  startDate: string;
  endDate: string;
  dataPoints: DailyData[];
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}