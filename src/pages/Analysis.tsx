import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Resume { id: string; title: string; created_at: string; }
interface JobDescription { id: string; title: string; company: string | null; created_at: string; }
interface AnalysisReport {
  id: string;
  relevance_score: number | null;
  missing_skills: string[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvement_suggestions: string | null;
  ai_summary: string | null;
  interview_questions: string[] | null;
  created_at: string;
}

export default function Analysis() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisReport | null>(null);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);
  useEffect(() => { if (user) { loadResumes(); loadJobs(); } }, [user]);

  const loadResumes = async () => {
    const { data, error } = await supabase.from("resumes").select("id,title,created_at").order("created_at", { ascending: false });
    if (error) toast({ variant: "destructive", title: "Error", description: "Failed to load resumes" });
    else setResumes(data || []);
  };
  const loadJobs = async () => {
    const { data, error } = await supabase.from("job_descriptions").select("id,title,company,created_at").order("created_at", { ascending: false });
    if (error) toast({ variant: "destructive", title: "Error", description: "Failed to load job descriptions" });
    else setJobs(data || []);
  };

  const startAnalysis = async () => {
    if (!selectedResume || !selectedJob) {
      toast({ variant: "destructive", title: "Select items", description: "Please select a resume and job description" });
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeId: selectedResume, jobDescriptionId: selectedJob },
      });
      if (error) throw error;
      if (data?.analysis) {
        setResult(data.analysis as AnalysisReport);
        toast({ title: "Analysis complete", description: "Your report has been saved" });
      } else {
        toast({ variant: "destructive", title: "Unexpected response", description: "No analysis data returned" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Analysis failed", description: err.message || "Try again later" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Analysis</h1>
          <p className="text-muted-foreground">Select a resume and a job description to generate an AI-powered analysis report.</p>
        </div>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Start New Analysis</CardTitle>
            <CardDescription>We will securely analyze your resume with the selected job description.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resume</Label>
                <Select value={selectedResume} onValueChange={setSelectedResume}>
                  <SelectTrigger><SelectValue placeholder="Select resume" /></SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Description</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger><SelectValue placeholder="Select job description" /></SelectTrigger>
                  <SelectContent>
                    {jobs.map(j => (
                      <SelectItem key={j.id} value={j.id}>{j.title}{j.company ? ` • ${j.company}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={startAnalysis} variant="hero" disabled={isAnalyzing || resumes.length===0 || jobs.length===0}>
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/reports")}>View Reports</Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Analysis</CardTitle>
              <CardDescription>Saved at {new Date(result.created_at).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded border bg-card">
                  <div className="text-sm text-muted-foreground">Relevance Score</div>
                  <div className="text-2xl font-bold">{result.relevance_score ?? "-"}%</div>
                </div>
                <div className="p-3 rounded border bg-card">
                  <div className="text-sm text-muted-foreground">Missing Skills</div>
                  <div className="text-sm">{result.missing_skills?.join(", ") || "-"}</div>
                </div>
                <div className="p-3 rounded border bg-card">
                  <div className="text-sm text-muted-foreground">Strengths</div>
                  <div className="text-sm">{result.strengths?.join(", ") || "-"}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded border bg-card">
                  <div className="text-sm text-muted-foreground">Weaknesses</div>
                  <div className="text-sm">{result.weaknesses?.join(", ") || "-"}</div>
                </div>
                <div className="p-3 rounded border bg-card">
                  <div className="text-sm text-muted-foreground">Suggestions</div>
                  <div className="text-sm whitespace-pre-wrap">{result.improvement_suggestions || "-"}</div>
                </div>
              </div>
              <div className="p-3 rounded border bg-card">
                <div className="text-sm text-muted-foreground">AI Summary</div>
                <div className="text-sm">{result.ai_summary || "-"}</div>
              </div>
              <div className="p-3 rounded border bg-card">
                <div className="text-sm text-muted-foreground">Interview Questions</div>
                <ul className="list-disc pl-5 text-sm">
                  {result.interview_questions?.map((q, i) => (<li key={i}>{q}</li>))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
