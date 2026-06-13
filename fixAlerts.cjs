const fs = require('fs');
const file = 'c:/Projects/Routeup/client/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import if missing
if (!content.includes("import toast from 'react-hot-toast'")) {
  content = content.replace("import { io } from 'socket.io-client';", "import { io } from 'socket.io-client';\nimport toast from 'react-hot-toast';");
}

// Replacements
content = content.replace(/alert\('Failed: ' \+ err\.message\);/g, "toast.error('Failed: ' + err.message);");
content = content.replace(/alert\('Error updating profile'\);/g, "toast.error('Error updating profile');");
content = content.replace(/alert\('Meeting scheduled and email sent!'\);/g, "toast.success('Meeting scheduled and email sent!');");
content = content.replace(/alert\('Error scheduling'\);/g, "toast.error('Error scheduling');");
content = content.replace(/alert\('Notes uploaded and email sent!'\);/g, "toast.success('Notes uploaded and email sent!');");
content = content.replace(/alert\('Error uploading post meeting details'\);/g, "toast.error('Error uploading post meeting details');");
content = content.replace(/alert\('Booking marked as complete'\);/g, "toast.success('Booking marked as complete');");
content = content.replace(/alert\('Failed to mark complete'\);/g, "toast.error('Failed to mark complete');");
content = content.replace(/alert\('Error completing booking'\);/g, "toast.error('Error completing booking');");
content = content.replace(/alert\('Booking deleted successfully'\);/g, "toast.success('Booking deleted successfully');");
content = content.replace(/alert\('Failed to delete booking'\);/g, "toast.error('Failed to delete booking');");
content = content.replace(/alert\('Error deleting booking'\);/g, "toast.error('Error deleting booking');");
content = content.replace(/alert\('Booking updated successfully!'\);/g, "toast.success('Booking updated successfully!');");
content = content.replace(/alert\('Failed to update booking'\);/g, "toast.error('Failed to update booking');");
content = content.replace(/alert\('Error updating booking'\);/g, "toast.error('Error updating booking');");
content = content.replace(/alert\(`Failed to save service: \$\{err\.message\}`\);/g, "toast.error(`Failed to save service: ${err.message}`);");
content = content.replace(/alert\('Error saving service'\);/g, "toast.error('Error saving service');");
content = content.replace(/alert\('Failed to delete service'\);/g, "toast.error('Failed to delete service');");
content = content.replace(/alert\('Error deleting service'\);/g, "toast.error('Error deleting service');");
content = content.replace(/alert\(`Failed to save visa pathway: \$\{err\.message\}`\);/g, "toast.error(`Failed to save visa pathway: ${err.message}`);");
content = content.replace(/alert\('Error saving visa pathway'\);/g, "toast.error('Error saving visa pathway');");
content = content.replace(/alert\('Failed to delete visa pathway'\);/g, "toast.error('Failed to delete visa pathway');");
content = content.replace(/alert\('Error deleting visa pathway'\);/g, "toast.error('Error deleting visa pathway');");
content = content.replace(/else alert\('Failed to mark complete'\);/g, "else toast.error('Failed to mark complete');");

fs.writeFileSync(file, content);
console.log('Replaced alerts with toasts');
