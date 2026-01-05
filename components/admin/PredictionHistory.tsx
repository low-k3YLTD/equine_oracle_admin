// components/admin/PredictionHistory.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Download, 
  Filter,
  Calendar,
  MapPin,
  User,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PredictionHistory() {
  const [filters, setFilters] = useState({
    trackName: '',
    horseName: '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    resultStatus: 'all' as 'all' | 'won' | 'top3' | 'pending',
    page: 1,
    pageSize: 25,
  });

  const { data, isLoading } = trpc.predictions.history.useQuery(filters);
  const exportMutation = trpc.predictions.exportCsv.useMutation();

  const handleExport = async () => {
    const result = await exportMutation.mutateAsync(filters);
    
    // Create download link
    const blob = new Blob([result.csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredStats = useMemo(() => {
    if (!data) return null;
    
    const { predictions } = data;
    const settled = predictions.filter(p => p.actualPosition !== null);
    
    return {
      total: predictions.length,
      won: settled.filter(p => p.isWinner).length,
      top3: settled.filter(p => p.isTop3).length,
      pending: predictions.filter(p => p.actualPosition === null).length,
      avgConfidence: predictions.reduce((sum, p) => sum + p.confidenceScore, 0) / predictions.length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Prediction History
          </h1>
          <p className="text-slate-400 mt-2">
            Track and analyze past race predictions
          </p>
        </div>
        
        <Button
          onClick={handleExport}
          disabled={exportMutation.isLoading || !data}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {filteredStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Total Predictions</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{filteredStats.total}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Winners</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{filteredStats.won}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Top-3</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{filteredStats.top3}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{filteredStats.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {(filteredStats.avgConfidence * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Track name..."
                value={filters.trackName}
                onChange={(e) => setFilters({ ...filters, trackName: e.target.value, page: 1 })}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Horse name..."
                value={filters.horseName}
                onChange={(e) => setFilters({ ...filters, horseName: e.target.value, page: 1 })}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
            
            <Select
              value={filters.resultStatus}
              onValueChange={(value: any) => setFilters({ ...filters, resultStatus: value, page: 1 })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Result status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="won">Winners Only</SelectItem>
                <SelectItem value="top3">Top-3 Only</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setFilters({
                trackName: '',
                horseName: '',
                dateFrom: undefined,
                dateTo: undefined,
                resultStatus: 'all',
                page: 1,
                pageSize: 25,
              })}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Track</TableHead>
                  <TableHead className="text-slate-400">Horse</TableHead>
                  <TableHead className="text-slate-400">Predicted</TableHead>
                  <TableHead className="text-slate-400">Actual</TableHead>
                  <TableHead className="text-slate-400">Confidence</TableHead>
                  <TableHead className="text-slate-400">Odds</TableHead>
                  <TableHead className="text-slate-400">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400">Loading predictions...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data && data.predictions.length > 0 ? (
                  data.predictions.map((prediction, index) => (
                    <motion.tr
                      key={prediction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell className="text-slate-300">
                        {new Date(prediction.raceDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-300">{prediction.trackName}</TableCell>
                      <TableCell className="font-medium text-slate-100">{prediction.horseName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                          #{prediction.predictedPosition}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {prediction.actualPosition !== null ? (
                          <Badge 
                            variant={prediction.isWinner ? 'default' : 'secondary'}
                            className={prediction.isWinner ? 'bg-green-500/20 text-green-400' : ''}
                          >
                            #{prediction.actualPosition}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                              style={{ width: `${prediction.confidenceScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-400">
                            {(prediction.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {prediction.closingOdds?.toFixed(2) || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {prediction.actualPosition !== null ? (
                          prediction.isWinner ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : prediction.isTop3 ? (
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-500" />
                          )
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      No predictions found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-800">
              <p className="text-sm text-slate-400">
                Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{' '}
                {data.pagination.total} predictions
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="border-slate-700"
                >
                  Previous
                </Button>
                
                <span className="text-sm text-slate-400">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= data.pagination.totalPages}
                  className="border-slate-700"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
