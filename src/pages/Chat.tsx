import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message { id: string; role: "user" | "assistant"; content: string; }

export default function Chat() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm your resume optimization assistant. Ask me anything about improving your resume, tailoring it to a job, or ATS best practices."
  }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const mockAssistant = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("ats") || t.includes("keywords")) {
      return "Include exact keywords from the job description in your skills and experience sections. Use standard section titles (Experience, Education, Skills) and simple formatting for better ATS parsing.";
    }
    if (t.includes("summary") || t.includes("objective")) {
      return "Write a 2-3 line summary tailored to the role, highlighting years of experience, core skills, and a measurable achievement relevant to the job.";
    }
    if (t.includes("quantify") || t.includes("metrics")) {
      return "Quantify impact using metrics like % improvement, revenue, cost/time savings, throughput, or customer satisfaction. Example: 'Improved page load by 35% leading to +12% conversions.'";
    }
    if (t.includes("format") || t.includes("template")) {
      return "Use a clean reverse-chronological format, 10-12pt font, 1.0-1.15 line spacing, and consistent bullet styles. Keep to 1 page (early career) or 2 pages (senior).";
    }
    return "Tailor your resume to the job by mirroring required skills, showcasing measurable achievements, and prioritizing relevant experience. Keep language clear and active (e.g., 'Led', 'Improved', 'Reduced').";
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    try {
      // Placeholder local assistant logic to avoid external API requirements
      const answer = mockAssistant(text);
      const botMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Chat error", description: err.message || "Failed to generate response" });
    } finally {
      setIsThinking(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground">AI Chat Assistant</h1>
          <p className="text-muted-foreground">Get tips on improving your resume and tailoring it to job descriptions.</p>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={listRef} className="h-[420px] overflow-y-auto space-y-3 p-2 border rounded bg-card">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] whitespace-pre-wrap rounded p-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isThinking && <div className="text-xs text-muted-foreground">Assistant is typing…</div>}
            </div>
            <form onSubmit={send} className="mt-4 flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about ATS, keywords, summary, metrics, formatting…" />
              <Button type="submit" disabled={isThinking}>Send</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
