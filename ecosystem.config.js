module.exports = {
    apps: [
      {
        name: 'Lokalmegleren-Frontend',
        namespace: 'Lokalmegleren',
        script: 'npm',
        args: 'run start',
        cwd: './', // Replace with your app's root directory if different
        max_memory_restart: '450M', // Restarts if memory usage exceeds 2GB
        watch: false, // Set to true for development, false for production
        out_file: './logs/Lokalmeglern/app-out.log',
        error_file: './logs/Lokalmeglern/app-error.log',
        log_file: './logs/Lokalmeglern/app-log.log',
        env: {
          PORT: '3004',
          NEXT_PUBLIC__BASE_URL: 'http://192.168.1.24:4005/',
        },
      },
    ],
  };