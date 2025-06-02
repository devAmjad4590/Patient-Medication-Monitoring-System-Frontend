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

// 🔁 NEW: Group flat logs by formatted time (log.intakeTime)
export const groupLogsByTime = (logs) => {
  const grouped = {};

  logs.forEach((log) => {
    const timeLabel = formatTime(log.intakeTime);
    if (!grouped[timeLabel]) grouped[timeLabel] = [];
    grouped[timeLabel].push(log);
  });

  return grouped;
};

// ✅ Sort grouped logs by actual time value
export const getSortedSections = (grouped) => {
  return Object.keys(grouped)
    .sort((a, b) => {
      const timeA = moment(a, 'hh:mm A');
      const timeB = moment(b, 'hh:mm A');
      return timeA - timeB;
    })
    .map((time) => ({
      title: time,
      data: grouped[time],
    }));
};
