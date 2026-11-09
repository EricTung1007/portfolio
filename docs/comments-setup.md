# Enable article comments (Giscus)

Article comments use GitHub Discussions in `EricTung1007/portfolio`. The site already has a Giscus component and stable article identifiers, but **Discussions is currently disabled**. It cannot render actual comments before you complete these steps.

1. Open [Repository Settings](https://github.com/EricTung1007/portfolio/settings).
2. Under **General → Features**, check **Discussions**. Save the setting if prompted.
3. Open the repository's **Discussions** tab and create or confirm a suitable category, such as **General** (or a dedicated **Comments** category). You can use an existing category.
4. Go to [giscus.app](https://giscus.app) and enter `EricTung1007/portfolio`. Complete the Giscus installation/permissions if requested. Choose **Specific discussion term** mapping and select your category.
5. Copy the category ID shown in Giscus's generated embed snippet, the value of `data-category-id`. **Do not guess this ID.**
6. Open [Actions Variables](https://github.com/EricTung1007/portfolio/settings/variables/actions), select **New repository variable** and enter:
   - `GISCUS_CATEGORY_ID` = the actual category ID from step 5
   - `GISCUS_CATEGORY` = your category name, such as `General`
7. Re-run **Deploy to GitHub Pages** in the Actions tab (or push a commit to main).

The production deployment workflow now passes these repository variables into Vite as `VITE_GISCUS_CATEGORY_ID` and `VITE_GISCUS_CATEGORY`. The Giscus widget supports English and Traditional Chinese and uses stable discussion terms (`writing/<article-slug>`).

**Notes:** Repository must be public, Discussions enabled, and Giscus installed with permission to read/write discussions. An empty category ID intentionally displays an honest setup message instead of a broken widget. Existing article comments are not migrated. If you test locally, create an untracked `.env.local` file using the corresponding `VITE_GISCUS_CATEGORY_ID` and `VITE_GISCUS_CATEGORY` variables.
