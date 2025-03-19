// Function to format ISO time to "08:00 AM"
export const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };
  
  // Function to group medications by intake time
  export const groupMedicationsByTime = (medications) => {
    const groupedMedications = {};
  
    medications.forEach((med) => {
      med.intakeSchedule.forEach((schedule) => {
        const formattedTime = formatTime(schedule.intakeTime);
        if (!groupedMedications[formattedTime]) {
          groupedMedications[formattedTime] = [];
        }
        groupedMedications[formattedTime].push(med);
      });
    });
  
    return groupedMedications;
  };
  
  // Function to convert grouped medications into a sorted SectionList format
  export const getSortedSections = (groupedMedications) => {
    return Object.keys(groupedMedications)
      .sort((a, b) => new Date(`1970/01/01 ${a}`) - new Date(`1970/01/01 ${b}`)) // Sort by time
      .map((time) => ({
        title: time,
        data: groupedMedications[time],
      }));
  };
  
  