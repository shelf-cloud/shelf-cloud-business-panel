export interface IntegrationsResponse {
    integrations: { [key: string]: Integration }
    error?: string
    message?: string

}
export interface Integration {
    name: string
    description: string
    store: string
    integrationId: number
    logoLink: string
}