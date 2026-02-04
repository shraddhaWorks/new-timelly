import { Permission } from "../enums/permissions";

// types/sidebar.ts
export type SidebarItem = {
  label: string;
  tab?: string;
  href?: string;
  icon: any;
  action?: "logout";
  permission?: Permission;
};
