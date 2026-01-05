const { Octokit } = require("octokit");
require('dotenv').config();
const express = require('express');
const Groq = require("groq-sdk");
require('dotenv').config();
const postCommitComment = require('./comments.js').postCommitComment;
// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const route = express.Router();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

route.post('/webhook', async (req, res) => {
    const payload = req.body;

    const event = req.headers['x-github-event'];
    console.log(`⚓ Webhook received! Event Type: ${event}`);

    if (event === 'ping') {
        console.log("✅ GitHub connection verified! Your bridge is working.");
        return res.status(200).send('Ping received');
    }

    // Now, your safety check for the actual code push
    if (!payload.repository || !payload.commits) {
        console.log("⚠️ Ignoring non-commit event.");

    }
    if (payload.commits) {
        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;
        console.log(owner, repo);
        // Loop through the files changed in the latest commit
        for (const commit of payload.commits) {
            // 1. Fetch the full commit details to get the 'patch' (diff)
            const { data: commitData } = await octokit.rest.repos.getCommit({
                owner,
                repo,
                ref: commit.id
            });

            for (const file of commitData.files) {
                // Only analyze JS/TS files and skip deleted files
                if (file.status === "removed" || !/\.(js|jsx|ts|tsx)$/.test(file.filename)) continue;

                const patch = file.patch; // This is the "diff" showing only the changes
                const filePath = file.filename;

                // 2. Pass the PATCH to Groq instead of the full code
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                           content: `You are an elite Senior Mern-Stack Developer and Security Researcher.
                                        Analyze the NEW code additions (+) in the Git DIFF.

                            CRITERIA:
                            1. SECURITY: Check for secrets, SQLi, XSS, or broken auth.
                            2. PERFORMANCE: Check for nested loops (O(n²)), memory leaks, or unoptimized DB queries.
                            3. QUALITY: Check for "Clean Code" (naming, dry principle, long functions).

                        RESPONSE FORMAT:
                        - Start with 🔴 REJECTED (Critical Security/Perf) or 🟡 IMPROVEMENTS NEEDED (Quality) or 🟢 PASSED.
                        - **Line-by-Line breakdown** (Line numbers marked with +).
                        - **💡 AUTO-FIX**: Provide a Markdown code block with the corrected version of the code.    

                        },
                        {
                            role: "user",
                            content: Analyze these changes in ${filePath}:\n\n${patch}`
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                });

                const report = chatCompletion.choices[0]?.message?.content;

                if (report) {
                    await postCommitComment(owner, repo, commit.id, report);
                    console.log(`✅ Audit posted for changed lines in ${filePath}`);
                }
            }
        }
    }
    res.status(200).send('Analysis Complete');
});

module.exports = route;