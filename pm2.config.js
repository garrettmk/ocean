module.exports = {
  apps: [
    {
      name: 'build-server',
      script: 'npm run build:server -- --watch',
      instances: 1,
      watch: ['webpack.server-config.js']
    },
    {
      name: 'build-react',
      script: 'npm run build:react -- --watch',
      instances: 1,
      watch: ['webpack.react-config.js']
    },
    {
      name: 'serve-server',
      script: 'npm run serve:server',
      instances: 1,
      watch: ['dist/server.bundle.js']
    },
    {
      name: 'serve-react',
      script: 'npm run serve:react',
      instances: 1,
      watch: ['webpack.react-config.js']
    }
  ]
}