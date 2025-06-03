import moment from 'moment';

// Function to format ISO time to local time "08:00 AM"
export const formatTime = (isoString) => {
  // Convert UTC time to local timezone
  return moment.utc(isoString).local().format('hh:mm A');
};

// Rest of your functions remain the same
export const groupLogsByTime = (logs) => {
  const grouped = {};
  logs.forEach((log) => {
    const timeLabel = formatTime(log.intakeTime);
    if (!grouped[timeLabel]) grouped[timeLabel] = [];
    grouped[timeLabel].push(log);
  });
  return grouped;
};

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