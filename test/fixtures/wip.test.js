const handlePullRequestChange = require('../../lib/handle-pull-request-change')
const nock = require('nock')
const github = require('@octokit/rest')()

// prevent all network activity to ensure mocks are used
nock.disableNetConnect()

describe('handlePullRequestChange', () => {
  test('it is a function', () => {
    expect(typeof handlePullRequestChange).toBe('function')
  })


test('sets pending if no `jira id` in PR description', async () => {
    const context = buildContext()
    context.payload.pull_request.description = 'do a thing'
    const expectedBody = {
      state: 'pending',
      target_url: 'https://github.com/anuragmaher',
      description: 'WIP present check',
      context: 'Pull Request Tests'
    }

    const mock = nock('https://api.github.com')
      .get('/repos/sally/project-x/pulls/123/commits')
      .reply(200, unsemanticCommits())
      .post('/repos/sally/project-x/statuses/abcdefg', expectedBody)
      .reply(200)

    await handlePullRequestChange(context)
    expect(mock.isDone()).toBe(false)
  })

  test('sets success if `jira id` in PR description', async () => {
    const context = buildContext()
    context.payload.pull_request.description = 'JIRA URL (required):do a thing, Things to be tested (required):change in label, Collaborators (required):Dilip'
    const expectedBody = {
      state: 'success',
      target_url: 'https://github.com/anuragmaher',
      description: 'WIP present check',
      context: 'Pull Request Tests',
    
    }

    const mock = nock('https://api.github.com')
      .get('/repos/sally/project-x/pulls/123/commits')
      .reply(200, unsemanticCommits())
      .post('/repos/sally/project-x/statuses/abcdefg', expectedBody)
      .reply(200)

    await handlePullRequestChange(context)
    expect(mock.isDone()).toBe(false)
  })

  test('sets pending if no `Collaborators` in PR description', async () => {
    const context = buildContext()
    context.payload.pull_request.description = 'JIRA URL (required):do a thing, Things to be tested (required):change in label'
    
    const expectedBody = {
      state: 'pending',
      target_url: 'https://github.com/anuragmaher',
      description: 'WIP present check',
      context: 'Pull Request Tests',
    }

    const mock = nock('https://api.github.com')
      .get('/repos/sally/project-x/pulls/123/commits')
      .reply(200, unsemanticCommits())
      .post('/repos/sally/project-x/statuses/abcdefg', expectedBody)
      .reply(200)

    await handlePullRequestChange(context)
    expect(mock.isDone()).toBe(false)
  })

  test('sets pending if no `Collaborators` in PR description', async () => {
    const context = buildContext()
    context.payload.pull_request.description = ''
    
    const expectedBody = {
      state: 'pending',
      target_url: 'https://github.com/anuragmaher',
      description: 'WIP present check',
      context: 'Pull Request Tests',
    }

    const mock = nock('https://api.github.com')
      .get('/repos/sally/project-x/pulls/123/commits')
      .reply(200, unsemanticCommits())
      .post('/repos/sally/project-x/statuses/abcdefg', expectedBody)
      .reply(200)

    await handlePullRequestChange(context)
    expect(mock.isDone()).toBe(false)
  })
  

})



function buildContext (overrides) {
  const defaults = {
    log: () => { /* no-op */ },

    // an instantiated GitHub client like the one probot provides
    github: github,

    // context.repo() is a probot convenience function
    repo: (obj = {}) => {
      return Object.assign({ owner: 'sally', repo: 'project-x' }, obj)
    },

    payload: {
      pull_request: {
        number: 123,
        title: 'do a thing',
        description :'random',
        head: {
          sha: 'abcdefg'
        }
      }
    }
  }

  return Object.assign({}, defaults, overrides)
}

function unsemanticCommits () {
  return [
    { commit: { message: 'fix something' } },
    { commit: { message: 'fix something else' } }
  ]
}