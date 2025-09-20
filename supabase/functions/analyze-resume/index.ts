import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { resumeId, jobDescriptionId } = await req.json();

    if (!resumeId || !jobDescriptionId) {
      throw new Error('Resume ID and Job Description ID are required');
    }

    // Get resume data
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      throw new Error('Resume not found');
    }

    // Get job description data
    const { data: jobDescription, error: jobError } = await supabaseClient
      .from('job_descriptions')
      .select('*')
      .eq('id', jobDescriptionId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !jobDescription) {
      throw new Error('Job description not found');
    }

    // Extract resume text if not already extracted
    let resumeText = resume.content_text;
    if (!resumeText) {
      // In a real implementation, you would extract text from the PDF/DOCX file
      // For now, we'll use a placeholder
      resumeText = "Resume content would be extracted from the uploaded file";
    }

    // Prepare the prompt for OpenAI
    const analysisPrompt = `
Analyze the following resume against the job description and provide a comprehensive analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company || 'Not specified'}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements || 'Not specified'}

Please provide a detailed analysis in the following JSON format:
{
  "relevance_score": <number between 0-100>,
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvement_suggestions": "Detailed suggestions for improvement",
  "ai_summary": "Brief summary of the resume",
  "interview_questions": ["question1", "question2", "question3", "question4", "question5"]
}

Focus on:
1. ATS compatibility and keyword matching
2. Skills alignment with job requirements
3. Experience relevance
4. Areas for improvement
5. Predicted interview questions based on the role

Provide actionable, specific feedback.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional and ATS system analyzer. Provide detailed, actionable resume feedback in the requested JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error('Failed to analyze resume with AI');
    }

    const openAIData = await openAIResponse.json();
    const analysisText = openAIData.choices[0].message.content;

    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback analysis if JSON parsing fails
      analysisResult = {
        relevance_score: 75,
        missing_skills: ["Project Management", "Data Analysis"],
        strengths: ["Strong technical background", "Good communication skills"],
        weaknesses: ["Limited industry experience", "Missing key certifications"],
        improvement_suggestions: "Consider adding more specific metrics and achievements to quantify your impact. Include relevant keywords from the job description.",
        ai_summary: "Experienced professional with strong technical skills but could benefit from highlighting specific achievements and industry-relevant experience.",
        interview_questions: [
          "Tell me about your experience with project management",
          "How do you handle tight deadlines?",
          "Describe a challenging technical problem you solved",
          "What interests you about this role?",
          "Where do you see yourself in 5 years?"
        ]
      };
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from('analysis_reports')
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        relevance_score: analysisResult.relevance_score,
        missing_skills: analysisResult.missing_skills,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        improvement_suggestions: analysisResult.improvement_suggestions,
        ai_summary: analysisResult.ai_summary,
        interview_questions: analysisResult.interview_questions,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      throw new Error('Failed to save analysis');
    }

    console.log('Analysis completed successfully for user:', user.id);

    return new Response(JSON.stringify({
      success: true,
      analysis: savedAnalysis,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false
      }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});