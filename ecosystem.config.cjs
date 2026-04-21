module.exports = {
  apps: [
    {
      name: 'sport-book-api',
      cwd: '/var/www/Sport-Book/api',
      script: 'dist/main.js',
      node_args: '-r module-alias/register',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'sport-book-web',
      cwd: '/var/www/Sport-Book/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3100',
      env: {
        NODE_ENV: 'production',
        HOME: '/tmp',
      },
    },
  ],
}
