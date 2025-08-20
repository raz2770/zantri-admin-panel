import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Refresh,
  Search,
  Subscriptions
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUserAccount,
  updateUserSubscription,
  PLAN_TYPES
} from '../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  
  const [formData, setFormData] = useState({
    username: '',
    mobileNumber: '',
    password: '',
    hasSubscription: false
  });
  
  const [subscriptionData, setSubscriptionData] = useState({
    planId: PLAN_TYPES.ONE_MONTH,
    expiryDate: '',
    transactionId: '',
    paymentMethod: 'ADMIN_ASSIGNED',
    activateNow: true
  });
  
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.users);
      } else {
        showAlert('Error loading users: ' + result.error, 'error');
      }
    } catch (error) {
      showAlert('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handleCreateUser = () => {
    setDialogMode('create');
    setFormData({
      username: '',
      mobileNumber: '',
      password: '',
      hasSubscription: false
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      mobileNumber: user.mobileNumber || '',
      password: '', // Don't pre-fill password
      hasSubscription: user.hasSubscription || false
    });
    setOpenUserDialog(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUserAccount(userId);
        if (result.success) {
          showAlert('User deleted successfully', 'success');
          loadUsers();
        } else {
          showAlert('Error deleting user: ' + result.error, 'error');
        }
      } catch (error) {
        showAlert('Error deleting user', 'error');
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      if (dialogMode === 'create') {
        if (!formData.username || !formData.mobileNumber || !formData.password) {
          showAlert('Please fill in all required fields', 'error');
          return;
        }
        
        const result = await createUser(formData);
        if (result.success) {
          showAlert('User created successfully', 'success');
          setOpenUserDialog(false);
          loadUsers();
        } else {
          showAlert('Error creating user: ' + result.error, 'error');
        }
      } else {
        const updates = {
          username: formData.username,
          mobileNumber: formData.mobileNumber,
          hasSubscription: formData.hasSubscription
        };
        
        const result = await updateUser(selectedUser.id, updates);
        if (result.success) {
          showAlert('User updated successfully', 'success');
          setOpenUserDialog(false);
          loadUsers();
        } else {
          showAlert('Error updating user: ' + result.error, 'error');
        }
      }
    } catch (error) {
      showAlert('Error saving user', 'error');
    }
  };

  const handleManageSubscription = (user) => {
    setSelectedUser(user);
    setSubscriptionData({
      planId: user.subscriptionPlan || PLAN_TYPES.ONE_MONTH,
      expiryDate: user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toISOString().split('T')[0] : '',
      transactionId: user.paymentTransactionId || '',
      paymentMethod: user.paymentMethod || 'ADMIN_ASSIGNED',
      activateNow: user.hasSubscription || false
    });
    setOpenSubscriptionDialog(true);
  };

  const handleSaveSubscription = async () => {
    try {
      const result = await updateUserSubscription(selectedUser.id, subscriptionData);
      if (result.success) {
        showAlert('Subscription updated successfully', 'success');
        setOpenSubscriptionDialog(false);
        loadUsers();
      } else {
        showAlert('Error updating subscription: ' + result.error, 'error');
      }
    } catch (error) {
      showAlert('Error updating subscription', 'error');
    }
  };

  const getSubscriptionStatus = (user) => {
    if (!user.hasSubscription) return 'Free';
    
    const now = new Date();
    const expiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
    
    if (!expiry || expiry < now) return 'Expired';
    if (user.subscriptionPlan === '0') return 'Trial';
    return 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Trial': return 'warning';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  const getPlanName = (planId) => {
    const plans = {
      '0': 'Free Trial',
      '1': '1 Month',
      '2': '3 Months',
      '3': '6 Months',
      '4': '12 Months'
    };
    return plans[planId] || 'Unknown';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobileNumber?.includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getSubscriptionStatus(user);
    return matchesSearch && status.toLowerCase() === filterStatus.toLowerCase();
  });

  const columns = [
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'mobileNumber', headerName: 'Mobile', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const status = getSubscriptionStatus(params.row);
        return (
          <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
          />
        );
      }
    },
    { 
      field: 'subscriptionPlan', 
      headerName: 'Plan', 
      width: 100,
      renderCell: (params) => getPlanName(params.value)
    },
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      width: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'lastLogin', 
      headerName: 'Last Login', 
      width: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditUser(params.row)} size="small">
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleManageSubscription(params.row)} size="small">
            <Subscriptions />
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(params.row.id)} size="small" color="error">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUsers}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="free">Free</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>

      {/* User Create/Edit Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mobile Number"
            fullWidth
            variant="outlined"
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          {dialogMode === 'create' && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasSubscription}
                onChange={(e) => setFormData({ ...formData, hasSubscription: e.target.checked })}
              />
            }
            label="Has Subscription"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={openSubscriptionDialog} onClose={() => setOpenSubscriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Subscription - {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Plan</InputLabel>
            <Select
              value={subscriptionData.planId}
              onChange={(e) => setSubscriptionData({ ...subscriptionData, planId: e.target.value })}
              label="Plan"
            >
              <MenuItem value={PLAN_TYPES.FREE_TRIAL}>Free Trial</MenuItem>
              <MenuItem value={PLAN_TYPES.ONE_MONTH}>1 Month</MenuItem>
              <MenuItem value={PLAN_TYPES.THREE_MONTHS}>3 Months</MenuItem>
              <MenuItem value={PLAN_TYPES.SIX_MONTHS}>6 Months</MenuItem>
              <MenuItem value={PLAN_TYPES.TWELVE_MONTHS}>12 Months</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Expiry Date"
            type="date"
            fullWidth
            variant="outlined"
            value={subscriptionData.expiryDate}
            onChange={(e) => setSubscriptionData({ ...subscriptionData, expiryDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Transaction ID"
            fullWidth
            variant="outlined"
            value={subscriptionData.transactionId}
            onChange={(e) => setSubscriptionData({ ...subscriptionData, transactionId: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Payment Method"
            fullWidth
            variant="outlined"
            value={subscriptionData.paymentMethod}
            onChange={(e) => setSubscriptionData({ ...subscriptionData, paymentMethod: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={subscriptionData.activateNow}
                onChange={(e) => setSubscriptionData({ ...subscriptionData, activateNow: e.target.checked })}
              />
            }
            label="Activate Now"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubscriptionDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSubscription} variant="contained">
            Update Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
