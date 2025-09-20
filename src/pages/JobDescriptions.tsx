import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface JobDescription {
  id: string;
  title: string;
  company: string | null;
  description: string;
  requirements: string | null;
  created_at: string;
}

export default function JobDescriptions() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<JobDescription[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) loadItems();
  }, [user]);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("job_descriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load job descriptions" });
    } else {
      setItems(data || []);
    }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.description) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title and Description are required" });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from("job_descriptions").insert({
        user_id: user.id,
        title: form.title,
        company: form.company || null,
        description: form.description,
        requirements: form.requirements || null,
      });
      if (error) throw error;
      toast({ title: "Saved", description: "Job description added" });
      setForm({ title: "", company: "", description: "", requirements: "" });
      loadItems();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Descriptions</h1>
          <p className="text-muted-foreground">Create and manage job descriptions to analyze against your resumes.</p>
        </div>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Add New Job Description</CardTitle>
            <CardDescription>Provide the details of the role you are applying for.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveItem} className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea id="requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={4} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="hero" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Job Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job descriptions yet</p>
            ) : (
              <div className="space-y-2">
                {items.map((job) => (
                  <div key={job.id} className="p-3 rounded border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{job.title}</div>
                        {job.company && <div className="text-xs text-muted-foreground">{job.company}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleString()}</div>
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
