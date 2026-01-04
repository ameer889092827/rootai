import { DailyData, AggregatedMetrics, ComparisonData } from '../types';

export const parseCSV = (csvText: string): DailyData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const dateIndex = headers.indexOf('date');
  const revenueIndex = headers.indexOf('revenue');
  const ordersIndex = headers.indexOf('orders');
  const adSpendIndex = headers.indexOf('ad_spend');

  if (dateIndex === -1 || revenueIndex === -1 || ordersIndex === -1 || adSpendIndex === -1) {
    throw new Error("CSV missing required columns: date, revenue, orders, ad_spend");
  }

  const data: DailyData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length < headers.length) continue;

    const date = row[dateIndex].trim();
    const revenue = parseFloat(row[revenueIndex]);
    const orders = parseInt(row[ordersIndex]);
    const ad_spend = parseFloat(row[adSpendIndex]);

    if (!isNaN(revenue)) {
      data.push({
        date,
        revenue,
        orders,
        ad_spend
      });
    }
  }

  // Sort by date ascending
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const calculateMetrics = (data: DailyData[]): AggregatedMetrics => {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const totalAdSpend = data.reduce((sum, d) => sum + d.ad_spend, 0);

  return {
    totalRevenue,
    totalOrders,
    totalAdSpend,
    aov: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    roas: totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0,
    conversionRateProxy: 0 // Not calculable without sessions, ignoring for MVP
  };
};

export const processComparison = (fullData: DailyData[]): ComparisonData => {
  // Logic: Compare last 7 days vs previous 7 days (or half vs half if small dataset)
  // For MVP robustness, let's take the last 14 days of data, split in half.
  
  const sortedData = [...fullData].reverse(); // Newest first
  
  // Default to 7 vs 7 days
  const periodLength = 7;
  
  if (sortedData.length < periodLength * 2) {
    throw new Error(`Not enough data. Need at least ${periodLength * 2} days.`);
  }

  const currentPeriodData = sortedData.slice(0, periodLength);
  const previousPeriodData = sortedData.slice(periodLength, periodLength * 2);

  const currentMetrics = calculateMetrics(currentPeriodData);
  const previousMetrics = calculateMetrics(previousPeriodData);

  const calcDelta = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const currentStartDate = currentPeriodData[currentPeriodData.length - 1].date;
  const currentEndDate = currentPeriodData[0].date;

  return {
    currentPeriod: currentMetrics,
    previousPeriod: previousMetrics,
    delta: {
      revenuePct: calcDelta(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      ordersPct: calcDelta(currentMetrics.totalOrders, previousMetrics.totalOrders),
      adSpendPct: calcDelta(currentMetrics.totalAdSpend, previousMetrics.totalAdSpend),
      aovPct: calcDelta(currentMetrics.aov, previousMetrics.aov),
      roasPct: calcDelta(currentMetrics.roas, previousMetrics.roas),
    },
    startDate: currentStartDate,
    endDate: currentEndDate,
    dataPoints: [...previousPeriodData.reverse(), ...currentPeriodData.reverse()] // Return chronological for charts
  };
};

export const generateDemoData = (): string => {
  const header = "date,revenue,orders,ad_spend\n";
  const rows = [];
  const today = new Date();
  
  // Generate 14 days of data
  // Scenario: Revenue dropped because Ad Spend was cut, but AOV is stable.
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    let revenue, orders, adSpend;

    // Previous 7 days (Healthy)
    if (i >= 7) {
      adSpend = 500 + Math.random() * 50;
      orders = 40 + Math.floor(Math.random() * 10); // ~ $12.5 CPA
      revenue = orders * (60 + Math.random() * 10); // ~$65 AOV
    } 
    // Last 7 days (Ad Spend Cut -> Rev Drop)
    else {
      adSpend = 200 + Math.random() * 20; // Massive cut
      orders = 15 + Math.floor(Math.random() * 5); 
      revenue = orders * (62 + Math.random() * 8); // AOV roughly same
    }

    rows.push(`${dateStr},${revenue.toFixed(2)},${orders},${adSpend.toFixed(2)}`);
  }
  return header + rows.join('\n');
};