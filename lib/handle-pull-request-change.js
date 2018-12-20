module.exports = handlePullRequestChange

async function handlePullRequestChange (context, config) {
  const { title, head,description} = context.payload.pull_request
  const jiraPresent = description.search(/JIRA URL \(required\):\S+/) !== -1
  const needtoTest = description.search(/Things to be tested \(required\):\S+/) !== -1
 const collaborators = description.search(/Collaborators \(required\):\S+/) !== -1
 // const DeploymentType = description.search(/Deployment Type: \(required\) :\S+/) == 0          
  const state = (jiraPresent && needtoTest && collaborators)  ? 'success' : 'pending';

  const status = {
    sha: head.sha,
    state,
    target_url: 'https://github.com/anuragmaher',
    description: 'WIP present check',
    context: 'Pull Request Tests'
  }

  const result = await context.github.repos.createStatus(context.repo(status))
  return result
}
