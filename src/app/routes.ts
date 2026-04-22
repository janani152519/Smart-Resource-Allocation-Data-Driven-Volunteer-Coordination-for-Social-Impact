import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import RequestHelp from "./pages/RequestHelp";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminPanel from "./pages/AdminPanel";
import MapView from "./pages/MapView";
import VolunteerLogin from "./pages/VolunteerLogin";
import HelpLogin from "./pages/HelpLogin";
import HelpDashboard from "./pages/HelpDashboard";
import QuickHelp from "./pages/QuickHelp";
import HelpRequests from "./pages/HelpRequests";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/request",
    Component: RequestHelp,
  },
  {
    path: "/volunteer",
    Component: VolunteerDashboard,
  },
  {
    path: "/volunteer-login",
    Component: VolunteerLogin,
  },
  {
    path: "/help-login",
    Component: HelpLogin,
  },
  {
    path: "/help-dashboard",
    Component: HelpDashboard,
  },
  {
    path: "/quick-help",
    Component: QuickHelp,
  },
  {
    path: "/help-requests",
    Component: HelpRequests,
  },
  {
    path: "/admin",
    Component: AdminPanel,
  },
  {
    path: "/map",
    Component: MapView,
  },
]);
