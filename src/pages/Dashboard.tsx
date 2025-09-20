import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, BarChart3, Bot } from "lucide-react";

interface Resume {
  id: string;
  title: string;
  file_name: string;
  created_at: string;
}

interface JobDescription {
  id: string;
  title: string;
  company: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      loadResumes();
      loadJobDescriptions();
    }
  }, [user]);

  const loadResumes = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resumes",
      });
    } else {
      setResumes(data || []);
    }
  };

  const loadJobDescriptions = async () => {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job descriptions",
      });
    } else {
      setJobDescriptions(data || []);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a PDF or DOCX file",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });

      loadResumes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Analyze your resume against job descriptions with AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Resume */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                Upload your resume in PDF or DOCX format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">PDF or DOCX (max 5MB)</span>
                  </Label>
                </div>

                {/* Recent Resumes */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Resumes</h4>
                  {resumes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No resumes uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {resumes.slice(0, 3).map((resume) => (
                        <div key={resume.id} className="flex items-center gap-2 p-2 rounded border bg-card">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm flex-1">{resume.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(resume.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Descriptions
              </CardTitle>
              <CardDescription>
                Save job descriptions for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => navigate("/jobs")}>
                  Add New Job Description
                </Button>

                {/* Recent Job Descriptions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Job Descriptions</h4>
                  {jobDescriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No job descriptions saved yet</p>
                  ) : (
                    <div className="space-y-2">
                      {jobDescriptions.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center gap-2 p-2 rounded border bg-card">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{job.title}</span>
                            {job.company && <p className="text-xs text-muted-foreground">{job.company}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">AI Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">Get detailed resume analysis and scoring</p>
            <Button variant="hero" size="sm" disabled={resumes.length === 0} onClick={() => navigate("/analysis")}>
              Start Analysis
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <Bot className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">AI Chat</h3>
            <p className="text-sm text-muted-foreground mb-4">Chat with AI for resume improvement tips</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/chat")}>
              Open Chat
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">View and download analysis reports</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
              View Reports
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}