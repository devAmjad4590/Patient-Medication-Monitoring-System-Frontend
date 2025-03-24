import moment from 'moment';

// Function to format ISO time to "08:00 AM"
export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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

// ✅ Updated function to sort times correctly
export const getSortedSections = (groupedMedications) => {
  return Object.keys(groupedMedications)
    .sort((a, b) => {
      const timeA = moment(a, 'hh:mm A');
      const timeB = moment(b, 'hh:mm A');
      return timeA - timeB;
    })
    .map((time) => ({
      title: time,
      data: groupedMedications[time],
    }));
};
