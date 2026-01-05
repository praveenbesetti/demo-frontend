// Function to post the report as a comment on the commit
const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
async function postCommitComment(owner, repo, commit_sha, report) {
    try {
        await octokit.rest.repos.createCommitComment({
            owner: owner,
            repo: repo,
            commit_sha: commit_sha,
            body: `🤖 **AI Security Audit Report**\n\n${report}`
        });
        console.log("✅ AI Comment posted to GitHub successfully!");
    } catch (error) {
        console.error("❌ Error posting comment:", error.message);
    }
}

module.exports = { postCommitComment };