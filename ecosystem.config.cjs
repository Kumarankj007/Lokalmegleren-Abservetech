module.exports = {
    apps: [
      {
        name: "my-express-app",
        script: "app.js",
        instances: "1",
        exec_mode: "cluster",
        watch: true,
        max_memory_restart: "500M",
      },
    ],
  };
  