import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { createAdmin } from '../services/authService';
import { getApiBaseUrl } from '../services/apiClient';

const Settings = () => {
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.mobileNumber || !newAdmin.password) {
      showAlert('Please fill in mobile number and password', 'error');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      showAlert('Passwords do not match', 'error');
      return;
    }

    if (newAdmin.password.length < 6) {
      showAlert('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await createAdmin(newAdmin.mobileNumber, newAdmin.password, {
        username: newAdmin.username || `admin_${newAdmin.mobileNumber}`,
        role: newAdmin.role
      });

      if (result.success) {
        showAlert('Admin account created successfully', 'success');
        setNewAdmin({
          username: '',
          mobileNumber: '',
          password: '',
          confirmPassword: '',
          role: 'admin'
        });
      } else {
        showAlert('Error creating admin: ' + result.error, 'error');
      }
    } catch (error) {
      showAlert('Error creating admin account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Admin
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Create a new admin account to access the admin panel
            </Typography>

            <TextField
              fullWidth
              label="Username (optional)"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Mobile Number"
              value={newAdmin.mobileNumber}
              onChange={(e) => setNewAdmin({ ...newAdmin, mobileNumber: e.target.value })}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={newAdmin.confirmPassword}
              onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                label="Role"
                disabled={loading}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCreateAdmin}
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Application Version
                    </Typography>
                    <Typography variant="h6">
                      v1.0.0
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Backend API
                    </Typography>
                    <Typography variant="h6">
                      Go REST API (MongoDB)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {getApiBaseUrl()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="h6">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              App Configuration
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Subscription Plans
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Free Trial: 7 days
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • 1 Month: ₹199
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • 3 Months: ₹499
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • 6 Months: ₹799
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • 12 Months: ₹1299
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Device Limits
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Maximum devices per user: 2
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Device tracking: Enabled
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Features
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • User Management
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Subscription Management
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Analytics Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Transaction History
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
