import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  CheckCircle, 
  Target, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Zap,
  ArrowRight,
  Star
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: BarChart3,
      title: "AI-Powered Scoring",
      description: "Get instant ATS-style relevance scores and detailed analysis of your resume against job descriptions."
    },
    {
      icon: Target,
      title: "Skills Gap Analysis",
      description: "Identify missing skills and keywords that could improve your chances of landing the job."
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get personalized advice and improvement suggestions through our intelligent chatbot."
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Download comprehensive analysis reports with actionable insights and recommendations."
    }
  ];

  const benefits = [
    "Instant resume analysis with AI precision",
    "ATS-optimized scoring and feedback",
    "Industry-specific recommendations",
    "Interview question predictions",
    "Professional report generation"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">ResumeCheck</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative bg-gradient-hero">
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Optimize Your Resume with{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  AI Power
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Get instant, AI-powered analysis of your resume against job descriptions. 
                Improve your ATS scores, identify skill gaps, and land your dream job.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={() => navigate("/auth")}
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center text-white/80 text-sm">
                  <Star className="h-4 w-4 text-yellow-300 mr-1" />
                  <span>Free • No Credit Card Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Powerful Features for Job Seekers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive resume analysis and optimization tools 
              to help you stand out in today's competitive job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose ResumeCheck?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of professionals who have improved their job application success 
                rates with our AI-powered resume optimization platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gradient-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Analysis Report Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">ATS Compatibility Score</span>
                    <span className="text-2xl font-bold text-success">87%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skills Match</span>
                      <span className="font-medium">12/15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Keywords Found</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Improvement Areas</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      "Add more project management experience and cloud computing skills to improve your match score."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Resume?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their job prospects with AI-powered resume analysis.
          </p>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => navigate("/auth")}
            className="bg-white text-primary hover:bg-white/90 font-semibold"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-foreground">ResumeCheck</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ResumeCheck. AI-powered resume optimization platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
