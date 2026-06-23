import {
  LayoutDashboard,
  Inbox,
  UserCheck,
  Package,
  UsersRound,
  Building2,
  UserRoundCheck,
  Landmark,
  BarChart3,
  FileSearch,
  ClipboardList,
  Clock,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';

export const NAV_ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  inbox: Inbox,
  'user-check': UserCheck,
  package: Package,
  'users-round': UsersRound,
  'building-2': Building2,
  'user-round-check': UserRoundCheck,
  landmark: Landmark,
  'bar-chart-3': BarChart3,
  'file-search': FileSearch,
};

export const STAGE_ICONS: Record<string, LucideIcon> = {
  'clipboard-list': ClipboardList,
  clock: Clock,
  'rotate-ccw': RotateCcw,
};
