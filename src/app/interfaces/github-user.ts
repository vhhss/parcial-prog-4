export interface GithubUser {
  avatar_url: string;
  name: string | null;
  login: string;
  public_repos: number;
  created_at: string;
  html_url: string;
}