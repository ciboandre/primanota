import { get } from '@vercel/edge-config'

export async function getEdgeConfig(key: string) {
  try {
    return await get(key)
  } catch (error) {
    console.error(`Error getting Edge Config key "${key}":`, error)
    return null
  }
}

// Esempi di utilizzo per l'app Prima Nota
export async function getAppConfig() {
  try {
    const config = {
      greeting: await get('greeting'),
      maintenanceMode: await get('maintenanceMode'),
      featureFlags: {
        exportPDF: await get('feature_export_pdf'),
        advancedFilters: await get('feature_advanced_filters'),
      },
    }
    return config
  } catch (error) {
    console.error('Error getting app config:', error)
    return null
  }
}
