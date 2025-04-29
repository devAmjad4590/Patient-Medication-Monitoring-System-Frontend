import api from "./client";
const patientURL = '/api/patient'

// fetches 14 days of medication logs
export const getMedicationLogs = async () => {
    try {
        const response = await api.get(`${patientURL}/medication-logs`);
        console.log('test')
        return response.data.medicationIntakeLogs;
    }
    catch (error) {
        console.error("Error fetching medication logs:", error);
        throw error;
    }
}

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
