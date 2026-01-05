// components/admin/AnalyticsDashboard.tsx
"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsDashboardProps {
  days?: number;
}

export function AnalyticsDashboard({ days = 30 }: AnalyticsDashboardProps) {
  const { data, isLoading, error } = trpc.predictions.dashboard.useQuery({ days });

  const statCards = useMemo(() => {
    if (!data) return [];
    
    const { overview } = data;
    
    return [
      {
        title: 'Top-1 Accuracy',
        value: `${(overview.top1Accuracy * 100).toFixed(2)}%`,
        change: '+5.8%',
        trend: 'up',
        icon: Target,
        color: 'blue',
        target: '40%',
        current: overview.top1Accuracy,
      },
      {
        title: 'ROI',
        value: `${overview.roi.toFixed(2)}%`,
        change: '+12.3%',
        trend: 'up',
        icon: DollarSign,
        color: 'green',
        target: '15%',
        current: overview.roi / 100,
      },
      {
        title: 'Market Beat Rate',
        value: `${(overview.marketBeatRate * 100).toFixed(1)}%`,
        change: '+3.2%',
        trend: 'up',
        icon: TrendingUp,
        color: 'purple',
        target: '55%',
        current: overview.marketBeatRate,
      },
      {
        title: 'NDCG@4',
        value: overview.ndcg4.toFixed(4),
        change: 'Stable',
        trend: 'stable',
        icon: Activity,
        color: 'cyan',
        target: '0.875',
        current: overview.ndcg4,
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-slate-400">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Performance metrics for the last {days} days • {data.overview.evaluationPeriod.totalRaces} races analyzed
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const targetValue = parseFloat(stat.target.replace('%', '')) / 100;
          const progressPercentage = (stat.current / targetValue) * 100;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:border-slate-700/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <Badge 
                      variant={stat.trend === 'up' ? 'default' : 'secondary'}
                      className={stat.trend === 'up' ? 'bg-green-500/20 text-green-400' : ''}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
                    
                    {/* Progress to target */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Target: {stat.target}</span>
                        <span className={`font-medium ${progressPercentage >= 100 ? 'text-green-400' : 'text-slate-400'}`}>
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                          className={`h-full bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-400`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Trend Chart */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Trend</span>
            <Badge variant="outline" className="text-slate-400">
              {days} Day View
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.performanceTrend}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, '']}
              />
              <Legend />
              
              <ReferenceLine y={0.40} stroke="#ef4444" strokeDasharray="3 3" label="Target Accuracy" />
              
              <Area 
                type="monotone" 
                dataKey="top1Accuracy" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#colorAccuracy)"
                name="Top-1 Accuracy"
              />
              <Area 
                type="monotone" 
                dataKey="roi" 
                stroke="#10b981" 
                fillOpacity={1}
                fill="url(#colorROI)"
                name="ROI"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Track Performance Breakdown */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Track Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.trackPerformance.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="trackName" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
              
              <Bar dataKey="top1Accuracy" fill="#3b82f6" name="Top-1 Accuracy" />
              <Bar dataKey="marketBeatRate" fill="#8b5cf6" name="Market Beat Rate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Health */}
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Model Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.modelHealth.map((model) => (
                <div key={model.modelName} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {model.status === 'healthy' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="font-medium">{model.modelName}</p>
                      <p className="text-sm text-slate-400">
                        Avg Latency: {model.avgLatency}ms • Error Rate: {(model.errorRate * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={model.status === 'healthy' ? 'default' : 'destructive'}
                    className={model.status === 'healthy' ? 'bg-green-500/20 text-green-400' : ''}
                  >
                    {model.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Alerts</span>
              <Badge variant="destructive">
                {data.alerts.filter(a => !a.acknowledged).length} New
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === 'critical' 
                      ? 'bg-red-500/10 border-red-500/50' 
                      : alert.severity === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/50'
                      : 'bg-blue-500/10 border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(alert.timestamp).toLocaleString()} • {alert.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Breakdown (Ensemble Composition) */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Ensemble Model Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart - Model Weights */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.overview.modelBreakdown}
                  dataKey="weight"
                  nameKey="modelName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.modelName}: ${(entry.weight * 100).toFixed(0)}%`}
                >
                  {data.overview.modelBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Model Accuracy Comparison */}
            <div className="space-y-4">
              {data.overview.modelBreakdown?.map((model, index) => (
                <div key={model.modelName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{model.modelName}</span>
                    <span className="text-sm text-slate-400">
                      {(model.accuracy * 100).toFixed(2)}% accuracy
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${model.accuracy * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r"
                      style={{
                        background: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
