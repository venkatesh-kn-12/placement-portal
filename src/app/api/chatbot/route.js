import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    console.warn('Could not initialize GoogleGenerativeAI:', e);
  }
}

export async function POST(request) {
  try {
    const { message, scores } = await request.json();
    const query = (message || '').trim();

    // 1. Try real Google Gemini API first if configured
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `You are the Placement & Career AI Coach on the college campus placement portal.
Student's readiness scores: Soft Skills: ${scores?.soft_skills || 82}%, Aptitude: ${scores?.aptitude || 76}%, Coding: ${scores?.coding || 91}%.
Answer the student's question concisely (under 3-4 sentences), actionable, encouraging, and tailored to campus placements and technical interviews.
Student Question: "${query}"`;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text && text.trim().length > 0) {
          return NextResponse.json({
            reply: text.trim(),
            source: 'gemini',
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiError) {
        console.warn('Google Gemini API call failed, falling back to smart local coach:', geminiError.message);
      }
    }

    // 2. Intelligent Built-in Fallback Coach Engine
    const lower = query.toLowerCase();
    let response = '';

    if (lower.includes('resume') || lower.includes('cv')) {
      response = `For tech resumes, structure each bullet using the Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. Keep it strictly to 1 page, highlight measurable metrics (e.g. 'reduced latency by 40%'), and place your GitHub and live project URLs prominently at the top.`;
    } else if (lower.includes('google') || lower.includes('faang') || lower.includes('tier 1')) {
      response = `For Google and Tier-1 software roles: Prioritize Tree & Graph algorithms, Dynamic Programming, and rigorous time/space complexity analysis. Always practice thinking and explaining out loud while writing clean, modular code.`;
    } else if (lower.includes('amazon') || lower.includes('leadership')) {
      response = `Amazon technical interviews weight the 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep) at 50%+. Prepare 2 concrete STAR-method stories for each principle highlighting your personal contributions.`;
    } else if (lower.includes('coding') || lower.includes('dsa') || lower.includes('leetcode')) {
      response = `Your current Coding Assessment score is strong (${scores?.coding || 91}%)! To push past 95%, master Graph topological sorting, Trie prefix trees, and sliding window patterns available in our Learning Academy.`;
    } else if (lower.includes('interview') || lower.includes('hr') || lower.includes('soft skills')) {
      response = `For HR & behavioral rounds, use the STAR format (Situation, Task, Action, Result). Dedicate 60% of your time to the 'Action' phase—clearly articulating what decisions you made and why.`;
    } else if (lower.includes('lockdown') || lower.includes('onboarding') || lower.includes('assessment')) {
      response = `Complete all 3 Onboarding Assessments (Soft Skills, Aptitude, Coding) with a score > 0 to unlock all portal modules, company test simulators, and mock drives!`;
    } else {
      response = `Great question! As your Placement Coach, I recommend balancing daily DSA problem solving with faculty-verified project work. Check the Placement Prep tab for company-specific criteria and mock tests. What specific company or topic are you targeting?`;
    }

    return NextResponse.json({
      reply: response,
      source: 'placement-coach-engine',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chatbot route error:', error);
    return NextResponse.json(
      { reply: 'Hello! I am ready to help you prepare for technical interviews and campus drives.' },
      { status: 200 }
    );
  }
}
