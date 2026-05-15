export type UserConfig = {
  categories: string[];
  limits: Record<string, number>;
  allocation_pct: Record<string, number>;
};

export const DEFAULT_CONFIG: Record<string, UserConfig> = {
  neon: {
    categories: ["Transporte", "Vivienda", "Ocio", "Salud", "Ropa", "Misceláneo", "Departamento", "Ahorro", "Vacaciones"],
    limits: {
      Transporte: 150000, Vivienda: 1000000, Ocio: 400000, Salud: 300000,
      Ropa: 300000, "Misceláneo": 1000000, Departamento: 700000, Ahorro: 0, Vacaciones: 0,
    },
    allocation_pct: {
      Transporte: 0.03, Vivienda: 0.23, Ocio: 0.08, Salud: 0.02,
      Ropa: 0.02, "Misceláneo": 0.18, Departamento: 0.05, Ahorro: 0.32, Vacaciones: 0.07,
    },
  },
  pachi: {
    categories: ["Transporte", "Ocio", "Salud", "Ropa", "Misceláneo", "Saula", "Vacaciones", "Ahorro", "Europa"],
    limits: {
      Transporte: 500000, Ocio: 400000, Salud: 500000, Ropa: 300000,
      "Misceláneo": 1000000, Saula: 300000, Vacaciones: 0, Ahorro: 0, Europa: 0,
    },
    allocation_pct: {
      Transporte: 0.15, Ocio: 0.10, Salud: 0.10, Ropa: 0.038,
      "Misceláneo": 0.132, Saula: 0.03, Vacaciones: 0.05, Ahorro: 0.10, Europa: 0.30,
    },
  },
};
