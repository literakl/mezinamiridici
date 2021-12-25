module.exports = {
  apps: [
    {
      name: 'PROD API',
      script: 'src/start.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '600M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        NODE_PORT: 4000,
        LOG_PM2: true,
      },
    },
    {
      name: 'PROD User Ranks',
      script: 'src/jobs/cli_CalculateUserRanks.js',
      instances: 1,
      max_memory_restart: '200M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        LOG_PM2: true,
      },
    },
    {
      name: 'PROD Parse Accidents',
      script: 'src/jobs/cli_ParseAccidents.js',
      args: 'true',
      instances: 1,
      max_memory_restart: '200M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        LOG_PM2: true,
      },
    },
  ],
};
