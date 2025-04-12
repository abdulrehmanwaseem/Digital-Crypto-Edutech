export const adminRoute = ["/admin/*"];
export const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/plans",
  "/services",
  "/pricing",
  "/feedback", // Added feedback to public routes
];

export const authRoutes = ["/login", "/register", "/error"];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
