module.exports = {
  apps: [
    {
      name: 'build',
      script: 'npm run build',
      instances: 1,
      watch: ['webpack.config.js']
    },
    {
      name: 'serve',
      script: 'npm run start',
      instances: 1,
      watch: ['dist/server.bundle.js']
    }
  ]
}