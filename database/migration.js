import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../backend/models/User.js';
import Program from '../backend/models/program.js';
import Course from '../backend/models/course.js';

import Application from '../backend/models/application.js';



import Announcement from '../backend/models/announcement.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to MySQL
const connectToMySQL = async () => {
  try {
    return await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Migrate users
const migrateUsers = async (connection) => {
  try {
    console.log('Migrating users...');
    
    // Get users from MySQL
    const [rows] = await connection.execute('SELECT * FROM users');
    
    // Clear existing users in MongoDB
    await User.deleteMany({});
    
    // Map and insert users
    for (const row of rows) {
      const hashedPassword = await hashPassword(row.password);
      
      await User.create({
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        password: hashedPassword,
        role: mapRole(row.role),
        studentId: row.student_id,
        phone: row.phone,
        address: row.address,
        city: row.city,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        createdAt: row.created_at
      });
    }
    
    console.log(`Migrated ${rows.length} users`);
  } catch (error) {
    console.error('Error migrating users:', error);
  }
};

// Map role from PHP to MERN
const mapRole = (phpRole) => {
  const roleMap = {
    'admin': 'admin',
    'instructor': 'instructor',
    'student': 'student'
  };
  
  return roleMap[phpRole] || 'student';
};

// Migrate programs
const migratePrograms = async (connection) => {
  try {
    console.log('Migrating programs...');
    
    // Get programs from MySQL
    const [rows] = await connection.execute('SELECT * FROM programs');
    
    // Clear existing programs in MongoDB
    await Program.deleteMany({});
    
    // Map and insert programs
    for (const row of rows) {
      await Program.create({
        name: row.name,
        code: row.code,
        description: row.description,
        degreeType: row.degree_type,
        duration: {
          years: row.duration_years,
          semesters: row.duration_semesters
        },
        totalCreditHours: row.total_credit_hours,
        status: row.status,
        createdAt: row.created_at
      });
    }
    
    console.log(`Migrated ${rows.length} programs`);
  } catch (error) {
    console.error('Error migrating programs:', error);
  }
};

// Migrate courses
const migrateCourses = async (connection) => {
  try {
    console.log('Migrating courses...');
    
    // Get courses from MySQL
    const [rows] = await connection.execute('SELECT * FROM courses');
    
    // Get programs and instructors for reference
    const programs = await Program.find({});
    const instructors = await User.find({ role: 'instructor' });
    
    // Create a map for easy lookup
    const programMap = {};
    programs.forEach(program => {
      programMap[program.code] = program._id;
    });
    
    // Clear existing courses in MongoDB
    await Course.deleteMany({});
    
    // Map and insert courses
    for (const row of rows) {
      // Find the corresponding program
      const programId = programMap[row.program_code];
      
      // Assign a random instructor if not specified
      const instructorId = instructors.length > 0 
        ? instructors[Math.floor(Math.random() * instructors.length)]._id 
        : null;
      
      await Course.create({
        code: row.code,
        title: row.title,
        description: row.description,
        creditHours: row.credit_hours,
        program: programId,
        instructor: instructorId,
        status: row.status,
        createdAt: row.created_at
      });
    }
    
    console.log(`Migrated ${rows.length} courses`);
  } catch (error) {
    console.error('Error migrating courses:', error);
  }
};

// Migrate applications
const migrateApplications = async (connection) => {
  try {
    console.log('Migrating applications...');
    
    // Get applications from MySQL
    const [rows] = await connection.execute('SELECT * FROM applications');
    
    // Get programs for reference
    const programs = await Program.find({});
    
    // Create a map for easy lookup
    const programMap = {};
    programs.forEach(program => {
      programMap[program.code] = program._id;
    });
    
    // Clear existing applications in MongoDB
    await Application.deleteMany({});
    
    // Map and insert applications
    for (const row of rows) {
      // Find the corresponding program
      const programId = programMap[row.program_code];
      
      await Application.create({
        applicant: {
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          gender: row.gender,
          dateOfBirth: row.date_of_birth,
          address: row.address,
          city: row.city
        },
        program: programId,
        education: row.education,
        workExperience: row.work_experience,
        personalStatement: row.personal_statement,
        status: row.status,
        applicationNumber: row.application_number,
        createdAt: row.created_at
      });
    }
    
    console.log(`Migrated ${rows.length} applications`);
  } catch (error) {
    console.error('Error migrating applications:', error);
  }
};

// Migrate announcements
const migrateAnnouncements = async (connection) => {
  try {
    console.log('Migrating announcements...');
    
    // Get announcements from MySQL
    const [rows] = await connection.execute('SELECT * FROM announcements');
    
    // Get users and programs for reference
    const users = await User.find({ role: 'admin' });
    const programs = await Program.find({});
    
    // Create a map for easy lookup
    const programMap = {};
    programs.forEach(program => {
      programMap[program.code] = program._id;
    });
    
    // Clear existing announcements in MongoDB
    await Announcement.deleteMany({});
    
    // Map and insert announcements
    for (const row of rows) {
      // Find the corresponding program
      const programId = row.program_code ? programMap[row.program_code] : null;
      
      // Assign a random admin as author if not specified
      const authorId = users.length > 0 
        ? users[Math.floor(Math.random() * users.length)]._id 
        : null;
      
      await Announcement.create({
        title: row.title,
        content: row.content,
        author: authorId,
        targetAudience: row.target_audience,
        program: programId,
        publishDate: row.publish_date,
        expiryDate: row.expiry_date,
        isActive: row.is_active === 1,
        createdAt: row.created_at
      });
    }
    
    console.log(`Migrated ${rows.length} announcements`);
  } catch (error) {
    console.error('Error migrating announcements:', error);
  }
};

// Main migration function
const runMigration = async () => {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await connectToMySQL();
    
    // Run migrations
    await migrateUsers(connection);
    await migratePrograms(connection);
    await migrateCourses(connection);
    await migrateApplications(connection);
    await migrateAnnouncements(connection);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    if (connection) await connection.end();
    await mongoose.disconnect();
    
    console.log('Database connections closed');
    process.exit(0);
  }
};

// Run the migration
runMigration();