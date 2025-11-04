// Example usage of the HMS API functions
// This file demonstrates how to use all the API endpoints in your React components

import { useState, useEffect } from 'react';
import {
  authAPI,
  patientsAPI,
  doctorsAPI,
  tokenUtils,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  Vitals,
  EmergencyContact,
  CheckIn
} from './api';

// ==============================================================================
// AUTHENTICATION EXAMPLES
// ==============================================================================

export const AuthExample = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      tokenUtils.setTokens(response.access, response.refresh);
      setIsLoggedIn(true);
      setLoginError('');
      console.log('Login successful!');
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoginError(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await authAPI.register({
        username: 'newuser',
        password: 'securePassword123',
        email: 'user@example.com',
        role: 'patient'
      });
      console.log('Registration successful:', response.message);
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };

  const handleLogout = () => {
    tokenUtils.removeTokens();
    setIsLoggedIn(false);
  };

  return (
    <div>
      {/* Your login form UI here */}
      <p>Authentication status: {isLoggedIn ? 'Logged in' : 'Not logged in'}</p>
      {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
    </div>
  );
};

// ==============================================================================
// PATIENTS API EXAMPLES
// ==============================================================================

export const PatientsExample = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.patients);
      console.log(`Found ${response.patient_count} patients`);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get specific patient
  const fetchPatient = async (patientId: number) => {
    try {
      const patient = await patientsAPI.getById(patientId);
      setSelectedPatient(patient);
      console.log('Patient details:', patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  // Create new patient
  const createPatient = async () => {
    try {
      const newPatient = await patientsAPI.create({
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        gender: 'Male',
        phone_number: '+1234567890',
        email: 'john.doe@email.com',
        address: '123 Main St, City, State',
        marital_status: 'Single',
        occupation: 'Software Engineer'
      });
      console.log('Patient created:', newPatient);
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  // Update patient
  const updatePatient = async (patientId: number) => {
    try {
      const updatedPatient = await patientsAPI.update(patientId, {
        phone_number: '+0987654321',
        occupation: 'Senior Software Engineer'
      });
      console.log('Patient updated:', updatedPatient);
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  // Delete patient
  const deletePatient = async (patientId: number) => {
    try {
      await patientsAPI.delete(patientId);
      console.log('Patient deleted successfully');
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <div>
          <h3>Patients ({patients.length})</h3>
          <button onClick={createPatient}>Add New Patient</button>
          {patients.map(patient => (
            <div key={patient.patient_id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <p><strong>{patient.first_name} {patient.last_name}</strong></p>
              <p>Email: {patient.email}</p>
              <p>Phone: {patient.phone_number}</p>
              <button onClick={() => fetchPatient(patient.patient_id)}>View Details</button>
              <button onClick={() => updatePatient(patient.patient_id)}>Update</button>
              <button onClick={() => deletePatient(patient.patient_id)} style={{ color: 'red' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// PATIENT VITALS EXAMPLES
// ==============================================================================

export const VitalsExample = () => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [patientId] = useState(1); // Example patient ID

  // Get patient vitals
  const fetchVitals = async () => {
    try {
      const patientVitals = await patientsAPI.vitals.get(patientId);
      setVitals(patientVitals);
      console.log('Patient vitals:', patientVitals);
    } catch (error) {
      console.error('Error fetching vitals:', error);
    }
  };

  // Create new vitals record
  const createVitals = async () => {
    try {
      const newVitals = await patientsAPI.vitals.create(patientId, {
        temperature: 37.5,
        blood_pressure: '120/80',
        heart_rate: 72,
        respiratory_rate: 16,
        weight: 70.5,
        height: 1.75
      });
      console.log('Vitals created:', newVitals);
      setVitals(newVitals);
    } catch (error) {
      console.error('Error creating vitals:', error);
    }
  };

  // Update vitals
  const updateVitals = async () => {
    if (!vitals) return;
    try {
      const updatedVitals = await patientsAPI.vitals.update(patientId, {
        vitals_id: vitals.vitals_id,
        temperature: 36.8,
        heart_rate: 68
      });
      console.log('Vitals updated:', updatedVitals);
      setVitals(updatedVitals);
    } catch (error) {
      console.error('Error updating vitals:', error);
    }
  };

  return (
    <div>
      <h3>Patient Vitals</h3>
      <button onClick={fetchVitals}>Fetch Vitals</button>
      <button onClick={createVitals}>Add New Vitals</button>
      {vitals && (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <p><strong>Vitals ID:</strong> {vitals.vitals_id}</p>
          <p><strong>Temperature:</strong> {vitals.temperature}°C</p>
          <p><strong>Blood Pressure:</strong> {vitals.blood_pressure}</p>
          <p><strong>Heart Rate:</strong> {vitals.heart_rate} bpm</p>
          <p><strong>Respiratory Rate:</strong> {vitals.respiratory_rate} /min</p>
          <p><strong>Weight:</strong> {vitals.weight} kg</p>
          <p><strong>Height:</strong> {vitals.height} m</p>
          <p><strong>BMI:</strong> {vitals.bmi}</p>
          <button onClick={updateVitals}>Update Vitals</button>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// APPOINTMENTS EXAMPLES
// ==============================================================================

export const AppointmentsExample = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const response = await patientsAPI.appointments.getAll();
      setAppointments(response.appointments);
      console.log(`Found ${response.appointment_count} appointments`);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Create new appointment
  const createAppointment = async () => {
    try {
      const newAppointment = await patientsAPI.appointments.create({
        patient: 1, // Patient ID
        doctor: 1,  // Doctor ID
        date: '2024-12-15',
        time: '10:00',
        reason: 'Regular checkup',
        status: false
      });
      console.log('Appointment created:', newAppointment);
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number) => {
    try {
      const updatedAppointment = await patientsAPI.appointments.update(appointmentId, {
        status: true
      });
      console.log('Appointment updated:', updatedAppointment);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h3>Appointments ({appointments.length})</h3>
      <button onClick={createAppointment}>Schedule New Appointment</button>
      {appointments.map(appointment => (
        <div key={appointment.appointment_id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <p><strong>Date:</strong> {appointment.date} at {appointment.time}</p>
          <p><strong>Patient ID:</strong> {appointment.patient}</p>
          <p><strong>Doctor ID:</strong> {appointment.doctor}</p>
          <p><strong>Reason:</strong> {appointment.reason}</p>
          <p><strong>Status:</strong> {appointment.status ? 'Completed' : 'Pending'}</p>
          <button onClick={() => updateAppointmentStatus(appointment.appointment_id)}>
            Mark as {appointment.status ? 'Pending' : 'Completed'}
          </button>
        </div>
      ))}
    </div>
  );
};

// ==============================================================================
// DOCTORS API EXAMPLES
// ==============================================================================

export const DoctorsExample = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.doctors);
      console.log(`Found ${response.doctor_count} doctors`);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new doctor
  const createDoctor = async () => {
    try {
      const newDoctor = await doctorsAPI.create({
        first_name: 'Dr. Jane',
        last_name: 'Smith',
        date_of_birth: '1985-05-15',
        specialty: 'Cardiology',
        gender: 'Female',
        phone_number: '+1234567890',
        email: 'jane.smith@hospital.com',
        address: '456 Hospital Ave, Medical City'
      });
      console.log('Doctor created:', newDoctor);
      fetchDoctors();
    } catch (error) {
      console.error('Error creating doctor:', error);
    }
  };

  // Get specific doctor
  const fetchDoctor = async (doctorId: number) => {
    try {
      const doctor = await doctorsAPI.getById(doctorId);
      console.log('Doctor details:', doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div>
          <h3>Doctors ({doctors.length})</h3>
          <button onClick={createDoctor}>Add New Doctor</button>
          {doctors.map(doctor => (
            <div key={doctor.doctor_id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <p><strong>Dr. {doctor.first_name} {doctor.last_name}</strong></p>
              <p>Specialty: {doctor.specialty}</p>
              <p>Email: {doctor.email}</p>
              <p>Phone: {doctor.phone_number}</p>
              <button onClick={() => fetchDoctor(doctor.doctor_id)}>View Details</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// MEDICAL RECORDS EXAMPLES
// ==============================================================================

export const MedicalRecordsExample = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientId] = useState(1); // Example patient ID

  // Fetch medical records for a patient
  const fetchMedicalRecords = async () => {
    try {
      const records = await patientsAPI.medicalRecords.getAll(patientId);
      setMedicalRecords(records);
      console.log('Medical records:', records);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  // Create new medical record
  const createMedicalRecord = async () => {
    try {
      const newRecord = await patientsAPI.medicalRecords.create(patientId, {
        doctor: 1, // Doctor ID
        reason: 'Annual physical examination',
        diagnosis: 'Patient in good health. No significant findings.'
      });
      console.log('Medical record created:', newRecord);
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error creating medical record:', error);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  return (
    <div>
      <h3>Medical Records for Patient {patientId}</h3>
      <button onClick={createMedicalRecord}>Add New Record</button>
      {medicalRecords.map(record => (
        <div key={record.record_id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <p><strong>Record ID:</strong> {record.record_id}</p>
          <p><strong>Doctor ID:</strong> {record.doctor}</p>
          <p><strong>Date:</strong> {new Date(record.time).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> {record.reason}</p>
          <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
        </div>
      ))}
    </div>
  );
};

// ==============================================================================
// EMERGENCY CONTACT EXAMPLES
// ==============================================================================

export const EmergencyContactExample = () => {
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [patientId] = useState(1); // Example patient ID

  // Fetch emergency contact
  const fetchEmergencyContact = async () => {
    try {
      const contact = await patientsAPI.emergencyContact.get(patientId);
      setEmergencyContact(contact);
      console.log('Emergency contact:', contact);
    } catch (error) {
      console.error('Error fetching emergency contact:', error);
    }
  };

  // Create emergency contact
  const createEmergencyContact = async () => {
    try {
      const newContact = await patientsAPI.emergencyContact.create(patientId, {
        first_name: 'Jane',
        last_name: 'Doe',
        phone_number: '+1987654321',
        relationship: 'Spouse'
      });
      console.log('Emergency contact created:', newContact);
      setEmergencyContact(newContact);
    } catch (error) {
      console.error('Error creating emergency contact:', error);
    }
  };

  return (
    <div>
      <h3>Emergency Contact for Patient {patientId}</h3>
      <button onClick={fetchEmergencyContact}>Fetch Contact</button>
      <button onClick={createEmergencyContact}>Add Contact</button>
      {emergencyContact && (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <p><strong>Name:</strong> {emergencyContact.first_name} {emergencyContact.last_name}</p>
          <p><strong>Relationship:</strong> {emergencyContact.relationship}</p>
          <p><strong>Phone:</strong> {emergencyContact.phone_number}</p>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// CHECK-INS EXAMPLES
// ==============================================================================

export const CheckInsExample = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // Fetch all check-ins
  const fetchCheckIns = async () => {
    try {
      const response = await patientsAPI.checkIns.getAll();
      setCheckIns(response.checkins);
      console.log(`Found ${response.checkin_count} check-ins`);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    }
  };

  // Create new check-in
  const createCheckIn = async () => {
    try {
      const newCheckIn = await patientsAPI.checkIns.create({
        patient: 1, // Patient ID
        doctor: 1,  // Doctor ID
        checkout_time: undefined,
        reason: 'Regular appointment',
        status: true
      });
      console.log('Check-in created:', newCheckIn);
      fetchCheckIns();
    } catch (error) {
      console.error('Error creating check-in:', error);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, []);

  return (
    <div>
      <h3>Check-ins ({checkIns.length})</h3>
      <button onClick={createCheckIn}>New Check-in</button>
      {checkIns.map(checkIn => (
        <div key={checkIn.checkin_id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <p><strong>Check-in ID:</strong> {checkIn.checkin_id}</p>
          <p><strong>Patient ID:</strong> {checkIn.patient}</p>
          <p><strong>Doctor ID:</strong> {checkIn.doctor}</p>
          <p><strong>Check-in Time:</strong> {new Date(checkIn.checkin_time).toLocaleString()}</p>
          <p><strong>Status:</strong> {checkIn.status ? 'Active' : 'Inactive'}</p>
          <p><strong>Reason:</strong> {checkIn.reason}</p>
        </div>
      ))}
    </div>
  );
};

// Main component that demonstrates all examples
export const APIExamplesDemo = () => {
  const [currentView, setCurrentView] = useState('auth');

  const views = [
    { key: 'auth', label: 'Authentication', component: <AuthExample /> },
    { key: 'patients', label: 'Patients', component: <PatientsExample /> },
    { key: 'doctors', label: 'Doctors', component: <DoctorsExample /> },
    { key: 'appointments', label: 'Appointments', component: <AppointmentsExample /> },
    { key: 'vitals', label: 'Vitals', component: <VitalsExample /> },
    { key: 'records', label: 'Medical Records', component: <MedicalRecordsExample /> },
    { key: 'emergency', label: 'Emergency Contacts', component: <EmergencyContactExample /> },
    { key: 'checkins', label: 'Check-ins', component: <CheckInsExample /> },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>HMS API Examples</h1>
      <div style={{ marginBottom: '20px' }}>
        {views.map(view => (
          <button
            key={view.key}
            onClick={() => setCurrentView(view.key)}
            style={{
              marginRight: '10px',
              padding: '10px',
              backgroundColor: currentView === view.key ? '#007bff' : '#f8f9fa',
              color: currentView === view.key ? 'white' : 'black',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {view.label}
          </button>
        ))}
      </div>
      <div>
        {views.find(view => view.key === currentView)?.component}
      </div>
    </div>
  );
};