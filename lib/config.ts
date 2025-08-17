export const API_CONFIG = {
  BASE_URL: "https://control-semana-hija-production.up.railway.app", // Usar proxy de Next.js para evitar CORS
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
    },
    VISITS: {
      GET_DATE: "/fecha",
    },
  },
  EXTERNAL_APIS: {
    HOLIDAYS: "https://www.feriadosapp.com/api/",
  },
} as const

export const API_URLS = {
  LOGIN: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
  GET_DATE: (date: string) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VISITS.GET_DATE}/${date}`,
  HOLIDAYS: API_CONFIG.EXTERNAL_APIS.HOLIDAYS,
} as const

// Tipos para respuestas de API
export interface LoginResponse {
  token: string
}

export interface VisitResponse {
  fechaInicio: string
  fechaFin: string
  mensaje: string
  correo: string
}

export interface Holiday {
  date: string
  name: string
  type?: string
}
