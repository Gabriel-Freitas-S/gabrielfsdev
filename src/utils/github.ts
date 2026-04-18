/**
 * GitHub API integration utilities for syncing projects
 */

export interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    private: boolean;
    stargazers_count: number;
    topics: string[];
    pushed_at: string | null;
    language: string | null;
    languages_url?: string;
    languages?: Record<string, number>;
}

export interface ProjectData {
    github_repo_id: number;
    name: string;
    description: string;
    technologies: string[];
    is_private: number;
    github_url: string;
    live_url: string | null;
    homepage: string | null;
    stars: number;
    topics: string[];
    last_updated: string | null;
    synced_at: string;
}

/**
 * Fetch all repositories for a GitHub user
 * Includes pagination support and rate limit handling
 */
export async function fetchGitHubRepos(
    githubUsername: string,
    githubToken: string,
    maxRetries = 3
): Promise<GitHubRepo[]> {
    const sanitizedUsername = (githubUsername || "").trim();
    const sanitizedToken = (githubToken || "").trim();
    const repos: GitHubRepo[] = [];
    let page = 1;
    let hasMore = true;
    let retries = 0;

    while (hasMore && retries < maxRetries) {
        try {
            const url = new URL(
                sanitizedToken
                    ? `https://api.github.com/user/repos?type=all&per_page=100&page=${page}&sort=updated&direction=desc`
                    : `https://api.github.com/users/${sanitizedUsername}/repos?type=all&per_page=100&page=${page}&sort=updated&direction=desc`
            );

            const response = await fetch(url.toString(), {
                headers: {
                    ...(sanitizedToken ? { Authorization: `Bearer ${sanitizedToken}` } : {}),
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "gabrielfsdev-sync",
                },
            });

            // Handle rate limiting
            if (response.status === 403 || response.status === 401) {
                const rateLimitLimit = response.headers.get("x-ratelimit-limit");
                const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
                const rateLimitReset = response.headers.get("x-ratelimit-reset");
                const resetTime = rateLimitReset
                    ? new Date(parseInt(rateLimitReset) * 1000).toLocaleString()
                    : "tempo desconhecido";
                let apiMessage = "";
                try {
                    const json = await response.clone().json();
                    apiMessage = json?.message ? String(json.message) : "";
                } catch {
                    apiMessage = "";
                }

                const limit = rateLimitLimit || "unknown";
                const remaining = rateLimitRemaining || "0";

                if (response.status === 401) {
                    throw new Error(
                        `GitHub API Unauthorized (401). Token inválido/expirado ou sem permissão. ${apiMessage}`.trim()
                    );
                }

                if (parseInt(remaining) === 0) {
                    throw new Error(
                        `GitHub API Rate Limit. Limite detectado: ${limit}/hora (60=sem token, 5000=com token). Restante: ${remaining}. Reset em: ${resetTime}. ${apiMessage}`.trim()
                    );
                }

                throw new Error(
                    `GitHub API erro ${response.status}. Limite: ${limit}/hora. Restante: ${remaining}. ${apiMessage}`.trim()
                );
            }

            if (!response.ok) {
                throw new Error(
                    `GitHub API error: ${response.status} ${response.statusText}`
                );
            }

            const data: GitHubRepo[] = await response.json();

            const authHeaders = {
                ...(sanitizedToken ? { Authorization: `Bearer ${sanitizedToken}` } : {}),
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "gabrielfsdev-sync",
            };

            const reposWithLanguages = await Promise.all(
                data.map(async (repo) => {
                    if (!repo.languages_url) {
                        return repo;
                    }

                    try {
                        const languagesResponse = await fetch(repo.languages_url, {
                            headers: authHeaders,
                        });

                        if (!languagesResponse.ok) {
                            return repo;
                        }

                        const languages = (await languagesResponse.json()) as Record<string, number>;
                        return {
                            ...repo,
                            languages,
                        };
                    } catch {
                        return repo;
                    }
                })
            );

            if (reposWithLanguages.length === 0) {
                hasMore = false;
            } else {
                repos.push(...reposWithLanguages);
                page++;
            }

            retries = 0; // Reset retries on success
        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                throw error;
            }
            // Exponential backoff
            await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retries) * 1000)
            );
        }
    }

    return repos;
}

/**
 * Extract primary technologies from a repo's language and topics
 */
export function extractTechnologies(repo: GitHubRepo): string[] {
    const techs = new Map<string, string>();
    const topics = Array.isArray(repo.topics) ? repo.topics : [];

    const addTech = (value: string) => {
        const normalized = value.trim();
        if (!normalized) return;
        const key = normalized.toLowerCase();
        if (!techs.has(key)) {
            techs.set(key, normalized);
        }
    };

    // Add primary language
    if (repo.language) {
        addTech(repo.language);
    }

    // Add all languages detected by GitHub linguist
    if (repo.languages) {
        Object.keys(repo.languages).forEach((language) => addTech(language));
    }

    // Add relevant topics as technologies
    const techTopics = topics.filter((topic) => {
        const lowerTopic = topic.toLowerCase();
        // Filter out common non-tech topics
        return (
            !lowerTopic.includes("awesome") &&
            !lowerTopic.includes("template") &&
            !lowerTopic.includes("example") &&
            !lowerTopic.includes("tutorial") &&
            lowerTopic.length > 2
        );
    });

    techTopics.forEach((topic) => addTech(topic));

    return Array.from(techs.values()).slice(0, 12); // Max 12 technologies
}

/**
 * Convert GitHub repo to ProjectData format
 */
export function repoToProjectData(repo: GitHubRepo): ProjectData {
    const topics = Array.isArray(repo.topics) ? repo.topics : [];
    return {
        github_repo_id: repo.id,
        name: repo.name,
        description: repo.description || "",
        technologies: extractTechnologies(repo),
        is_private: repo.private ? 1 : 0,
        github_url: repo.html_url,
        live_url: repo.homepage || null,
        homepage: repo.homepage || null,
        stars: repo.stargazers_count,
        topics,
        last_updated: repo.pushed_at,
        synced_at: new Date().toISOString(),
    };
}

/**
 * Sync GitHub repos with the database
 */
export async function syncProjectsFromGitHub(
    env: any,
    githubUsername: string,
    githubToken: string
): Promise<{ inserted: number; updated: number; skipped: number; error?: string }> {
    try {
        if (!env?.DB) {
            return {
                inserted: 0,
                updated: 0,
                skipped: 0,
                error: "Database not available",
            };
        }

        // Fetch from GitHub
        const repos = await fetchGitHubRepos(githubUsername, githubToken);

        let inserted = 0;
        let updated = 0;

        // Sync each repo
        for (const repo of repos) {
            const projectData = repoToProjectData(repo);

            // Check if repo already exists
            const existing = await env.DB.prepare(
                "SELECT id FROM projects WHERE github_repo_id = ?"
            )
                .bind(projectData.github_repo_id)
                .first();

            if (existing) {
                // Update existing
                await env.DB.prepare(
                    `UPDATE projects 
                     SET name = ?, description = ?, technologies = ?, is_private = ?, 
                         github_url = ?, live_url = ?, homepage = ?, stars = ?, topics = ?, 
                         last_updated = ?, synced_at = ?
                     WHERE github_repo_id = ?`
                )
                    .bind(
                        projectData.name,
                        projectData.description,
                        JSON.stringify(projectData.technologies),
                        projectData.is_private,
                        projectData.github_url,
                        projectData.live_url,
                        projectData.homepage,
                        projectData.stars,
                        JSON.stringify(projectData.topics),
                        projectData.last_updated,
                        projectData.synced_at,
                        projectData.github_repo_id
                    )
                    .run();
                updated++;
            } else {
                // Insert new
                await env.DB.prepare(
                    `INSERT INTO projects 
                     (github_repo_id, name, description, technologies, is_private, 
                      github_url, live_url, homepage, stars, topics, last_updated, synced_at, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
                )
                    .bind(
                        projectData.github_repo_id,
                        projectData.name,
                        projectData.description,
                        JSON.stringify(projectData.technologies),
                        projectData.is_private,
                        projectData.github_url,
                        projectData.live_url,
                        projectData.homepage,
                        projectData.stars,
                        JSON.stringify(projectData.topics),
                        projectData.last_updated,
                        projectData.synced_at
                    )
                    .run();
                inserted++;
            }
        }

        return {
            inserted,
            updated,
            skipped: 0,
        };
    } catch (error: any) {
        return {
            inserted: 0,
            updated: 0,
            skipped: 0,
            error: error?.message || "Unknown error",
        };
    }
}
