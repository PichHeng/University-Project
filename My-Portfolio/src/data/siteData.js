import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCode,
  FiDatabase,
  FiGlobe,
  FiLayers,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSmartphone,
  FiTerminal,
  FiTool,
} from 'react-icons/fi'
import {
  SiCplusplus,
  SiDart,
  SiExpress,
  SiFlutter,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiPostman,
  SiReact,
  SiTailwindcss,
} from 'react-icons/si'

export const profile = {
  name: 'Tween',
  role: 'Software Engineering Student',
  tagline:
    'Passionate Software Engineering Student focused on building modern web and mobile applications.',
  summary:
    'I enjoy turning course ideas into usable products, especially React interfaces, Flutter mobile apps, and structured C++ systems.',
  location: 'Available for internships and entry-level developer roles',
  email: 'hello@example.com',
  phone: '+855 00 000 000',
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  facebook: 'https://www.facebook.com/',
}

export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Skills', to: '/skills' },
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Education', to: '/education' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Contact', to: '/contact' },
]

export const stats = [
  { label: 'Projects Completed', value: '12+' },
  { label: 'Technologies Learned', value: '18+' },
  { label: 'Internship Goals', value: '2026' },
  { label: 'GitHub Contributions', value: '120+' },
]

export const focusAreas = [
  'Frontend systems with React, accessibility, and responsive UI',
  'Mobile experiences with Flutter and reusable Dart components',
  'Object-oriented C++ applications with clean file handling',
  'Database-backed apps using MySQL, MongoDB, and API workflows',
]

export const journey = [
  {
    period: '2024',
    title: 'Programming Foundation',
    description: 'Built comfort with C++, algorithms, OOP, and file-based systems.',
  },
  {
    period: '2025',
    title: 'Web Development Growth',
    description: 'Moved from static HTML/CSS pages into JavaScript, React, and API-driven UI.',
  },
  {
    period: '2026',
    title: 'Portfolio and Internship Readiness',
    description: 'Packaging academic work into polished projects and preparing for software roles.',
  },
]

export const skillGroups = [
  {
    title: 'Frontend',
    icon: FiGlobe,
    skills: [
      { name: 'HTML', level: 92, icon: SiHtml5 },
      { name: 'CSS', level: 88, icon: FiCode },
      { name: 'JavaScript', level: 84, icon: SiJavascript },
      { name: 'React', level: 80, icon: SiReact },
      { name: 'Tailwind CSS', level: 82, icon: SiTailwindcss },
    ],
  },
  {
    title: 'Backend',
    icon: FiTerminal,
    skills: [
      { name: 'Node.js', level: 70, icon: SiNodedotjs },
      { name: 'Express.js', level: 66, icon: SiExpress },
    ],
  },
  {
    title: 'Database',
    icon: FiDatabase,
    skills: [
      { name: 'MySQL', level: 76, icon: SiMysql },
      { name: 'MongoDB', level: 68, icon: SiMongodb },
    ],
  },
  {
    title: 'Programming Languages',
    icon: FiCode,
    skills: [
      { name: 'C++', level: 86, icon: SiCplusplus },
      { name: 'Java', level: 72, icon: FiCode },
      { name: 'JavaScript', level: 84, icon: SiJavascript },
      { name: 'Dart', level: 70, icon: SiDart },
    ],
  },
  {
    title: 'Mobile Development',
    icon: FiSmartphone,
    skills: [{ name: 'Flutter', level: 70, icon: SiFlutter }],
  },
  {
    title: 'Tools',
    icon: FiTool,
    skills: [
      { name: 'Git', level: 80, icon: SiGit },
      { name: 'GitHub', level: 82, icon: SiGithub },
      { name: 'VS Code', level: 88, icon: FiTool },
      { name: 'Linux', level: 64, icon: SiLinux },
      { name: 'Postman', level: 66, icon: SiPostman },
    ],
  },
]

export const projects = [
  {
    title: 'Employee Management System',
    category: 'C++',
    image: 'EMS',
    description:
      'Console-based management workflow with employee records, OOP structure, and persistent file handling.',
    tech: ['C++', 'File Handling', 'OOP'],
    github: 'https://github.com/',
    demo: 'https://github.com/',
  },
  {
    title: 'Hospital Management System',
    category: 'C++',
    image: 'HMS',
    description:
      'Role-aware hospital system with authentication, binary files, and structured patient records.',
    tech: ['C++', 'Authentication', 'Binary Files'],
    github: 'https://github.com/',
    demo: 'https://github.com/',
  },
  {
    title: 'Population Growth Modeling',
    category: 'Academic',
    image: 'PGM',
    description:
      'Mathematical model exploring population change through differential equations and visual interpretation.',
    tech: ['Differential Equation', 'Math Modeling', 'Research'],
    github: 'https://github.com/',
    demo: 'https://github.com/',
  },
  {
    title: 'Flutter Mobile App',
    category: 'Mobile',
    image: 'APP',
    description:
      'Mobile UI prototype built with reusable widgets, smooth navigation, and clear user flows.',
    tech: ['Dart', 'Flutter', 'Mobile UI'],
    github: 'https://github.com/',
    demo: 'https://github.com/',
  },
  {
    title: 'Portfolio Website',
    category: 'Web',
    image: 'WEB',
    description:
      'Responsive personal portfolio with React routing, dark mode, project filters, and motion.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    github: 'https://github.com/',
    demo: 'https://github.com/',
  },
]

export const experience = [
  {
    icon: FiBriefcase,
    organization: 'Internship Preparation',
    duration: 'Current',
    title: 'Software Engineering Student',
    description:
      'Building interview-ready projects and strengthening practical frontend, mobile, and backend fundamentals.',
    achievements: ['Portfolio refinement', 'GitHub project cleanup', 'Reusable React components'],
  },
  {
    icon: FiLayers,
    organization: 'University Projects',
    duration: '2024 - Present',
    title: 'Project Contributor',
    description:
      'Collaborated on academic software projects with documentation, testing, and presentation milestones.',
    achievements: ['C++ system design', 'Database planning', 'Team demos'],
  },
  {
    icon: FiAward,
    organization: 'Volunteer and Peer Support',
    duration: 'Ongoing',
    title: 'Learning Community Member',
    description:
      'Helps classmates debug assignments, explain programming concepts, and review project ideas.',
    achievements: ['Code reviews', 'Study sessions', 'Presentation support'],
  },
]

export const education = [
  {
    school: 'University',
    degree: 'Bachelor of Software Engineering',
    period: 'Expected Graduation: 2028',
    details:
      'Focused on software design, data structures, databases, web development, and mobile application development.',
  },
]

export const coursework = [
  'Data Structures and Algorithms',
  'Object-Oriented Programming',
  'Database Systems',
  'Web Application Development',
  'Software Engineering Principles',
  'Discrete Mathematics',
]

export const certifications = [
  { name: 'Responsive Web Design', issuer: 'freeCodeCamp', date: '2026', link: 'https://www.freecodecamp.org/' },
  { name: 'JavaScript Fundamentals', issuer: 'Online Learning', date: '2026', link: 'https://developer.mozilla.org/' },
  { name: 'Git and GitHub Essentials', issuer: 'Developer Training', date: '2025', link: 'https://github.com/' },
]

export const contactMethods = [
  { label: 'Email', value: profile.email, icon: FiMail, href: `mailto:${profile.email}` },
  { label: 'Phone', value: profile.phone, icon: FiPhone, href: `tel:${profile.phone}` },
  { label: 'Location', value: profile.location, icon: FiMapPin, href: '/contact' },
  { label: 'Learning', value: 'React, Flutter, APIs', icon: FiBookOpen, href: '/skills' },
]
