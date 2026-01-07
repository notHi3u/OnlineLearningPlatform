// Seed script - Run on server start to create demo data
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.ts";
import Course from "./models/Course.ts";
import Section from "./models/Section.ts";
import Lesson from "./models/Lesson.ts";
import Exam from "./models/Exam.ts";
import ExamQuestion from "./models/ExamQuestion.ts";
import Enrollment from "./models/Enrollment.ts";
import { hashPassword } from "./utils/hash.ts";

dotenv.config();

// Demo accounts from .env
const DEMO_USERS = [
  { email: process.env.SEED_ADMIN_EMAIL || "admin@demo.com", password: process.env.SEED_ADMIN_PASSWORD || "admin", name: "Admin User", role: "admin" as const },
  { email: process.env.SEED_TEACHER1_EMAIL || "teacher1@demo.com", password: process.env.SEED_TEACHER_PASSWORD || "teacher123", name: "Teacher John", role: "teacher" as const },
  { email: process.env.SEED_TEACHER2_EMAIL || "teacher2@demo.com", password: process.env.SEED_TEACHER_PASSWORD || "teacher123", name: "Teacher Mary", role: "teacher" as const },
  { email: process.env.SEED_STUDENT1_EMAIL || "student1@demo.com", password: process.env.SEED_STUDENT_PASSWORD || "student123", name: "Student Alice", role: "student" as const },
  { email: process.env.SEED_STUDENT2_EMAIL || "student2@demo.com", password: process.env.SEED_STUDENT_PASSWORD || "student123", name: "Student Bob", role: "student" as const },
  { email: process.env.SEED_STUDENT3_EMAIL || "student3@demo.com", password: process.env.SEED_STUDENT_PASSWORD || "student123", name: "Student Carol", role: "student" as const },
];

export async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/olp");
    console.log("📦 Connected to MongoDB");

    // ===== USERS =====
    console.log("\n👥 Seeding users...");
    const userMap: Record<string, any> = {};
    
    for (const userData of DEMO_USERS) {
      let user = await User.findOne({ email: userData.email });
      if (user) {
        console.log(`   ${userData.email} already exists`);
      } else {
        user = await User.create({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          passwordHash: hashPassword(userData.password),
        });
        console.log(`   ✅ Created: ${userData.email} (${userData.password})`);
      }
      userMap[userData.email] = user;
    }

    // ===== COURSES =====
    console.log("\n📚 Seeding courses...");
    const teacher1 = userMap["teacher1@demo.com"];
    const teacher2 = userMap["teacher2@demo.com"];

    const courses = [
      {
        title: "Web Development Bootcamp",
        description: "Master HTML, CSS, JavaScript, React & Node.js. Build real-world projects and become a full-stack developer.",
        teacher: teacher1._id,
        publishStatus: "approved" as const,
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
      },
      {
        title: "Machine Learning with Python",
        description: "Learn ML algorithms, deep learning, and AI. Work with TensorFlow, PyTorch, and real datasets.",
        teacher: teacher1._id,
        publishStatus: "approved" as const,
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600",
      },
      {
        title: "UI/UX Design Fundamentals",
        description: "Design beautiful user interfaces. Learn Figma, design principles, and create stunning UX.",
        teacher: teacher2._id,
        publishStatus: "approved" as const,
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
      },
      {
        title: "DevOps & Cloud Computing",
        description: "Master Docker, Kubernetes, AWS, and CI/CD pipelines. Deploy and scale applications efficiently.",
        teacher: teacher2._id,
        publishStatus: "approved" as const,
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1667372393119-c81c0e2717d9?w=600",
      },
    ];

    const courseMap: Record<string, any> = {};
    for (const courseData of courses) {
      let course = await Course.findOne({ title: courseData.title, teacher: courseData.teacher });
      if (course) {
        console.log(`   ${courseData.title} already exists`);
      } else {
        course = await Course.create(courseData);
        console.log(`   ✅ Created: ${courseData.title}`);
      }
      courseMap[courseData.title] = course;
    }

    // ===== SECTIONS & LESSONS =====
    console.log("\n📖 Seeding sections and lessons...");

    const allCourses = Object.values(courseMap);
    const sectionMap: Record<string, any> = {};

    // Define sections and lessons for each course
    const courseContent = [
      {
        course: courseMap["Web Development Bootcamp"],
        sections: [
          {
            title: "Getting Started with Web Dev",
            order: 1,
            lessons: [
              { title: "Introduction to Web Development", content: "Learn the basics of how the web works - HTTP, DNS, and browsers.", order: 1, type: "document" as const },
              { title: "Setting Up Your Environment", content: "Install VS Code, Node.js, and essential extensions.", order: 2, type: "document" as const },
              { title: "Your First HTML Page", content: "Create your first webpage with HTML structure and elements.", order: 3, type: "document" as const },
              { title: "Styling with CSS", content: "Introduction to CSS selectors, properties, and layouts.", order: 4, type: "document" as const },
            ],
          },
          {
            title: "JavaScript Fundamentals",
            order: 2,
            lessons: [
              { title: "Variables and Data Types", content: "Understanding let, const, var and JavaScript data types.", order: 1, type: "document" as const },
              { title: "Functions and Scope", content: "Function declarations, arrow functions, and scope.", order: 2, type: "document" as const },
              { title: "Arrays and Objects", content: "Working with complex data structures in JavaScript.", order: 3, type: "document" as const },
              { title: "DOM Manipulation", content: "Interact with web pages using JavaScript.", order: 4, type: "document" as const },
            ],
          },
        ],
      },
      {
        course: courseMap["Machine Learning with Python"],
        sections: [
          {
            title: "Python for Data Science",
            order: 1,
            lessons: [
              { title: "Python Basics Review", content: "Quick review of Python syntax for data science.", order: 1, type: "document" as const },
              { title: "NumPy and Pandas", content: "Essential libraries for data manipulation.", order: 2, type: "document" as const },
              { title: "Data Visualization", content: "Create stunning charts with Matplotlib and Seaborn.", order: 3, type: "document" as const },
            ],
          },
          {
            title: "Machine Learning Basics",
            order: 2,
            lessons: [
              { title: "What is Machine Learning?", content: "Introduction to ML concepts and terminology.", order: 1, type: "document" as const },
              { title: "Supervised Learning", content: "Classification and regression algorithms explained.", order: 2, type: "document" as const },
              { title: "Unsupervised Learning", content: "Clustering and dimensionality reduction.", order: 3, type: "document" as const },
              { title: "Model Evaluation", content: "How to evaluate and improve your models.", order: 4, type: "document" as const },
            ],
          },
        ],
      },
      {
        course: courseMap["UI/UX Design Fundamentals"],
        sections: [
          {
            title: "Design Principles",
            order: 1,
            lessons: [
              { title: "Introduction to UI/UX", content: "Understanding the difference between UI and UX design.", order: 1, type: "document" as const },
              { title: "Color Theory", content: "How to use colors effectively in your designs.", order: 2, type: "document" as const },
              { title: "Typography Basics", content: "Choosing and pairing fonts for readability.", order: 3, type: "document" as const },
            ],
          },
          {
            title: "User Research",
            order: 2,
            lessons: [
              { title: "User Personas", content: "Creating detailed user personas for your product.", order: 1, type: "document" as const },
              { title: "User Journey Mapping", content: "Map out the user experience journey.", order: 2, type: "document" as const },
              { title: "Wireframing", content: "Low-fidelity wireframing techniques.", order: 3, type: "document" as const },
            ],
          },
        ],
      },
      {
        course: courseMap["DevOps & Cloud Computing"],
        sections: [
          {
            title: "Containerization with Docker",
            order: 1,
            lessons: [
              { title: "What is Docker?", content: "Introduction to container technology.", order: 1, type: "document" as const },
              { title: "Dockerfile Basics", content: "Creating and building Docker images.", order: 2, type: "document" as const },
              { title: "Docker Compose", content: "Multi-container applications made easy.", order: 3, type: "document" as const },
            ],
          },
          {
            title: "Cloud Services",
            order: 2,
            lessons: [
              { title: "Introduction to AWS", content: "Overview of Amazon Web Services.", order: 1, type: "document" as const },
              { title: "EC2 and S3", content: "Compute and storage services explained.", order: 2, type: "document" as const },
              { title: "CI/CD Pipelines", content: "Automate your deployment workflow.", order: 3, type: "document" as const },
            ],
          },
        ],
      },
    ];

    for (const content of courseContent) {
      const course = content.course;
      if (!course) continue;

      for (const sectionData of content.sections) {
        let section = await Section.findOne({ course: course._id, title: sectionData.title });
        if (section) {
          console.log(`   Section "${sectionData.title}" already exists`);
        } else {
          section = await Section.create({
            course: course._id,
            title: sectionData.title,
            order: sectionData.order,
          });
          console.log(`   ✅ Created section: ${sectionData.title}`);
        }
        sectionMap[`${sectionData.title}-${course._id}`] = section;

        // Create lessons
        const lessonsToCreate = sectionData.lessons.map(lessonData => ({
          section: section._id,
          title: lessonData.title,
          contentUrl: lessonData.content,
          order: lessonData.order,
          type: lessonData.type,
        }));
        try {
          await Lesson.insertMany(lessonsToCreate, { ordered: false });
        } catch (e: any) {
          if (e.code !== 11000) throw e;
        }
      }
    }

    // ===== EXAMS =====
    console.log("\n📝 Seeding exams...");

    const examData = [
      {
        sectionKey: "Getting Started with Web Dev-" + courseMap["Web Development Bootcamp"]._id,
        title: "Web Development Basics Quiz",
        description: "Test your knowledge of web development fundamentals",
        durationMinutes: 20,
        passPercent: 70,
        questions: [
          { question: "What does HTML stand for?", options: [{ text: "Hyper Text Markup Language", isCorrect: true }, { text: "High Tech Modern Language", isCorrect: false }, { text: "Home Tool Markup Language", isCorrect: false }, { text: "Hyperlinks and Text Markup Language", isCorrect: false }], score: 10, order: 1 },
          { question: "Which CSS property is used to change text color?", options: [{ text: "text-color", isCorrect: false }, { text: "font-color", isCorrect: false }, { text: "color", isCorrect: true }, { text: "foreground", isCorrect: false }], score: 10, order: 2 },
          { question: "What is the correct HTML element for the largest heading?", options: [{ text: "<heading>", isCorrect: false }, { text: "<h6>", isCorrect: false }, { text: "<h1>", isCorrect: true }, { text: "<head>", isCorrect: false }], score: 10, order: 3 },
          { question: "Which JavaScript keyword is used to declare a variable?", options: [{ text: "var", isCorrect: true }, { text: "variable", isCorrect: false }, { text: "let", isCorrect: true }, { text: "const", isCorrect: true }], score: 10, order: 4 },
          { question: "What does CSS stand for?", options: [{ text: "Creative Style Sheets", isCorrect: false }, { text: "Computer Style Sheets", isCorrect: false }, { text: "Cascading Style Sheets", isCorrect: true }, { text: "Colorful Style Sheets", isCorrect: false }], score: 10, order: 5 },
        ],
      },
      {
        sectionKey: "Python for Data Science-" + courseMap["Machine Learning with Python"]._id,
        title: "Python Data Science Quiz",
        description: "Test your Python and data science knowledge",
        durationMinutes: 20,
        passPercent: 70,
        questions: [
          { question: "Which library is used for array manipulation in Python?", options: [{ text: "NumPy", isCorrect: true }, { text: "Pandas", isCorrect: false }, { text: "Matplotlib", isCorrect: false }, { text: "Scikit-learn", isCorrect: false }], score: 10, order: 1 },
          { question: "What is a DataFrame in Pandas?", options: [{ text: "A 1-dimensional array", isCorrect: false }, { text: "A 2-dimensional labeled data structure", isCorrect: true }, { text: "A visualization tool", isCorrect: false }, { text: "A machine learning model", isCorrect: false }], score: 10, order: 2 },
          { question: "Which function is used to read CSV files in Pandas?", options: [{ text: "read_csv()", isCorrect: true }, { text: "load_csv()", isCorrect: false }, { text: "open_csv()", isCorrect: false }, { text: "import_csv()", isCorrect: false }], score: 10, order: 3 },
          { question: "What does ML stand for?", options: [{ text: "Modern Learning", isCorrect: false }, { text: "Machine Learning", isCorrect: true }, { text: "Main Logic", isCorrect: false }, { text: "Data Learning", isCorrect: false }], score: 10, order: 4 },
          { question: "Which Python library is used for machine learning?", options: [{ text: "NumPy", isCorrect: false }, { text: "Pandas", isCorrect: false }, { text: "Scikit-learn", isCorrect: true }, { text: "Flask", isCorrect: false }], score: 10, order: 5 },
        ],
      },
      {
        sectionKey: "Design Principles-" + courseMap["UI/UX Design Fundamentals"]._id,
        title: "UI/UX Design Basics Quiz",
        description: "Test your design principles knowledge",
        durationMinutes: 15,
        passPercent: 70,
        questions: [
          { question: "What does UX stand for?", options: [{ text: "User Experience", isCorrect: true }, { text: "User Interface", isCorrect: false }, { text: "Universal Experience", isCorrect: false }, { text: "Unified Experience", isCorrect: false }], score: 10, order: 1 },
          { question: "What is a user persona?", options: [{ text: "A fictional representation of your ideal user", isCorrect: true }, { text: "A marketing document", isCorrect: false }, { text: "A design tool", isCorrect: false }, { text: "A coding language", isCorrect: false }], score: 10, order: 2 },
          { question: "Which color scheme uses colors opposite each other on the color wheel?", options: [{ text: "Monochromatic", isCorrect: false }, { text: "Analogous", isCorrect: false }, { text: "Complementary", isCorrect: true }, { text: "Split-complementary", isCorrect: false }], score: 10, order: 3 },
          { question: "What is wireframing?", options: [{ text: "A high-fidelity design mockup", isCorrect: false }, { text: "A low-fidelity structural blueprint", isCorrect: true }, { text: "A coding framework", isCorrect: false }, { text: "A color palette", isCorrect: false }], score: 10, order: 4 },
          { question: "What is typography?", options: [{ text: "The art of arranging text", isCorrect: true }, { text: "A type of printing", isCorrect: false }, { text: "A font family", isCorrect: false }, { text: "A design software", isCorrect: false }], score: 10, order: 5 },
        ],
      },
      {
        sectionKey: "Containerization with Docker-" + courseMap["DevOps & Cloud Computing"]._id,
        title: "Docker Basics Quiz",
        description: "Test your containerization knowledge",
        durationMinutes: 15,
        passPercent: 70,
        questions: [
          { question: "What is Docker?", options: [{ text: "A virtualization platform", isCorrect: true }, { text: "A programming language", isCorrect: false }, { text: "An operating system", isCorrect: false }, { text: "A database", isCorrect: false }], score: 10, order: 1 },
          { question: "What is a Docker container?", options: [{ text: "A physical server", isCorrect: false }, { text: "A lightweight, executable package", isCorrect: true }, { text: "A network protocol", isCorrect: false }, { text: "A file system", isCorrect: false }], score: 10, order: 2 },
          { question: "What file is used to build a Docker image?", options: [{ text: "dockerfile", isCorrect: true }, { text: "docker-compose.yml", isCorrect: false }, { text: "config.json", isCorrect: false }, { text: "Dockerfile", isCorrect: true }], score: 10, order: 3 },
          { question: "What command is used to run a Docker container?", options: [{ text: "docker create", isCorrect: false }, { text: "docker run", isCorrect: true }, { text: "docker start", isCorrect: false }, { text: "docker build", isCorrect: false }], score: 10, order: 4 },
          { question: "What is Docker Hub?", options: [{ text: "A cloud storage service", isCorrect: false }, { text: "A container registry", isCorrect: true }, { text: "A programming language", isCorrect: false }, { text: "A CI/CD tool", isCorrect: false }], score: 10, order: 5 },
        ],
      },
    ];

    // Create exams
    for (const examInfo of examData) {
      const section = sectionMap[examInfo.sectionKey];
      if (!section) continue;

      let exam = await Exam.findOne({ section: section._id });
      if (!exam) {
        exam = await Exam.create({
          section: section._id,
          order: 1,
          title: examInfo.title,
          description: examInfo.description,
          durationMinutes: examInfo.durationMinutes,
          passPercent: examInfo.passPercent,
        });
        console.log(`   ✅ Created exam: ${exam.title}`);

        for (const q of examInfo.questions) {
          await ExamQuestion.create({
            exam: exam._id,
            question: q.question,
            options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
            score: q.score,
            order: q.order,
          });
        }
        console.log(`   ✅ Created ${examInfo.questions.length} questions`);
      }
    }

    // ===== ENROLLMENTS =====
    console.log("\n👨‍🎓 Seeding enrollments...");
    const student1 = userMap["student1@demo.com"];
    const student2 = userMap["student2@demo.com"];
    const student3 = userMap["student3@demo.com"];

    const allCourseIds = Object.values(courseMap).map((c: any) => c._id);
    
    const enrollments = [];
    // Each student enrolls in all 4 courses
    for (const student of [student1, student2, student3]) {
      for (const courseId of allCourseIds) {
        enrollments.push({ user: student._id, course: courseId, progress: Math.floor(Math.random() * 80) + 10 });
      }
    }

    try {
      await Enrollment.insertMany(enrollments, { ordered: false });
    } catch (e: any) {
      if (e.code !== 11000) throw e;
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Demo Accounts:");
    console.log("   Admin: admin@demo.com / admin");
    console.log("   Teacher: teacher1@demo.com / teacher123");
    console.log("   Teacher: teacher2@demo.com / teacher123");
    console.log("   Student: student1@demo.com / student123");
    console.log("   Student: student2@demo.com / student123");
    console.log("   Student: student3@demo.com / student123");
    console.log("\n📦 Seed finished - keeping connection open for server");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}
