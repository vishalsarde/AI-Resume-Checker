import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Report {
  id: string;
  created_at: string;
  relevance_score: number | null;
  missing_skills: string[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvement_suggestions: string | null;
  ai_summary: string | null;
  interview_questions: string[] | null;
  resumes: { title: string } | null;
  job_descriptions: { title: string; company: string | null } | null;
}

export default function Reports() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);
  useEffect(() => { if (user) loadReports(); }, [user]);

  const loadReports = async () => {
    const { data, error } = await supabase
      .from("analysis_reports")
      .select("id,created_at,relevance_score,missing_skills,strengths,weaknesses,improvement_suggestions,ai_summary,interview_questions,resumes(title),job_descriptions(title,company)")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load reports" });
    } else {
      setReports((data || []) as unknown as Report[]);
    }
  };

  const downloadJSON = (report: Report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis Reports</h1>
          <p className="text-muted-foreground">View and download your AI-generated analysis reports.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
            <CardDescription>Latest analyses are shown first.</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports yet. Go to Analysis to create one.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 rounded border bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {r.job_descriptions?.title || "Job"}
                          {r.job_descriptions?.company ? ` • ${r.job_descriptions.company}` : ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Resume: {r.resumes?.title || "Resume"} • {new Date(r.created_at).toLocaleString()}
                        </div>
                        <div className="text-sm">Relevance Score: <span className="font-medium">{r.relevance_score ?? "-"}%</span></div>
                        {r.ai_summary && <div className="text-sm">Summary: {r.ai_summary}</div>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => downloadJSON(r)}>Download JSON</Button>
                        <Button variant="secondary" onClick={() => window.print()}>Print</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
