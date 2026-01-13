export const userDatabase = {
  users: {
    'student@school.edu': {
      email: 'student@school.edu',
      fullName: 'John Student',
      role: 'learner',
      studentId: 'STU001',
      institution: 'Demo School',
      password: 'Student123!'
    },
    'admin@admin.school.edu': {
      email: 'admin@admin.school.edu',
      fullName: 'Admin User',
      role: 'admin',
      adminId: 'ADM001',
      department: 'Academic Affairs',
      institution: 'Demo School',
      password: 'Admin123!'
    },
    'parent@guardian.school.edu': {
      email: 'parent@guardian.school.edu',
      fullName: 'Parent Guardian',
      role: 'guardian',
      guardianId: 'GRD001',
      relationship: 'Parent',
      password: 'Parent123!'
    }
  },

  userExists(email) {
    return !!this.users[email.toLowerCase()];
  },

  getUser(email) {
    return this.users[email.toLowerCase()];
  },

  registerUser(userData) {
    this.users[userData.email.toLowerCase()] = userData;
    this.saveToStorage();
    return userData;
  },

  authenticateUser(email, password) {
    const user = this.getUser(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  },

  saveToStorage() {
    localStorage.setItem('skillforge_users', JSON.stringify(this.users));
  },

  loadFromStorage() {
    const stored = localStorage.getItem('skillforge_users');
    if (stored) {
      this.users = { ...this.users, ...JSON.parse(stored) };
    }
  },

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    
    return null;
  },

  sendPasswordToEmail(email) {
    const user = this.getUser(email);
    if (!user) return { success: false, message: 'Email not found' };
    
    console.log(`Password sent to ${email}: ${user.password}`);
    
    return { 
      success: true, 
      message: 'Password has been sent to your email address. Check console for simulation.' 
    };
  }
};

userDatabase.loadFromStorage();