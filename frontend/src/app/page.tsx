"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Box, Lock, Zap, Filter, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

// Mock Data Generator
const generateTransaction = (forceFraud = false) => {
  const isFraud = forceFraud || Math.random() < 0.2;
  return {
    id: `tx_${Math.random().toString(36).substr(2, 9)}`,
    amount: (Math.random() * 1000).toFixed(2),
    sender: `User_${Math.floor(Math.random() * 1000)}`,
    receiver: `User_${Math.floor(Math.random() * 1000)}`,
    fraudScore: isFraud ? (0.8 + Math.random() * 0.2).toFixed(2) : (Math.random() * 0.3).toFixed(2),
    status: isFraud ? 'Blocked' : 'Verified',
    timestamp: new Date().toLocaleTimeString(),
  };
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    volume: 0,
  });
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'verified'>('all');
  const [walletConnected, setWalletConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate Real-time Data Stream
  useEffect(() => {
    if (!isAutoMode) return;

    const interval = setInterval(() => {
      addTransaction();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoMode]);

  const addTransaction = (forceFraud = false) => {
    const newTx = generateTransaction(forceFraud);
    setTransactions(prev => [newTx, ...prev].slice(0, 50)); // Keep last 50
    setStats(prev => ({
      total: prev.total + 1,
      blocked: newTx.status === 'Blocked' ? prev.blocked + 1 : prev.blocked,
      volume: prev.volume + parseFloat(newTx.amount),
    }));
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'blocked') return tx.status === 'Blocked';
    return tx.status === 'Verified';
  });

  const data = transactions.slice(0, 20).map((t, i) => ({
    name: t.timestamp,
    score: parseFloat(t.fraudScore) * 100,
  })).reverse();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Sentinel Ledger
          </h1>
        </div>

        <nav className="space-y-2">
          {['Dashboard', 'Live Monitor', 'Blockchain Logs', 'Model Config', 'Settings'].map((item, i) => (
            <button key={item} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${i === 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
              <Box className="w-4 h-4" />
              {item}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Operational
          </div>
          <div className="text-xs text-slate-500">Node: Localnet (Solana)</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Live Fraud Detection</h2>
            <p className="text-slate-400 text-sm">Monitoring transactions on Solana Mainnet-Beta (Simulated)</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm border transition-colors flex items-center gap-2",
                isAutoMode ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              )}
            >
              <Activity className="w-4 h-4" />
              {isAutoMode ? "Auto Stream: ON" : "Auto Stream: PAUSED"}
            </button>
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center gap-2",
                walletConnected ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              )}
            >
              <Wallet className="w-4 h-4" />
              {walletConnected ? "0x12...4A9F" : "Connect Wallet"}
            </button>
          </div>
        </header>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Transactions', value: stats.total, icon: Activity, color: 'text-blue-400' },
              { label: 'Threats Blocked', value: stats.blocked, icon: Lock, color: 'text-red-400' },
              { label: 'Volume Processed', value: `$${stats.volume.toFixed(2)}`, icon: Shield, color: 'text-green-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-slate-800 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">+2.4%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-center gap-3">
            <h3 className="text-sm font-semibold text-slate-400 mb-1">Manual Actions</h3>
            <button
              onClick={() => addTransaction(false)}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              Simulate Normal Tx
            </button>
            <button
              onClick={() => addTransaction(true)}
              className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg border border-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Simulate Fraud Attack
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Feed */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-white">Recent Transactions</h3>
              <div className="flex gap-2">
                {(['all', 'verified', 'blocked'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={clsx(
                      "text-xs px-3 py-1 rounded-full border capitalize transition-colors",
                      filter === f
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1" ref={scrollRef}>
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-lg flex items-center justify-between hover:bg-slate-800/30 transition-colors group animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.status === 'Blocked' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {tx.status === 'Blocked' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{tx.sender} → {tx.receiver}</div>
                      <div className="text-xs text-slate-500 font-mono">{tx.id} • {tx.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">${tx.amount}</div>
                    <div className={`text-xs font-medium ${parseFloat(tx.fraudScore) > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                      Risk Score: {tx.fraudScore}
                    </div>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-slate-500">No transactions found.</div>
              )}
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[600px] flex flex-col">
            <h3 className="font-semibold text-white mb-6 shrink-0">Fraud Risk Trend</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#475569" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#22d3ee' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4 shrink-0">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Model Accuracy</div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold text-white">99.4%</div>
                  <div className="text-xs text-green-400">+0.2% this week</div>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">False Positives</div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold text-white">0.12%</div>
                  <div className="text-xs text-green-400">-0.05% this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
