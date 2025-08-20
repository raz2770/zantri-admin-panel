import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  AccessTime
} from '@mui/icons-material';
import { getAllUsers, PLAN_TYPES } from '../services/userService';

const Subscriptions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [subscriptionStats, setSubscriptionStats] = useState({});

  useEffect(() => {
    loadSubscriptionData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.users);
        calculateStats(result.users);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const now = new Date();
    let activeSubscriptions = 0;
    let trialUsers = 0;
    let expiredUsers = 0;
    let totalRevenue = 0;
    let expiringThisWeek = 0;

    const planRevenue = {
      [PLAN_TYPES.ONE_MONTH]: 199,
      [PLAN_TYPES.THREE_MONTHS]: 499,
      [PLAN_TYPES.SIX_MONTHS]: 799,
      [PLAN_TYPES.TWELVE_MONTHS]: 1299
    };

    userList.forEach(user => {
      if (user.hasSubscription) {
        const expiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
        
        if (expiry && expiry > now) {
          if (user.subscriptionPlan === PLAN_TYPES.FREE_TRIAL) {
            trialUsers++;
          } else {
            activeSubscriptions++;
            if (planRevenue[user.subscriptionPlan]) {
              totalRevenue += planRevenue[user.subscriptionPlan];
            }
          }

          // Check if expiring within a week
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (expiry <= weekFromNow) {
            expiringThisWeek++;
          }
        } else {
          expiredUsers++;
        }
      }
    });

    setSubscriptionStats({
      activeSubscriptions,
      trialUsers,
      expiredUsers,
      totalRevenue,
      expiringThisWeek
    });
  };

  const getSubscriptionStatus = (user) => {
    if (!user.hasSubscription) return 'None';
    
    const now = new Date();
    const expiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
    
    if (!expiry || expiry < now) return 'Expired';
    if (user.subscriptionPlan === PLAN_TYPES.FREE_TRIAL) return 'Trial';
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
      [PLAN_TYPES.FREE_TRIAL]: 'Free Trial',
      [PLAN_TYPES.ONE_MONTH]: '1 Month (₹199)',
      [PLAN_TYPES.THREE_MONTHS]: '3 Months (₹499)',
      [PLAN_TYPES.SIX_MONTHS]: '6 Months (₹799)',
      [PLAN_TYPES.TWELVE_MONTHS]: '12 Months (₹1299)'
    };
    return plans[planId] || 'Unknown';
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredUsers = users.filter(user => {
    const status = getSubscriptionStatus(user);
    const matchesStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPlan = filterPlan === 'all' || user.subscriptionPlan === filterPlan;
    
    // Only show users with subscriptions
    return user.hasSubscription && matchesStatus && matchesPlan;
  });

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Subscriptions Management
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Subscriptions"
            value={subscriptionStats.activeSubscriptions || 0}
            icon={<People />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Trial Users"
            value={subscriptionStats.trialUsers || 0}
            icon={<TrendingUp />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${subscriptionStats.totalRevenue || 0}`}
            icon={<AttachMoney />}
            color="#1976d2"
            subtitle="Estimated from active plans"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expiring This Week"
            value={subscriptionStats.expiringThisWeek || 0}
            icon={<AccessTime />}
            color="#d32f2f"
            subtitle="Needs attention"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
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
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Plan Filter</InputLabel>
            <Select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              label="Plan Filter"
            >
              <MenuItem value="all">All Plans</MenuItem>
              <MenuItem value={PLAN_TYPES.FREE_TRIAL}>Free Trial</MenuItem>
              <MenuItem value={PLAN_TYPES.ONE_MONTH}>1 Month</MenuItem>
              <MenuItem value={PLAN_TYPES.THREE_MONTHS}>3 Months</MenuItem>
              <MenuItem value={PLAN_TYPES.SIX_MONTHS}>6 Months</MenuItem>
              <MenuItem value={PLAN_TYPES.TWELVE_MONTHS}>12 Months</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={loadSubscriptionData}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Subscription Details
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Activated</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Days Remaining</TableCell>
                  <TableCell>Transaction ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => {
                  const status = getSubscriptionStatus(user);
                  const daysRemaining = getDaysRemaining(user.subscriptionExpiry);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.mobileNumber}</TableCell>
                      <TableCell>{getPlanName(user.subscriptionPlan)}</TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          color={getStatusColor(status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.subscriptionActivatedAt 
                          ? new Date(user.subscriptionActivatedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {user.subscriptionExpiry 
                          ? new Date(user.subscriptionExpiry).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                          color={daysRemaining > 7 ? 'success' : daysRemaining > 0 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.paymentTransactionId || 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredUsers.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                No subscriptions found matching the current filters.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Subscriptions;
