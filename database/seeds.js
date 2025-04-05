import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../backend/models/User.js';

import Program from '../backend/models/program.js';

import Course from '../backend/models/course.js';


import Announcement from '../backend/models/announcement.js';



// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding...'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Program.deleteMany({});
    await Course.deleteMany({});
    await Announcement.deleteMany({});

    console.log('Previous data cleared');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@wolkite.edu.et',
      password: adminPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('Admin user created');

    // Create instructor
    const instructorPassword = await hashPassword('instructor123');
    const instructor = new User({
      firstName: 'Instructor',
      lastName: 'User',
      email: 'instructor@wolkite.edu.et',
      password: instructorPassword,
      role: 'instructor',
    });

    await instructor.save();
    console.log('Instructor user created');

    // Create student
    const studentPassword = await hashPassword('student123');
    const student = new User({
      firstName: 'Student',
      lastName: 'User',
      email: 'student@example.com',
      password: studentPassword,
      role: 'student',
      studentId: 'WKU/2023/001',
    });

    await student.save();
    console.log('Student user created');

    // Create programs
    const programs = [
      {
        name: 'Bachelor of Business Administration',
        code: 'BBA',
        description:
          'The Bachelor of Business Administration program provides students with a comprehensive understanding of business principles and practices.',
        degreeType: 'bachelor',
        duration: { years: 4, semesters: 8 },
        totalCreditHours: 120,
        coordinator: instructor._id,
      },
      {
        name: 'Bachelor of Computer Science',
        code: 'BCS',
        description:
          'The Bachelor of Computer Science program focuses on the theoretical and practical aspects of computer science and software development.',
        degreeType: 'bachelor',
        duration: { years: 4, semesters: 8 },
        totalCreditHours: 130,
        coordinator: instructor._id,
      },
      {
        name: 'Master of Business Administration',
        code: 'MBA',
        description:
          'The Master of Business Administration program is designed for professionals seeking to enhance their management and leadership skills.',
        degreeType: 'master',
        duration: { years: 2, semesters: 4 },
        totalCreditHours: 60,
        coordinator: instructor._id,
      },
    ];

    const createdPrograms = await Program.insertMany(programs);
    console.log('Programs created');

    // Create courses
    const courses = [
      {
        code: 'BBA101',
        title: 'Introduction to Business',
        description: 'This course provides an overview of business concepts, principles, and practices.',
        creditHours: 3,
        program: createdPrograms[0]._id,
        instructor: instructor._id,
      },
      {
        code: 'BBA201',
        title: 'Principles of Management',
        description: 'This course covers the fundamental principles and theories of management.',
        creditHours: 3,
        program: createdPrograms[0]._id,
        instructor: instructor._id,
      },
      {
        code: 'BCS101',
        title: 'Introduction to Programming',
        description: 'This course introduces students to programming concepts and problem-solving techniques.',
        creditHours: 4,
        program: createdPrograms[1]._id,
        instructor: instructor._id,
      },
      {
        code: 'BCS201',
        title: 'Data Structures and Algorithms',
        description: 'This course covers fundamental data structures and algorithms used in computer science.',
        creditHours: 4,
        program: createdPrograms[1]._id,
        instructor: instructor._id,
      },
      {
        code: 'MBA501',
        title: 'Strategic Management',
        description: 'This course focuses on the formulation and implementation of business strategies.',
        creditHours: 3,
        program: createdPrograms[2]._id,
        instructor: instructor._id,
      },
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('Courses created');

    // Update programs with courses
    await Program.findByIdAndUpdate(createdPrograms[0]._id, {
      $push: { courses: { $each: [createdCourses[0]._id, createdCourses[1]._id] } },
    });

    await Program.findByIdAndUpdate(createdPrograms[1]._id, {
      $push: { courses: { $each: [createdCourses[2]._id, createdCourses[3]._id] } },
    });

    await Program.findByIdAndUpdate(createdPrograms[2]._id, { 
      $push: { courses: createdCourses[4]._id } 
    });

    console.log('Programs updated with courses');

    // Enroll student in courses
    await User.findByIdAndUpdate(student._id, {
      $push: {
        enrolledCourses: {
          $each: [
            {
              course: createdCourses[2]._id,
              enrollmentDate: new Date(),
              status: 'active',
            },
            {
              course: createdCourses[3]._id,
              enrollmentDate: new Date(),
              status: 'active',
            },
          ],
        },
      },
      program: createdPrograms[1]._id,
    });

    console.log('Student enrolled in courses');

    // Create announcements
    const announcements = [
      {
        title: 'Welcome to the New Semester',
        content:
          'Welcome to the new semester at Wolkite University Distance Learning. We wish you a successful academic year.',
        author: admin._id,
        targetAudience: 'all',
      },
      {
        title: 'Registration Deadline',
        content:
          'The registration deadline for the current semester is March 31, 2025. Please ensure you complete your registration before this date.',
        author: admin._id,
        targetAudience: 'students',
      },
      {
        title: 'New Course Materials Available',
        content:
          'New course materials for BCS101 are now available on the learning platform. Please check your course page.',
        author: instructor._id,
        targetAudience: 'specific_program',
        program: createdPrograms[1]._id,
      },
    ];

    await Announcement.insertMany(announcements);
    console.log('Announcements created');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();