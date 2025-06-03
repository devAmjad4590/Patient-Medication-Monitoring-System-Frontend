import api from "./client";
const patientURL = '/api/patient'

// fetches 14 days of medication logs
export const getMedicationLogs = async () => {
    try {
        const response = await api.get(`${patientURL}/medication-logs`);
        return response.data.medicationIntakeLogs;
    }
    catch (error) {
        console.error("Error fetching medication logs:", error);
        throw error;
    }
}

export const getMedicationSchedule = async (medicationId) => {
    try {
        const response = await api.get(`${patientURL}/medications/${medicationId}/schedule`);
        return response.data;
    } catch (err) {
        console.log("Error fetching medication schedule:");
    }
}

export const updateMedicationSchedule = async (medicationId, selectedDoseTimes) => {
  try {
    const response = await api.patch(`/api/patient/medications/${medicationId}/schedule`, {
      selectedDoseTimes
    });
    
    // Always return the response data, whether success or failure
    return response.data;
  } catch (error) {
    // Only throw for actual network/connection errors
    if (error.response) {
      // Server responded with error status
      return error.response.data;
    } else {
      // Network error or request setup error
      throw new Error('Network error. Please check your connection.');
    }
  }
};

export const getPatientMedication = async () => {
    try {
        const response = await api.get(`${patientURL}/medications`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching patient medications:", error);
        throw error;

    }
}

export const markMedicationTaken = async (logIntake) => {
    try {
        console.log("markMedication called with:", logIntake);
        const response = await api.patch(`${patientURL}/mark-medication`, {
            entryId: logIntake.medicationId,
            status: logIntake.status,
            takenAt: logIntake.takenAt,
        });
        return response;
    } catch (err) {
        console.error("Error marking medication:", err);
        throw err;
    }
};

export const getMedicationDetails = async (medicationId) => {
    try{
        const response = await api.get(`${patientURL}/medications/${medicationId}`);
        return response.data.medication;
    }
    catch(err){
        console.error("Error fetching medication details:", err);
        throw err;
    }
}

export const restockMedication = async (medicationId, quantity) => {
    try {
        const response = await api.patch(`${patientURL}/restock-medication/${medicationId}`, {
            quantity: quantity,
        });
        return response.data;
    } catch (err) {
        console.error("Error restocking medication:", err);
        throw err;
    }
}

export const getUpcomingAppointments = async () => {
    try {
        const response = await api.get(`${patientURL}/appointments/upcoming`);
        return response.data.appointments;
    } catch (err) {
        console.error("Error fetching upcoming appointments:", err);
        throw err;
    }
}

export const getPastAppointments = async () => {
    try {
        const response = await api.get(`${patientURL}/appointments/past`);
        return response.data.appointments;
    } catch (err) {
        console.error("Error fetching past appointments:", err);
        throw err;
    }
}

export const getMedicationIntakeLogsById = async (intakeIds) => {
    try{
        const response = await api.post(`${patientURL}/medication-logs`, {
            intakeIds: intakeIds,
        })
        return response.data.medicationIntakeLogs;
    }
    catch(err){
        console.error("Error fetching medication logs by ID:", err);
        throw err;
    }
    
}

export const getPatientMetrics = async () => {
    try{
        const response = await api.get(`${patientURL}/health-metrics`);
        console.log("Patient metrics response:", response.data);
        return response.data;
    }
    catch(err){
        console.log("Error fetching patient metrics:", err);
    }
}

export const updatePatientMetrics = async (type, value) => {
    console.log(value.systolic, value.diastolic)
    try{
        if(type !== 'bloodPressure'){
            const response = await api.post(`${patientURL}/${type}`, {
                value: value,
            });
            console.log("Update patient metrics response:", response.data);
            return response.data;
        }
        else{
            const response = await api.post(`${patientURL}/${type}`, {
                systolic: value.systolic,
                diastolic: value.diastolic,
            });
            console.log("Update patient metrics response:", response.data);
            return response.data;
        }
    }
    catch(err){
        console.log("Error updating patient metrics:", err);
    }
}

export const getPatientAdherence = async (type) => {
    try {
        const response = await api.post(`${patientURL}/adherence`, {
            type: type,
        });
        console.log("Patient adherence response:", response.data);
        return response.data;
    }
    catch (err) {
        console.log("Error fetching patient adherence:", err);
    }
}

export const getMissedDoses = async (type) => {
    try {
        const response = await api.post(`${patientURL}/missed`, {
            type: type,
        });
        console.log("Patient adherence response:", response.data);
        return response.data;
    }
    catch (err) {
        console.log("Error fetching patient adherence:", err);
    }
}

export const getPatientStreaks = async (type) => {
    try {
        const response = await api.post(`${patientURL}/streaks`, {
            type: type,
        });
        console.log("Patient adherence response:", response.data);
        return response.data;
    }
    catch (err) {
        console.log("Error fetching patient adherence:", err);
    }
}





