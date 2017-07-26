module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // Spawn 2 instances of the Leblum rest api
    {
      name: 'leblum.vendor.api.aplha',
      script: './dist/server.js',
      instances: 2,
      max_memory_restart: '500M',
      merge_logs: false,
      max_restarts: 3,
      restart_delay: 3000,
      exec_mode : "cluster",
      env: {
        NODE_ENV: 'development',
        source_map_support: true
      },
      env_staging: {
        NODE_ENV: 'staging'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],
};
