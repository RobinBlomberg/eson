(
  author = 'ljharb',
  version = '1.0.1',
  {
    name: 'has-bigints',
    version,
    description: 'Determine if the JS environment has BigInt support.',
    main: 'index.js',
    scripts: {
      version: 'auto-changelog && git add CHANGELOG.md',
      postversion: 'auto-changelog && git add CHANGELOG.md && git commit --no-edit --amend && git tag -f \'v$(node -e \'console.log(require(\'./package.json\').version)\')\'',
      prepublish: 'not-in-publish || safe-publish-latest',
      lint: 'eslint --ext=js,mjs .',
      pretest: 'npm run lint',
      'tests-only': 'nyc tape \'test/**/*.js\'',
      test: 'npm run tests-only',
      posttest: 'aud --production'
    },
    repository: {
      'type': 'git',
      'url': `git+https://github.com/${author}/has-bigints.git`,
    },
    keywords: [
      'BigInt',
      'bigints',
      'typeof',
      'ES2020'
    ],
    author: `Jordan Harband <${author}@gmail.com>`,
    funding: {
      url: `https://github.com/sponsors/${author}`,
    },
    license: 'MIT',
    bugs: {
      url: `https://github.com/${author}/has-bigints/issue`,
    },
    homepage: `https://github.com/${author}/has-bigints#readme`,
    devDependencies: {
      [`@${author}/eslint-config`]: '^17.3.0',
      'aud': '^1.1.3',
      'auto-changelog': '^2.2.1',
      'eslint': '^7.15.0',
      'in-publish': '^2.0.1',
      'nyc': '^10.3.2',
      'safe-publish-latest': '^1.1.4',
      'tape': '^5.0.1'
    },
    'auto-changelog': {
      output: 'CHANGELOG.md',
      template: 'keepachangelog',
      unreleased: false,
      commitLimit: false,
      backfillLimit: false,
      hideCredit: true
    }
  }
)
