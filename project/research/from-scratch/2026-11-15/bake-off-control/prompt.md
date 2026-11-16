In this folder, build two server-rendered screens with the HTML library installed in node_modules (see package.json). Its API reference is in docs/; read it before you start. Use nothing else: no other HTML library, no JSX, no template strings of raw HTML.

S1, account settings: a form with a text field (display name), a select (timezone) and a checkbox (email notifications). The server validates it: an invalid submit re-renders the form region with field errors and a 422 status; a valid one shows a success message.

S2, orders table: column headers are sort links that swap the table region, with pagination and a status filter; an empty state when no order matches.

Both screens use Tailwind classes for styling, htmx for every interaction (no other client-side JavaScript), and semantic HTML: landmarks, labelled form controls, headings.

What to write:
1. src/ in TypeScript: each screen as a render function that takes its data as typed props, plus fixture data.
2. src/render.ts, which renders with the fixtures, no server: out/s1.html, one complete HTML document showing S1 in its initial, invalid (422) and success states; and out/s2.html, one complete HTML document showing S2 with rows and its empty state.
3. Type-check with `npx tsc --noEmit` and render with `npx tsx src/render.ts`. You are done when the type-check passes with no errors and both files are written.
