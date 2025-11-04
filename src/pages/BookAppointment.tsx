

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Input, Button, SelectPicker } from 'rsuite';
import { patientsAPI, doctorsAPI, Patient, Doctor } from '../api';

const BookAppointment = () => {
  // Form state
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [timeStr, setTimeStr] = useState('');
  const [reason, setReason] = useState('');
  
  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Validation errors
  const [patientError, setPatientError] = useState('');
  const [doctorError, setDoctorError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  const navigate = useNavigate();

  // Load patients and doctors when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [patientsResponse, doctorsResponse] = await Promise.all([
          patientsAPI.getAll(),
          doctorsAPI.getAll()
        ]);
        setPatients(patientsResponse.patients);
        setDoctors(doctorsResponse.doctors);
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError('Failed to load patients and doctors');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async () => {
    let isValid = true;

    // Validation
    if (!selectedPatient) {
      setPatientError('Patient is required');
      isValid = false;
    } else {
      setPatientError('');
    }

    if (!selectedDoctor) {
      setDoctorError('Doctor is required');
      isValid = false;
    } else {
      setDoctorError('');
    }

    if (!date) {
      setDateError('Date is required');
      isValid = false;
    } else {
      setDateError('');
    }

    if (!timeStr.trim()) {
      setTimeError('Time is required');
      isValid = false;
    } else {
      setTimeError('');
    }

    if (isValid) {
      setSubmitting(true);
      setError('');
      
      try {
        // Format the date and time for the API
        const formattedDate = date!.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        await patientsAPI.appointments.create({
          patient: selectedPatient!,
          doctor: selectedDoctor!,
          date: formattedDate,
          time: timeStr,
          reason: reason || undefined,
          status: false
        });
        
        alert('Appointment booked successfully!');
        navigate('/appointments'); // Navigate to appointments page after booking
      } catch (error: any) {
        console.error('Error booking appointment:', error);
        setError(
          error.response?.data?.error || 
          error.response?.data?.message || 
          'Failed to book appointment. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading patients and doctors...</p>
      </div>
    );
  }

  const patientOptions = patients.map(patient => ({
    label: `${patient.first_name} ${patient.last_name} (ID: ${patient.patient_id})`,
    value: patient.patient_id
  }));

  const doctorOptions = doctors.map(doctor => ({
    label: `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialty}`,
    value: doctor.doctor_id
  }));

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Book an Appointment</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <SelectPicker
              data={patientOptions}
              value={selectedPatient}
              onChange={(value) => setSelectedPatient(value)}
              placeholder="Select a patient"
              className="w-full"
              searchable
            />
            {patientError && <p className="text-red-500 text-sm mt-1">{patientError}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor
            </label>
            <SelectPicker
              data={doctorOptions}
              value={selectedDoctor}
              onChange={(value) => setSelectedDoctor(value)}
              placeholder="Select a doctor"
              className="w-full"
              searchable
            />
            {doctorError && <p className="text-red-500 text-sm mt-1">{doctorError}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <DatePicker
              value={date}
              onChange={(value) => setDate(value)}
              placeholder="Select appointment date"
              className="w-full"
              format="yyyy-MM-dd"
            />
            {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <Input
              value={timeStr}
              onChange={setTimeStr}
              placeholder="Enter time (HH:MM)"
              className="w-full"
            />
            {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
            <p className="text-gray-500 text-xs mt-1">Format: 14:30 (24-hour format)</p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <Input
              as="textarea"
              value={reason}
              onChange={setReason}
              placeholder="Enter reason for appointment"
              className="w-full"
              rows={3}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button
            appearance="subtle"
            onClick={() => navigate('/appointments')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
