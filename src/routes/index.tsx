import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  AlertTriangle,
  ShoppingBag,
  Bug,
  GitPullRequestArrow,
  HardDrive,
  BookOpen,
  ClipboardList,
  MonitorCog,
  Trophy,
  ArrowUpRight,
  Database,
  Headphones,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workspace — Servio ITSM" },
      {
        name: "description",
        content:
          "Your Servio ITSM workspace: incidents, jobs, service catalog, changes, assets and knowledge.",
      },
      { property: "og:title", content: "Workspace — Servio ITSM" },
      {
        property: "og:description",
        content:
          "Your Servio ITSM workspace: incidents, jobs, service catalog, changes, assets and knowledge.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

const modules = [
  {
    to: "/transactions",
    label: "Transactions",
    icon: ArrowRightLeft,
    tone: "bg-primary-soft text-primary",
  },
  { to: "/masters", label: "Masters", icon: Database, tone: "bg-primary-soft text-primary" },
  {
    to: "/service-requests",
    label: "Service Requests",
    icon: Headphones,
    tone: "bg-info-soft text-info",
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    tone: "bg-primary-soft text-primary",
  },
  {
    to: "/incidents",
    label: "Incidents",
    icon: AlertTriangle,
    tone: "bg-destructive-soft text-destructive",
  },
  { to: "/jobs", label: "Jobs", icon: ClipboardList, tone: "bg-info-soft text-info" },
  {
    to: "/catalog",
    label: "Service Catalog",
    icon: ShoppingBag,
    tone: "bg-success-soft text-success",
  },
  { to: "/problems", label: "Problem", icon: Bug, tone: "bg-warning-soft text-warning" },
  {
    to: "/changes",
    label: "Change",
    icon: GitPullRequestArrow,
    tone: "bg-primary-soft text-primary",
  },
  { to: "/assets", label: "Assets", icon: HardDrive, tone: "bg-info-soft text-info" },
  {
    to: "/knowledge",
    label: "Knowledge Base",
    icon: BookOpen,
    tone: "bg-success-soft text-success",
  },
  {
    to: "/equipment",
    label: "Equipment Card",
    icon: MonitorCog,
    tone: "bg-warning-soft text-warning",
  },
  { to: "/incentive", label: "Incentive", icon: Trophy, tone: "bg-success-soft text-success" },
] as const;

import { RoleLayoutSwitcher } from "@/components/layout/RoleLayoutSwitcher";

function Workspace() {
  return <RoleLayoutSwitcher />;
}
