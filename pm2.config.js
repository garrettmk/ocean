module.exports = {
  apps: [
    {
      name: 'build-server',
      script: 'npm run build:server',
      instances: 1,
      watch: ['webpack.server-config.js']
    },
    {
      name: 'build-react',
      script: 'npm run build:react',
      instances: 1,
      watch: ['webpack.react-config.js']
    },
    {
      name: 'serve',
      script: 'npm run start',
      instances: 1,
      watch: ['dist/server.bundle.js']
    }
  ]
}