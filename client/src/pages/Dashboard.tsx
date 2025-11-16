import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Equine Oracle Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "Admin"}. Manage predictions and test the ML models.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Across all predictions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Model Status</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All models operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="predictor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="predictor">Prediction Tester</TabsTrigger>
            <TabsTrigger value="history">Prediction History</TabsTrigger>
            <TabsTrigger value="models">Model Info</TabsTrigger>
          </TabsList>

          <TabsContent value="predictor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Single Race Prediction</CardTitle>
                <CardDescription>
                  Test the ensemble ML model with race data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/predictor">
                  <Button>Open Predictor</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>
                  View your prediction history and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/history">
                  <Button>View History</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
                <CardDescription>
                  Details about the ensemble prediction models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Ensemble Models</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• LightGBM (ROC-AUC: 0.7893)</li>
                    <li>• Logistic Regression (ROC-AUC: 0.7893)</li>
                    <li>• Random Forest (ROC-AUC: 0.6917)</li>
                    <li>• Gradient Boosting (ROC-AUC: 0.6702)</li>
                    <li>• XGBoost (ROC-AUC: 0.6655)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
