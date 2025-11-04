import { useState, useEffect } from "react";
import { SideNav } from "../components/SideNavBar"; // Custom styles for better alignment.
import { Button } from "rsuite";
import { patientsAPI, Patient } from "../api";

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.patients);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load patients when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRowClick = (patient: Patient) => {
    console.log("Selected patient:", patient);
  };

  return (
    <div className="flex">
      <div className="justify-center items-center">
        <SideNav />
        <Button appearance="primary" className="mt-5 ml-10" size="lg">
          Add Patient
        </Button>
      </div>

      <div className="flex-1 p-6">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-center">Patients</h1>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Loading patients...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="text-red-500">{error}</p>
                      <button
                        onClick={fetchPatients}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.patient_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(patient)}
                    >
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {patient.patient_id}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {patient.first_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {patient.last_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {patient.gender}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {calculateAge(patient.date_of_birth)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {patient.address ? patient.address.substring(0, 20) + '...' : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {patient.email || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <button
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click event
                            alert(`Viewing records for patient ID: ${patient.patient_id}`);
                          }}
                        >
                          View Records
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
