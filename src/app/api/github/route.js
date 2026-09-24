import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const headers = {
      'User-Agent': 'PlacementPortal-App',
      Accept: 'application/vnd.github.v3+json'
    };

    // 1. Fetch User Profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (!userRes.ok) {
      return NextResponse.json({ error: 'GitHub user not found' }, { status: userRes.status });
    }
    const userData = await userRes.json();

    // 2. Fetch User's Recent Repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`,
      { headers }
    );
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // 3. Fetch Recent Public Events (Commits / Activity)
    const eventsRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=8`,
      { headers }
    );
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    // Filter commit events
    const recentActivity = eventsData
      .filter((e) => e.type === 'PushEvent' || e.type === 'CreateEvent')
      .slice(0, 5)
      .map((e) => {
        let commitMsg = '';
        if (e.payload?.commits && e.payload.commits.length > 0) {
          commitMsg = e.payload.commits[0].message;
        } else {
          commitMsg = `Created ${e.payload?.ref_type || 'repository'} in ${e.repo?.name}`;
        }
        return {
          id: e.id,
          repoName: e.repo?.name || '',
          type: e.type,
          message: commitMsg,
          date: e.created_at
        };
      });

    // Language aggregation
    const languagesMap = {};
    reposData.forEach((r) => {
      if (r.language) {
        languagesMap[r.language] = (languagesMap[r.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ language: lang, count }));

    return NextResponse.json({
      profile: {
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at
      },
      repositories: reposData.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description || 'No description provided',
        html_url: r.html_url,
        homepage: r.homepage || '',
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || 'Code',
        updated_at: r.updated_at
      })),
      activity: recentActivity,
      topLanguages
    });
  } catch (error) {
    console.error('GitHub API route error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub activity' }, { status: 500 });
  }
}
