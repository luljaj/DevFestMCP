import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Octokit } from 'octokit';
import { authOptions } from '@/lib/auth';

type RepoSummary = {
  id: number;
  full_name: string;
  html_url: string;
  default_branch: string;
  private: boolean;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const octokit = new Octokit({ auth: accessToken });
    const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
      sort: 'updated',
      direction: 'desc',
      affiliation: 'owner,collaborator,organization_member',
      per_page: 100,
    });

    const mapped: RepoSummary[] = repos.map((repo) => ({
      id: repo.id,
      full_name: repo.full_name,
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      private: repo.private,
    }));

    return NextResponse.json(
      { repos: mapped },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      },
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to load repositories', details }, { status: 500 });
  }
}
