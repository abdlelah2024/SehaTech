
import type { UserRole } from './types';

export interface Permissions {
  viewDashboard: boolean;
  viewAppointments: boolean;
  addAppointment: boolean;
  editAppointment: boolean;
  cancelAppointment: boolean;
  viewPatients: boolean;
  addPatient: boolean;
  editPatient: boolean;
  deletePatient: boolean;
  viewDoctors: boolean;
  addDoctor: boolean;
  editDoctor: boolean;
  deleteDoctor: boolean;
  viewBilling: boolean;
  addTransaction: boolean;
  viewReports: boolean;
  generateReport: boolean;
  viewAnalytics: boolean;
  manageUsers: boolean;
  addUser: boolean;
  editUser: boolean;
  deleteUser: boolean;
  manageSettings: boolean;
  useChat: boolean;
  viewAuditLog: boolean;
}

const adminPermissions: Permissions = {
  viewDashboard: true,
  viewAppointments: true,
  addAppointment: true,
  editAppointment: true,
  cancelAppointment: true,
  viewPatients: true,
  addPatient: true,
  editPatient: true,
  deletePatient: true,
  viewDoctors: true,
  addDoctor: true,
  editDoctor: true,
  deleteDoctor: true,
  viewBilling: true,
  addTransaction: true,
  viewReports: true,
  generateReport: true,
  viewAnalytics: true,
  manageUsers: true,
  addUser: true,
  editUser: true,
  deleteUser: true,
  manageSettings: true,
  useChat: true,
  viewAuditLog: true,
};

const receptionistPermissions: Permissions = {
  viewDashboard: true,
  viewAppointments: true,
  addAppointment: true,
  editAppointment: true,
  cancelAppointment: true,
  viewPatients: true,
  addPatient: true,
  editPatient: true,
  deletePatient: false, // Receptionists can't delete patients
  viewDoctors: true,
  addDoctor: false, // Receptionists can't add doctors
  editDoctor: false,
  deleteDoctor: false,
  viewBilling: true,
  addTransaction: true,
  viewReports: false,
  generateReport: false,
  viewAnalytics: false,
  manageUsers: true, // Allow receptionists to manage users
  addUser: true,
  editUser: true,
  deleteUser: false, // Receptionists can't delete users
  manageSettings: true, // Allow receptionists to access settings
  useChat: true,
  viewAuditLog: false,
};

const doctorPermissions: Permissions = {
  viewDashboard: true,
  viewAppointments: true, // Can see their own appointments
  addAppointment: false,
  editAppointment: true, // Can only change status
  cancelAppointment: false,
  viewPatients: true,
  addPatient: false,
  editPatient: false,
  deletePatient: false,
  viewDoctors: false,
  addDoctor: false,
  editDoctor: false,
  deleteDoctor: false,
  viewBilling: false,
  addTransaction: false,
  viewReports: false,
  generateReport: false,
  viewAnalytics: false,
  manageUsers: false,
  addUser: false,
  editUser: false,
  deleteUser: false,
  manageSettings: false,
  useChat: true,
  viewAuditLog: false,
};

export const permissions: Record<UserRole, Permissions> = {
  admin: adminPermissions,
  receptionist: receptionistPermissions,
  doctor: doctorPermissions,
};
