export interface TeamMember {
  userId: number
  businessId: string
  role: string
  name: string
  username: string
  email: string
  dateAdded: string
  lastActive: string
  permissions: { [section: string]: { view: boolean; modules: { [module: string]: { view: boolean } } } }
}

export interface Modules {
  [section: string]: { icon: string; modules: string[] }
}

export interface NewTeamMember {
  name: string
  email: string
  permissions: { [section: string]: { view: boolean; icon?: string; modules: { [module: string]: { view: boolean } } } }
}

export interface ManageUser {
  userId?: number
  businessId?: string
  role?: string
  name: string
  username?: string
  email: string
  dateAdded?: string
  lastActive?: string
  permissions: { [section: string]: { view: boolean; icon?: string; modules: { [module: string]: { view: boolean } } } }
}
