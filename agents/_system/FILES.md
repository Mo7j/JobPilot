# Files: local-first, Drive-previewable (shared)

JobPilot is **local-first**. Every file an agent produces, the analysis report, the CV,
the application screenshot, interview notes, is written to the owner's **local** job
folder. Agents hand files to each other by **local path**. The Drive API is never used to
upload or to move files between agents. The owner keeps `JOBS_DIR` synced to Google Drive
(SETUP § 9a), which is what makes the files viewable on their phone and previewable in the
dashboard.

## The job folder
For each job, the folder is `<JOBS_DIR>/[Company] - [Title]/` (JOBS_DIR from `CONFIG.md`).
Record it once on the jobCase as `folderPath` (relative to `JOBS_DIR`).

## Writing a file (every agent)
1. **Write the file into the local job folder.** Create the folder if needed
   (`os.makedirs(..., exist_ok=True)`). That's the real output, the Drive sync delivers it.
2. **Record its local path** under the right key in `jobCase.filePaths`, e.g.
   ```
   mcp__jobpilot__update_document("jobCases", "<id>", {
     "folderPath": "[Company] - [Title]",
     "filePaths": { "analysis_report": "<JOBS_DIR>/[Company] - [Title]/analytics_report.pdf",
                    ...merge, don't overwrite other keys... }
   })
   ```
   Keys the dashboard labels: `analysis_report, company_research, resume, resume_pdf,
   cover_letter, application_answers, application_screenshot, interview_notes,
   connection_strategy`.
3. **Record a Drive preview link for the dashboard.** Use the Google Drive connector's
   **read-only search** to find the file you just wrote (in the synced
   `Jobs/[Company] - [Title]` folder) and store its `webViewLink` under the same key in
   `jobCase.driveFileUrls`. This is a quick metadata lookup, **not** an upload, it just lets
   the owner preview the file inline in the app.
   - If the Drive connector isn't connected at all, skip this and rely on `filePaths`.
   - If the file isn't found yet (just-written, mid-sync), don't block, leave the key unset
     and the next pass over this case picks it up. Nothing downstream depends on it.

## Reading another agent's file (downstream agents)
Read from the **local path** in `jobCase.filePaths` (or `folderPath` + the known filename).
**Do NOT** look up `driveFolderId` / search Drive to fetch a teammate's file, those fields
are deprecated. Example: the application-writer uploads the CV from
`filePaths.resume_pdf` (local), falling back to `resume` (.docx), then the base CV only as
a last resort.

## Approvals
When you queue an `approvalQueue` item for a file, set `attachedFilePath` to the **local
path** (always) and `driveFileUrl` to the Drive preview link **if** you recorded one. The
app's "Preview file" embeds the Drive link when present and otherwise shows the path.

## If Drive isn't connected at all
Everything still works: files are written locally, the pipeline runs on local paths, and
the dashboard shows the file location instead of an inline preview. Note it in the run
report and recommend the owner set up the Drive sync (SETUP § 9a).
