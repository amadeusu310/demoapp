import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/create-project", "routes/create-project.tsx"),
  route("/ranking", "routes/ranking.tsx"),
  route("/about", "routes/about.tsx"),
  route("/project/:id", "routes/project.$id.tsx"),
  route("/project/:id/add-task", "routes/project.$id.add-task.tsx"),
  route("/test-supabase", "routes/test-supabase.tsx"),
  route("/account-register", "routes/account-register.tsx"),
  route("/calendar", "routes/calendar.tsx")
] satisfies RouteConfig;