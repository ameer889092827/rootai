import React, { useState, useRef, useEffect } from 'react';
import { AppState, ComparisonData } from './types';
import { parseCSV, processComparison, generateDemoData } from './services/dataProcessor';
import { getRootCauseAnalysis } from './services/geminiService';
import MetricCard from './components/MetricCard';
import Charts from './components/Charts';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState(AppState.PROCESSING);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        await processDataFlow(text);
      } catch (err) {
        console.error(err);
        setState(AppState.ERROR);
      }
    };
    reader.readAsText(file);
  };

  const loadDemoData = async () => {
    setState(AppState.PROCESSING);
    const demoCsv = generateDemoData();
    await processDataFlow(demoCsv);
  };

  const processDataFlow = async (csvText: string) => {
    try {
      // 1. Parse & Calculate
      const parsed = parseCSV(csvText);
      const comparison = processComparison(parsed);
      setData(comparison);
      
      // 2. AI Analysis
      setState(AppState.ANALYZING);
      const analysisText = await getRootCauseAnalysis(comparison);
      setAiAnalysis(analysisText);
      
      setState(AppState.SUCCESS);
    } catch (err: unknown) {
      console.error(err);
      setState(AppState.ERROR);
      alert(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Root Cause AI</h1>
          </div>
          <div className="flex items-center gap-4">
             {state === AppState.SUCCESS && (
               <button 
                 onClick={() => {
                   setData(null);
                   setState(AppState.IDLE);
                 }}
                 className="text-sm font-medium text-gray-500 hover:text-gray-900"
               >
                 Reset Analysis
               </button>
             )}
             <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">MVP v1.0</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* State: IDLE / Upload */}
        {state === AppState.IDLE && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Why did your revenue change?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Upload your daily metrics CSV (Date, Revenue, Orders, Ad Spend) and let AI find the root cause of performance shifts.
            </p>

            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-indigo-600 font-semibold text-lg">Upload CSV File</span>
                <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={loadDemoData}
                className="text-sm text-gray-500 underline hover:text-indigo-600"
              >
                Use demo data instead
              </button>
            </div>

            <div className="mt-12 text-left bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <strong>CSV Format Required:</strong>
              <code className="block mt-2 bg-white p-2 rounded border border-blue-100">
                date, revenue, orders, ad_spend<br/>
                2023-10-01, 1200.50, 20, 250.00<br/>
                ...
              </code>
            </div>
          </div>
        )}

        {/* State: LOADING */}
        {(state === AppState.PROCESSING || state === AppState.ANALYZING) && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              {state === AppState.PROCESSING ? 'Processing Data...' : 'AI Analyst is thinking...'}
            </h3>
            <p className="text-gray-500 mt-2">Comparing periods and calculating variance.</p>
          </div>
        )}

        {/* State: ERROR */}
        {state === AppState.ERROR && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Analysis Failed</h3>
            <p className="text-gray-500 mt-2">Please check your CSV format and try again.</p>
            <button 
              onClick={() => setState(AppState.IDLE)}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* State: SUCCESS (Dashboard) */}
        {state === AppState.SUCCESS && data && (
          <div className="space-y-6">
            
            {/* AI Insight Hero Section */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                   <span className="bg-indigo-500/30 text-indigo-100 text-xs font-bold px-2 py-1 rounded border border-indigo-400/30 uppercase tracking-wider">
                     AI Root Cause Analysis
                   </span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
                   {aiAnalysis}
                 </h2>
               </div>
            </div>

            {/* Date Context */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Performance Dashboard
              </h2>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                Comparing: <span className="font-medium text-gray-900">Last 7 Days</span> vs <span className="font-medium text-gray-900">Previous 7 Days</span>
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Total Revenue" 
                value={formatCurrency(data.currentPeriod.totalRevenue)} 
                pctChange={data.delta.revenuePct} 
              />
              <MetricCard 
                title="Total Orders" 
                value={data.currentPeriod.totalOrders.toString()} 
                pctChange={data.delta.ordersPct} 
              />
              <MetricCard 
                title="Ad Spend" 
                value={formatCurrency(data.currentPeriod.totalAdSpend)} 
                pctChange={data.delta.adSpendPct} 
              />
              <MetricCard 
                title="Avg Order Value (AOV)" 
                value={formatCurrency(data.currentPeriod.aov)} 
                pctChange={data.delta.aovPct} 
              />
            </div>

            {/* Charts Section */}
            <Charts data={data.dataPoints} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;