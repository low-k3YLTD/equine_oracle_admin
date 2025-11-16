import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const { data: predictions, isLoading } = trpc.predictions.list.useQuery({ limit: 100 });

  const getConfidenceBadgeVariant = (confidence: string) => {
    if (confidence.includes("Very High")) return "default";
    if (confidence.includes("High")) return "secondary";
    if (confidence.includes("Medium")) return "outline";
    return "destructive";
  };

  const probabilityToPercent = (prob: number) => {
    return (prob / 10000 * 100).toFixed(2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Prediction History</h1>
          <p className="text-muted-foreground">
            View all your past predictions and results
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>
              {predictions?.length || 0} predictions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : predictions && predictions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horse</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Race Type</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Ensemble %</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell className="font-medium">{prediction.horseName}</TableCell>
                        <TableCell>{prediction.track}</TableCell>
                        <TableCell>{prediction.raceType}</TableCell>
                        <TableCell>{prediction.distance}m</TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {probabilityToPercent(prediction.ensembleProbability || 0)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={getConfidenceBadgeVariant(prediction.confidence || "")}>
                            {prediction.confidence}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No predictions yet. Start by creating a new prediction.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
