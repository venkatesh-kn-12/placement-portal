import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, scores, targetCompany } = await request.json();
    const query = (message || '').toLowerCase();

    let response = '';

    if (query.includes('resume') || query.includes('cv')) {
      response = `For technical resumes, format using the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Keep it to 1 page, highlight measurable metrics (e.g. 'reduced latency by 40%'), and place your GitHub & live deployment links right under your name!`;
    } else if (query.includes('google') || query.includes('faang') || query.includes('tier 1')) {
      response = `For Google and Tier-1 engineering roles: Focus heavily on Tree/Graph algorithms, Dynamic Programming, and clean time/space complexity analysis. Make sure you practice talking out loud while coding!`;
    } else if (query.includes('amazon') || query.includes('leadership')) {
      response = `Amazon interviews place huge weight (50%+) on the 14/16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep). Prepare 2 STAR-method stories for each principle.`;
    } else if (query.includes('coding') || query.includes('dsa') || query.includes('leetcode')) {
      response = `Your current Coding Assessment score is strong! To reach 95%+, review Graph topological sorts, Trie lookups, and monotonic stack problems in our Learning Academy.`;
    } else if (query.includes('interview') || query.includes('hr') || query.includes('soft skills')) {
      response = `For behavioral interviews, remember: Situation, Task, Action, Result. Keep the 'Action' part at 60% of your explanation—explain what YOU personally decided and implemented.`;
    } else if (query.includes('lockdown') || query.includes('onboarding') || query.includes('assessment')) {
      response = `Complete all 3 Onboarding Assessments (Soft Skills, Aptitude, Coding) with a score > 0 to unlock all portal modules, company test simulators, and mock drives!`;
    } else {
      response = `Great question! As your Placement Coach, I recommend focusing on consistent daily DSA problem solving, validating your top projects with Faculty, and applying to matching companies in the Placement Prep tab. How can I help you prepare today?`;
    }

    return NextResponse.json({
      reply: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Chatbot error' }, { status: 500 });
  }
}
