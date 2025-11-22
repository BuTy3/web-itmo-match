import "./src/bugtracking/bugsnag";

setTimeout(() => {
  throw new Error("Test error from local Vite");
}, 2000);
