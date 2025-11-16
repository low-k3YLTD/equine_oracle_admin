import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Zap, BarChart3, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
              <span className="font-bold text-lg">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <section className="border-b py-12 md:py-20">
            <div className="container space-y-8">
              <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Equine Oracle Admin Dashboard
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Advanced machine learning predictions for horse racing. Test ensemble models and analyze prediction accuracy.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/predictor">
                  <Button size="lg" variant="outline">
                    Test Predictor
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 md:py-20">
            <div className="container space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
                <p className="text-muted-foreground">Powerful tools for prediction testing and analysis</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                    <CardTitle>Real-time Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Get instant predictions using our ensemble ML model with five trained algorithms.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                    <CardTitle>Model Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      View individual predictions from LightGBM, Random Forest, Gradient Boosting, and more.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Shield className="h-8 w-8 text-green-500 mb-2" />
                    <CardTitle>Prediction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Track all your predictions and analyze performance metrics over time.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Models Section */}
          <section className="border-t py-12 md:py-20 bg-muted/50">
            <div className="container space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Ensemble Models</h2>
                <p className="text-muted-foreground">Powered by five trained machine learning algorithms</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">LightGBM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">ROC-AUC: 0.7893</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Logistic Regression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">ROC-AUC: 0.7893</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Random Forest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">ROC-AUC: 0.6917</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Gradient Boosting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">ROC-AUC: 0.6702</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">XGBoost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">ROC-AUC: 0.6655</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 md:py-20">
            <div className="container text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Ready to test predictions?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access the full admin dashboard with prediction testing, history tracking, and detailed model analysis.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Access Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 bg-muted/50">
          <div className="container text-center text-sm text-muted-foreground">
            <p>Equine Oracle Admin Platform © 2025. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <span className="font-bold text-lg">{APP_TITLE}</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Login</a>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b py-12 md:py-24">
          <div className="container space-y-8">
            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Equine Oracle Admin Platform
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Advanced machine learning predictions for horse racing. Test ensemble models and analyze prediction accuracy.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <a href={getLoginUrl()}>
                  Get Started <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
              <p className="text-muted-foreground">Powerful tools for prediction testing and analysis</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                  <CardTitle>Real-time Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get instant predictions using our ensemble ML model with five trained algorithms.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>Model Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    View individual predictions from LightGBM, Random Forest, Gradient Boosting, and more.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-green-500 mb-2" />
                  <CardTitle>Prediction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track all your predictions and analyze performance metrics over time.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Models Section */}
        <section className="border-t py-12 md:py-20 bg-muted/50">
          <div className="container space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Ensemble Models</h2>
              <p className="text-muted-foreground">Powered by five trained machine learning algorithms</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">LightGBM</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ROC-AUC: 0.7893</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Logistic Regression</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ROC-AUC: 0.7893</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Random Forest</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ROC-AUC: 0.6917</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gradient Boosting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ROC-AUC: 0.6702</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">XGBoost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ROC-AUC: 0.6655</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20">
          <div className="container text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ready to test predictions?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sign in to access the full admin dashboard with prediction testing, history tracking, and detailed model analysis.
            </p>
            <Button size="lg" asChild className="gap-2">
              <a href={getLoginUrl()}>
                Sign In <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Equine Oracle Admin Platform © 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
