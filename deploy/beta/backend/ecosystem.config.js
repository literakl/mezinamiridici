module.exports = {
  apps: [
    {
      name: 'bud-server',
      script: 'src/start.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'development',
        NODE_PORT: 4000,
        LOG_PM2: true,
      },
    },
    {
      name: 'bud-CalculateUserRanks',
      script: 'src/jobs/cli_CalculateUserRanks.js',
      instances: 1,
      max_memory_restart: '200M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'development',
        LOG_PM2: true,
      },
    },
    {
      name: 'bud-ParseAccidents',
      script: 'src/jobs/cli_ParseAccidents.js',
      args: 'true',
      instances: 1,
      max_memory_restart: '200M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'development',
        LOG_PM2: true,
      },
    },
  ],
};
