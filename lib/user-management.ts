// Simple in-memory store for demo purposes
// In production, this should be replaced with a proper database
const users = new Map<string, { 
  id: string; 
  email: string; 
  name: string; 
  password: string;
  subscription?: {
    status: 'active' | 'trialing' | 'cancelled';
    plan: string;
    trial_end?: number;
  }
}>()

// Helper function to create user account after successful payment
export function createUserAccount(email: string, subscription: any) {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const defaultPassword = 'welcome123' // In production, generate secure password and send via email
  
  users.set(email, {
    id: userId,
    email,
    name: email.split('@')[0],
    password: defaultPassword, // In production, hash this password
    subscription
  })
  
  console.log('Created user account:', email)
  return { userId, password: defaultPassword }
}

// Helper function to get user by email
export function getUserByEmail(email: string) {
  return users.get(email)
}

// Helper function to validate user credentials
export function validateUser(email: string, password: string) {
  const user = users.get(email)
  
  if (!user) {
    console.log('User not found:', email)
    return null
  }

  // In production, use proper password hashing comparison
  if (user.password !== password) {
    console.log('Invalid password for:', email)
    return null
  }
  
  console.log('User authenticated:', email)
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

// Helper function to get all users (for admin purposes)
export function getAllUsers() {
  return Array.from(users.values())
}

// Helper function to clear all test data (for development/testing)
export function clearAllUsers() {
  const count = users.size
  users.clear()
  console.log(`Cleared ${count} user accounts from memory`)
  return count
}
