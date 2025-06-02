const mockAppointments = [
    // 🔙 PAST Appointments
    {
      userId: "64fdcfba4d39c12c55c3a7d1",
      type: "Consultation",
      doctorName: "Dr. Ayesha Malik",
      appointmentDateTime: "2023-11-15T10:30:00.000Z",
      location: "Kuala Lumpur General Hospital, Room 203",
    },
    {
      userId: "64fdcfba4d39c12c55c3a7d2",
      type: "Follow-up",
      doctorName: "Dr. Hassan Ali",
      appointmentDateTime: "2024-03-01T09:00:00.000Z",
      location: "Cyberjaya Specialist Clinic, Block B",
    },
  
    // ⏳ UPCOMING Appointments (future-proofed for 2026)
    {
      userId: "64fdcfba4d39c12c55c3a7d3",
      type: "Consultation",
      doctorName: "Dr. Nurul Iman",
      appointmentDateTime: "2026-01-10T14:00:00.000Z",
      location: "Sunway Medical Centre, Level 4",
    },
    {
      userId: "64fdcfba4d39c12c55c3a7d1",
      type: "Routine Checkup",
      doctorName: "Dr. Ramesh Kumar",
      appointmentDateTime: "2026-06-25T16:30:00.000Z",
      location: "Putrajaya Clinic, Room 12",
    },
  ];
  
  const pastAppointments = mockAppointments.filter(app =>
    new Date(app.appointmentDateTime) < new Date()
  );
  
  const upcomingAppointments = mockAppointments.filter(app =>
    new Date(app.appointmentDateTime) >= new Date()
  );
  
  module.exports = {
    mockAppointments,
    pastAppointments,
    upcomingAppointments,
  };
  