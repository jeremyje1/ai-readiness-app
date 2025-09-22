# TEST USER CREDENTIALS
=====================

Created: September 22, 2025
Platform: AI Blueprint (https://aiblueprint.higheredaiblueprint.com)

## Test User Account ✅

### Login Credentials:
- **Email**: `test@aiblueprint.com`
- **Password**: `TestPassword123!`
- **Name**: Test User
- **User ID**: 4db60f00-0562-4bdf-94ef-f47776c98708

### Account Status:
- ✅ Email Confirmed: Yes
- ✅ Provider: Email authentication
- ✅ Ready for testing

### How to Test:
1. Go to: https://aiblueprint.higheredaiblueprint.com
2. Click on "Sign In" or "Login"
3. Enter email: `test@aiblueprint.com`
4. Enter password: `TestPassword123!`
5. You should be able to log in successfully

### Platform Features to Test:
- Login flow
- Dashboard access
- Assessment functionality
- Profile management
- Payment flows (if applicable)
- Email notifications (sent to test@aiblueprint.com)

### Dashboard Access:
- ✅ Full dashboard access granted
- ✅ Payment record created (test tier: ai-readiness-comprehensive) 
- ✅ Can access all platform features

### Notes:
- This is a fully functional test account with dashboard access
- Email is confirmed, no verification needed
- Payment verification will pass (test payment record created)
- Can be used for all platform testing including premium features
- To remove this test user, run: `node cleanup-test-users.js`
- To grant access to other test users: `node scripts/grant-test-access.js email@example.com`