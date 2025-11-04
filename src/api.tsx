const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Authentication endpoints
    auth: {
      token: '/api/token/',
      tokenRefresh: '/api/token/refresh/',
      register: '/register',
    },
    
    // Patient endpoints
    patients: {
      list: '/patients/',
      detail: (id: string | number) => `/patients/${id}`,
      vitals: (id: string | number) => `/patients/${id}/vitals`,
      medicalRecords: (id: string | number) => `/patients/${id}/records`,
      medicalRecordDetail: (patientId: string | number, recordId: string | number) => `/patients/${patientId}/records/${recordId}`,
      emergencyContact: (id: string | number) => `/patients/${id}/emergency_contact`,
      checkIns: '/patients/check-ins',
      checkInDetail: (id: string | number) => `/patients/check-ins/${id}`,
      appointments: '/patients/appointments',
      appointmentDetail: (id: string | number) => `/patients/appointments/${id}`,
    },
    
    // Staff/Doctors endpoints
    staff: {
      doctors: '/staff/doctors',
      doctorDetail: (id: string | number) => `/staff/doctors/${id}`,
    },
  },
};

// TypeScript interfaces for API data models
export interface CustomUser {
  id: number;
  username: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Patient {
  patient_id: number;
  first_name?: string;
  last_name?: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  phone_number?: string;
  email?: string;
  address: string;
  marital_status?: string;
  occupation?: string;
  emergency_contact?: EmergencyContact;
}

export interface Doctor {
  doctor_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  specialty: string;
  gender: 'Male' | 'Female';
  phone_number?: string;
  email?: string;
  address: string;
}

export interface EmergencyContact {
  contact_id: number;
  patient: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  relationship: string;
}

export interface Vitals {
  vitals_id: number;
  patient: number;
  temperature: number;
  blood_pressure: string;
  heart_rate: number;
  respiratory_rate: number;
  weight: number;
  height: number;
  bmi?: number;
}

export interface MedicalRecord {
  record_id: number;
  patient: number;
  doctor: number;
  time: string;
  reason?: string;
  diagnosis?: string;
  vitals?: Vitals;
}

export interface CheckIn {
  checkin_id: number;
  patient: number;
  doctor: number;
  checkin_time: string;
  checkout_time?: string;
  reason?: string;
  status: boolean;
}

export interface Appointment {
  appointment_id: number;
  patient: number;
  doctor: number;
  date: string;
  time: string;
  reason?: string;
  status: boolean;
}

// API Response interfaces
export interface PatientsResponse {
  patients: Patient[];
  patient_count: number;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  doctor_count: number;
}

export interface CheckInsResponse {
  checkins: CheckIn[];
  checkin_count: number;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  appointment_count: number;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

// Axios instance with default config
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if using JWT
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// ==============================================================================
// API FUNCTIONS
// ==============================================================================

// Authentication API
export const authAPI = {
  // Login with JWT token
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post(apiConfig.endpoints.auth.token, {
      username,
      password,
    });
    return response.data as AuthResponse;
  },

  // Refresh JWT token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await apiClient.post(apiConfig.endpoints.auth.tokenRefresh, {
      refresh: refreshToken,
    });
    return response.data as { access: string };
  },

  // Register new user
  register: async (userData: {
    username: string;
    password: string;
    email?: string;
    role: 'patient' | 'doctor' | 'admin';
  }): Promise<{ message: string }> => {
    const response = await apiClient.post(apiConfig.endpoints.auth.register, userData);
    return response.data as { message: string };
  },
};

// Patients API
export const patientsAPI = {
  // Get all patients
  getAll: async (): Promise<PatientsResponse> => {
    const response = await apiClient.get(apiConfig.endpoints.patients.list);
    return response.data as PatientsResponse;
  },

  // Get patient by ID
  getById: async (id: string | number): Promise<Patient> => {
    const response = await apiClient.get(apiConfig.endpoints.patients.detail(id));
    return response.data as Patient;
  },

  // Create new patient
  create: async (patientData: Omit<Patient, 'patient_id'>): Promise<Patient> => {
    const response = await apiClient.post(apiConfig.endpoints.patients.list, patientData);
    return response.data as Patient;
  },

  // Update patient
  update: async (id: string | number, patientData: Partial<Patient>): Promise<Patient> => {
    const response = await apiClient.put(apiConfig.endpoints.patients.detail(id), patientData);
    return response.data as Patient;
  },

  // Delete patient
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(apiConfig.endpoints.patients.detail(id));
  },

  // Vitals management
  vitals: {
    get: async (patientId: string | number): Promise<Vitals> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.vitals(patientId));
      return response.data as Vitals;
    },

    create: async (patientId: string | number, vitalsData: Omit<Vitals, 'vitals_id' | 'patient'>): Promise<Vitals> => {
      const response = await apiClient.post(apiConfig.endpoints.patients.vitals(patientId), vitalsData);
      return response.data as Vitals;
    },

    update: async (patientId: string | number, vitalsData: Partial<Vitals>): Promise<Vitals> => {
      const response = await apiClient.put(apiConfig.endpoints.patients.vitals(patientId), vitalsData);
      return response.data as Vitals;
    },

    delete: async (patientId: string | number, vitalsId: string | number): Promise<void> => {
      await apiClient({
        method: 'DELETE',
        url: apiConfig.endpoints.patients.vitals(patientId),
        data: { vitals_id: vitalsId }
      });
    },
  },

  // Medical records management
  medicalRecords: {
    getAll: async (patientId: string | number): Promise<MedicalRecord[]> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.medicalRecords(patientId));
      return response.data as MedicalRecord[];
    },

    getById: async (patientId: string | number, recordId: string | number): Promise<MedicalRecord> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.medicalRecordDetail(patientId, recordId));
      return response.data as MedicalRecord;
    },

    create: async (patientId: string | number, recordData: Omit<MedicalRecord, 'record_id' | 'patient' | 'time'>): Promise<MedicalRecord> => {
      const response = await apiClient.post(apiConfig.endpoints.patients.medicalRecords(patientId), recordData);
      return response.data as MedicalRecord;
    },

    update: async (patientId: string | number, recordId: string | number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
      const response = await apiClient.put(apiConfig.endpoints.patients.medicalRecordDetail(patientId, recordId), recordData);
      return response.data as MedicalRecord;
    },

    delete: async (patientId: string | number, recordId: string | number): Promise<void> => {
      await apiClient.delete(apiConfig.endpoints.patients.medicalRecordDetail(patientId, recordId));
    },
  },

  // Emergency contact management
  emergencyContact: {
    get: async (patientId: string | number): Promise<EmergencyContact> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.emergencyContact(patientId));
      return response.data as EmergencyContact;
    },

    create: async (patientId: string | number, contactData: Omit<EmergencyContact, 'contact_id' | 'patient'>): Promise<EmergencyContact> => {
      const response = await apiClient.post(apiConfig.endpoints.patients.emergencyContact(patientId), contactData);
      return response.data as EmergencyContact;
    },

    update: async (patientId: string | number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> => {
      const response = await apiClient.put(apiConfig.endpoints.patients.emergencyContact(patientId), contactData);
      return response.data as EmergencyContact;
    },

    delete: async (patientId: string | number): Promise<void> => {
      await apiClient.delete(apiConfig.endpoints.patients.emergencyContact(patientId));
    },
  },

  // Check-ins management
  checkIns: {
    getAll: async (): Promise<CheckInsResponse> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.checkIns);
      return response.data as CheckInsResponse;
    },

    getById: async (id: string | number): Promise<CheckIn> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.checkInDetail(id));
      return response.data as CheckIn;
    },

    create: async (checkInData: Omit<CheckIn, 'checkin_id' | 'checkin_time'>): Promise<CheckIn> => {
      const response = await apiClient.post(apiConfig.endpoints.patients.checkIns, checkInData);
      return response.data as CheckIn;
    },

    update: async (id: string | number): Promise<{ status: string }> => {
      const response = await apiClient.put(apiConfig.endpoints.patients.checkInDetail(id));
      return response.data as { status: string };
    },

    delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(apiConfig.endpoints.patients.checkInDetail(id));
    },
  },

  // Appointments management
  appointments: {
    getAll: async (): Promise<AppointmentsResponse> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.appointments);
      return response.data as AppointmentsResponse;
    },

    getById: async (id: string | number): Promise<Appointment> => {
      const response = await apiClient.get(apiConfig.endpoints.patients.appointmentDetail(id));
      return response.data as Appointment;
    },

    create: async (appointmentData: Omit<Appointment, 'appointment_id'>): Promise<Appointment> => {
      const response = await apiClient.post(apiConfig.endpoints.patients.appointments, appointmentData);
      return response.data as Appointment;
    },

    update: async (id: string | number, appointmentData: Partial<Appointment>): Promise<Appointment> => {
      const response = await apiClient.put(apiConfig.endpoints.patients.appointmentDetail(id), appointmentData);
      return response.data as Appointment;
    },

    delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(apiConfig.endpoints.patients.appointmentDetail(id));
    },
  },
};

// Doctors/Staff API
export const doctorsAPI = {
  // Get all doctors
  getAll: async (): Promise<DoctorsResponse> => {
    const response = await apiClient.get(apiConfig.endpoints.staff.doctors);
    return response.data as DoctorsResponse;
  },

  // Get doctor by ID
  getById: async (id: string | number): Promise<Doctor> => {
    const response = await apiClient.get(apiConfig.endpoints.staff.doctorDetail(id));
    return response.data as Doctor;
  },

  // Create new doctor
  create: async (doctorData: Omit<Doctor, 'doctor_id'>): Promise<Doctor> => {
    const response = await apiClient.post(apiConfig.endpoints.staff.doctors, doctorData);
    return response.data as Doctor;
  },

  // Update doctor
  update: async (id: string | number, doctorData: Partial<Doctor>): Promise<Doctor> => {
    const response = await apiClient.put(apiConfig.endpoints.staff.doctorDetail(id), doctorData);
    return response.data as Doctor;
  },

  // Delete doctor
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(apiConfig.endpoints.staff.doctorDetail(id));
  },
};

// Utility functions for token management
export const tokenUtils = {
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('authToken', access);
    localStorage.setItem('refreshToken', refresh);
  },

  getAccessToken: () => localStorage.getItem('authToken'),
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  removeTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },
};