
module.exports = probotPlugin

const handlePullRequestChange = require('./lib/handle-pull-request-change')

function probotPlugin (robot) {
  robot.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize'
  ], handlePullRequestChange)

  robot.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  // robot.on('pull_request.opened', async context => {
  //   const issueComment = context.github.repos({ body: 'Thanks for creating pull request!' })
  //   return context.github.issues.createComment(issueComment)
  // })

 
}
