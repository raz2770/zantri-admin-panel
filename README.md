# Zantri Admin Panel

A React.js web admin panel for managing users, subscriptions, and analytics for the Zantri mobile application.

## Features

- **User Management**: Create, view, edit, and delete users
- **Subscription Management**: Manage user subscriptions, assign plans, set expiry dates
- **Analytics Dashboard**: View user growth, subscription distribution, and revenue analytics
- **Admin Authentication**: Secure login system for admin access
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- React.js 18
- Material-UI (MUI) for UI components
- Firebase (Auth & Firestore) for backend
- Recharts for analytics visualization
- React Router for navigation

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project (same as mobile app)

### Installation

1. Navigate to the admin panel directory:
   ```bash
   cd admin-panel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Firebase configuration:
   - The `src/firebaseConfig.js` file is already configured to use the same Firebase project as your mobile app
   - No additional configuration needed if using the same project

4. Create an admin account:
   - Start the application: `npm start`
   - Go to Settings page after logging in with any temporary credentials
   - Use the "Create New Admin" feature to create your first admin account
   - Or manually add an admin document to Firestore:
     ```javascript
     // Add to 'admins' collection in Firestore
     {
       email: "your-admin-email@example.com",
       role: "admin",
       permissions: ["users", "subscriptions", "analytics"],
       createdAt: new Date()
     }
     ```

### Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Login with your admin credentials

## Admin Panel Features

### Dashboard
- Overview of total users, active subscriptions, trial users
- Recent users table
- Key metrics at a glance

### Users Management
- View all users in a data grid
- Create new users manually
- Edit user information
- Manage user subscriptions
- Delete users
- Filter and search functionality
- Bulk operations support

### Subscription Management
- View all user subscriptions
- Subscription status tracking
- Revenue analytics
- Expiry date management
- Plan assignment without payment processing
- Filter by plan type and status

### Analytics
- User growth charts
- Subscription distribution pie chart
- Revenue by plan analysis
- Key performance metrics
- Customizable time ranges

### Settings
- Create new admin accounts
- System information
- App configuration overview

## User Management Features

### Creating Users
- Username and mobile number required
- Password assignment
- Automatic email generation (mobile@zantri.com format)
- Subscription status toggle

### Subscription Assignment
- Assign any plan to users
- Set custom expiry dates
- Mark as paid without payment processing
- Transaction ID tracking
- Multiple payment method options

### User Actions
- View user details
- Edit user information
- Reset passwords (via Firebase)
- Manage device limits
- Subscription history

## Security Features

- Admin-only access with Firebase Authentication
- Role-based permissions
- Secure API calls to Firebase
- Input validation and sanitization

## Firebase Collections Used

### Users Collection (`users`)
- User profile data
- Subscription information
- Device tracking
- Payment history

### Admins Collection (`admins`)
- Admin credentials
- Role and permissions
- Access control

## Environment Variables

No additional environment variables needed - the app uses the same Firebase configuration as your mobile application.

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
1. **Firebase Hosting**: Use `firebase deploy` after building
2. **Netlify**: Connect your GitHub repo for automatic deployments
3. **Vercel**: Simple deployment with GitHub integration
4. **Traditional Web Hosting**: Upload the `build` folder contents

## API Integration

The admin panel directly integrates with your existing Firebase Firestore database. No additional backend APIs required.

### Supported Operations
- Read all users
- Create new users
- Update user data
- Delete users
- Manage subscriptions
- View analytics data

## Troubleshooting

### Common Issues

1. **Firebase Permission Denied**
   - Ensure your Firebase Security Rules allow admin access
   - Check that the admin user exists in the `admins` collection

2. **Users Not Loading**
   - Verify Firebase configuration
   - Check browser console for errors
   - Ensure Firestore rules allow read access

3. **Authentication Issues**
   - Create admin account in Firestore manually
   - Check Firebase Auth configuration
   - Verify admin credentials

### Firebase Security Rules

Ensure your Firestore security rules allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access
    match /admins/{adminId} {
      allow read, write: if request.auth != null && request.auth.uid == adminId;
    }
    
    // Users collection - admin can read/write all
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

## License

This admin panel is part of the Zantri project and follows the same licensing terms.
