// ===========================================
// PROJECTS SERVER FUNCTIONS
// ===========================================
// Stub file - projects schema not yet implemented
// ===========================================

export interface Project {
  id: string
  organization_id: string
  name: string
  description: string | null
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date: string | null
  end_date: string | null
  budget: number | null
  client_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateProjectInput {
  name: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
  start_date?: string
  end_date?: string
  budget?: number
  client_id?: string
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

/**
 * Get all projects for an organization
 */
export async function getProjects(organizationId: string): Promise<Project[]> {
  // TODO: Implement when projects schema exists
  console.warn('Projects schema not yet implemented')
  return []
}

/**
 * Get a project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  // TODO: Implement when projects schema exists
  console.warn('Projects schema not yet implemented')
  return null
}

/**
 * Create a new project
 */
export async function createProject(
  organizationId: string,
  input: CreateProjectInput
): Promise<Project | null> {
  // TODO: Implement when projects schema exists
  console.warn('Projects schema not yet implemented')
  return null
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<Project | null> {
  // TODO: Implement when projects schema exists
  console.warn('Projects schema not yet implemented')
  return null
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  // TODO: Implement when projects schema exists
  console.warn('Projects schema not yet implemented')
  return false
}
