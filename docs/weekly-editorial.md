# EricTung's Weekly · Editorial Office

The newspaper is an English-first, bilingual publication on your portfolio. It supports technology, research, Minerva's Den, journal entries, life, and other subjects. The name does **not** imply that publication must be weekly.

## Write and publish from the backstage

After merging this change and deploying GitHub Pages, open **`/admin/` under your deployed site's base URL**. Sveltia CMS loads as a separate static application; no custom user database is involved.

1. Select **Sign In with Token**. Create a **fine-grained personal access token** for the repository `EricTung1007/portfolio`, with **Contents: Read and write** and the minimum other permissions Sveltia specifies. Never paste this token into website source files, chat messages or public GitHub issues. Use a private browser/device: Sveltia stores the token in browser local storage.
2. Open **The Weekly · English**, select **New English article**, enter its headline, publication date, section, tags and article body. Leave **Keep as draft** enabled until it is ready.
3. When ready, turn off the draft checkbox and save/publish. The CMS writes a Markdown file to `content/posts/<slug>.md` in the GitHub repository. The existing GitHub Pages workflow rebuilds on changes to `main`.
4. Optionally open **週刊 · 繁體中文**, create an article with the **same filename/slug** as the English version, translate the body, and turn off the draft checkbox. The page's 繁中 switch will show it. A missing/unpublished translation falls back to the English article.
5. Use the category filter and the `#/weekly` newspaper route to find published articles.

**Important:** The editor's default workflow commits to `main` directly and therefore can publish once CI succeeds. The GitHub repository's existing protections, if any, still apply. This is suitable for a single owner; set up an editorial PR workflow separately if you need editorial approvals. There is no separate password stored in this repository, and the public `/admin/` HTML alone does not grant write access.

### Existing posts and front matter

Existing articles remain in `content/posts/*.md` and are editable in the English collection. Existing pages without a category are grouped under **Journal**. Articles with `draft: true` are excluded from the public list and cannot be opened through the site. An article must have an ISO `YYYY-MM-DD` date to appear.

Translations live in `content/posts/zh/<same-slug>.md` and only become public if there is a published English original with the same slug. You can write English-only articles, and existing article links (`#/writing/<slug>`) are preserved.

### Notes and limitations

- The GitHub token method is live and requires no server, but a seamless GitHub OAuth button requires an additional OAuth authenticator service. Sveltia CMS documents an optional Cloudflare Worker implementation.
- This is a **build-time** static site. Changes are visible after GitHub Pages successfully redeploys, not immediately when the editor saves.
- Use the same slug for both languages. The CMS does not automatically translate content. To avoid breaking links, do not rename an existing article's slug after publication.
- Images uploaded from the editor are stored in `public/media`. The site also supports Markdown images in articles.
- Backstage is intentionally not linked in the public website navigation. Bookmark the `/admin/` URL to access it.
- Sveltia CMS is an evolving beta product; verify its compatibility before major upgrades.

References: https://sveltiacms.app/en/docs/start and https://sveltiacms.app/en/docs/backends/github
\n\n## Scheduled releases\n\nSet `publish_on` (YYYY-MM-DD, UTC) in the editorial backstage, uncheck draft, and save. The publication build hides future-dated articles until the release date. The GitHub Pages deploy workflow runs daily at 00:10 UTC to publish eligible content, though GitHub scheduled jobs may run late; the release time is not guaranteed. Do not enter confidential information in scheduled drafts because the repository is public and the Markdown source remains visible on GitHub before publication. Leave `draft: true` to hide a post indefinitely from the live site.\n

## Editorial stamps and evidence

Available article stamps: FIELD NOTES, EXPERIMENTAL, VERIFIED and REVISED. The VERIFIED display is automatically downgraded to FIELD NOTES if there is no public HTTP(S) URL in the `sources` list. This checks only whether a reference link exists. **It does not validate the truth of the linked material or certify that a claim has been independently verified.** Editors must review the underlying evidence before using VERIFIED. Each source URL is shown in the article.
