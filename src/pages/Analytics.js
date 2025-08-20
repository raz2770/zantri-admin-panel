import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { getAllUsers, PLAN_TYPES } from '../services/userService';

const Analytics = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionDistribution = () => {
    const distribution = {
      'Free Trial': 0,
      '1 Month': 0,
      '3 Months': 0,
      '6 Months': 0,
      '12 Months': 0,
      'No Subscription': 0
    };

    users.forEach(user => {
      if (!user.hasSubscription) {
        distribution['No Subscription']++;
      } else {
        switch (user.subscriptionPlan) {
          case PLAN_TYPES.FREE_TRIAL:
            distribution['Free Trial']++;
            break;
          case PLAN_TYPES.ONE_MONTH:
            distribution['1 Month']++;
            break;
          case PLAN_TYPES.THREE_MONTHS:
            distribution['3 Months']++;
            break;
          case PLAN_TYPES.SIX_MONTHS:
            distribution['6 Months']++;
            break;
          case PLAN_TYPES.TWELVE_MONTHS:
            distribution['12 Months']++;
            break;
          default:
            distribution['No Subscription']++;
        }
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getUserGrowthData = () => {
    const days = parseInt(timeRange);
    const now = new Date();
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const usersCreatedByDate = users.filter(user => {
        const createdDate = user.createdAt ? new Date(user.createdAt) : null;
        return createdDate && 
               createdDate.toDateString() === date.toDateString();
      }).length;

      data.push({
        date: date.toLocaleDateString(),
        users: usersCreatedByDate,
        cumulative: users.filter(user => {
          const createdDate = user.createdAt ? new Date(user.createdAt) : null;
          return createdDate && createdDate <= date;
        }).length
      });
    }

    return data;
  };

  const getRevenueData = () => {
    const planRevenue = {
      [PLAN_TYPES.ONE_MONTH]: 199,
      [PLAN_TYPES.THREE_MONTHS]: 499,
      [PLAN_TYPES.SIX_MONTHS]: 799,
      [PLAN_TYPES.TWELVE_MONTHS]: 1299
    };

    const revenueByPlan = {
      '1 Month': 0,
      '3 Months': 0,
      '6 Months': 0,
      '12 Months': 0
    };

    users.forEach(user => {
      if (user.hasSubscription && user.subscriptionPlan !== PLAN_TYPES.FREE_TRIAL) {
        const revenue = planRevenue[user.subscriptionPlan];
        if (revenue) {
          switch (user.subscriptionPlan) {
            case PLAN_TYPES.ONE_MONTH:
              revenueByPlan['1 Month'] += revenue;
              break;
            case PLAN_TYPES.THREE_MONTHS:
              revenueByPlan['3 Months'] += revenue;
              break;
            case PLAN_TYPES.SIX_MONTHS:
              revenueByPlan['6 Months'] += revenue;
              break;
            case PLAN_TYPES.TWELVE_MONTHS:
              revenueByPlan['12 Months'] += revenue;
              break;
            default:
              // Handle unknown plan types
              break;
          }
        }
      }
    });

    return Object.entries(revenueByPlan).map(([plan, revenue]) => ({ plan, revenue }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const subscriptionDistribution = getSubscriptionDistribution();
  const userGrowthData = getUserGrowthData();
  const revenueData = getRevenueData();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" name="Daily Signups" />
                <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" name="Total Users" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Subscription Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subscription Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue by Plan */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Plan
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {users.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h4">
                      {users.length > 0 
                        ? `${((users.filter(u => u.hasSubscription).length / users.length) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Subscriptions
                    </Typography>
                    <Typography variant="h4">
                      {users.filter(u => {
                        if (!u.hasSubscription) return false;
                        const expiry = u.subscriptionExpiry ? new Date(u.subscriptionExpiry) : null;
                        return expiry && expiry > new Date();
                      }).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      ₹{revenueData.reduce((sum, item) => sum + item.revenue, 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
