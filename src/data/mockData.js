export const mockAchievements = [
  {
    id: 1,
    studentName: "Sarah Johnson",
    studentId: "STU001",
    activity: "National Science Olympiad",
    category: "Technical",
    level: "National",
    position: "1st Prize",
    date: "2024-01-15",
    description: "Won first prize in National Science Olympiad competition",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&h=150&fit=crop",
    status: "Verified"
  },
  {
    id: 2,
    studentName: "Arjun Patel",
    studentId: "STU002",
    activity: "State Basketball Championship",
    category: "Sports",
    level: "State",
    position: "1st Position",
    date: "2024-02-10",
    description: "Led team to victory in state level basketball tournament",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150&h=150&fit=crop",
    status: "Verified"
  },
  {
    id: 3,
    studentName: "Priya Sharma",
    studentId: "STU003",
    activity: "Cultural Dance Festival",
    category: "Cultural",
    level: "College",
    position: "Gold Medal",
    date: "2024-03-05",
    description: "Outstanding performance in inter-college dance festival",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
    status: "Verified"
  },
  {
    id: 4,
    studentName: "Rahul Kumar",
    studentId: "STU004",
    activity: "Hackathon Competition",
    category: "Technical",
    level: "College",
    position: "2nd Place",
    date: "2024-01-20",
    description: "Developed innovative IoT solution in college hackathon",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&h=150&fit=crop",
    status: "Verified"
  },
  {
    id: 5,
    studentName: "Ananya Das",
    studentId: "STU005",
    activity: "Debate Competition",
    category: "Cultural",
    level: "National",
    position: "Runner-up",
    date: "2024-02-28",
    description: "National level debate competition - secured second position",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    status: "Verified"
  },
  {
    id: 6,
    studentName: "Vikram Singh",
    studentId: "STU006",
    activity: "Football Tournament",
    category: "Sports",
    level: "State",
    position: "2nd Place",
    date: "2024-03-12",
    description: "Team participation in state football championship",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&h=150&fit=crop",
    status: "Verified"
  },
];

export const mockStudents = [
  {
    id: 1,
    name: "Sarah Johnson",
    studentId: "STU001",
    email: "sarah.johnson@university.edu",
    totalAchievements: 5,
    categories: {
      Sports: 1,
      Technical: 2,
      Cultural: 2,
      Other: 0
    },
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    id: 2,
    name: "Arjun Patel",
    studentId: "STU002",
    email: "arjun.patel@university.edu",
    totalAchievements: 8,
    categories: {
      Sports: 5,
      Technical: 1,
      Cultural: 2,
      Other: 0
    },
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    id: 3,
    name: "Priya Sharma",
    studentId: "STU003",
    email: "priya.sharma@university.edu",
    totalAchievements: 6,
    categories: {
      Sports: 0,
      Technical: 2,
      Cultural: 4,
      Other: 0
    },
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
  },
  {
    id: 4,
    name: "Rahul Kumar",
    studentId: "STU004",
    email: "rahul.kumar@university.edu",
    totalAchievements: 7,
    categories: {
      Sports: 1,
      Technical: 5,
      Cultural: 1,
      Other: 0
    },
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    id: 5,
    name: "Ananya Das",
    studentId: "STU005",
    email: "ananya.das@university.edu",
    totalAchievements: 4,
    categories: {
      Sports: 0,
      Technical: 1,
      Cultural: 3,
      Other: 0
    },
    image: "https://images.unsplash.com/photo-1507101105370-e240a89df5d9?w=150&h=150&fit=crop"
  },
  {
    id: 6,
    name: "Vikram Singh",
    studentId: "STU006",
    email: "vikram.singh@university.edu",
    totalAchievements: 9,
    categories: {
      Sports: 6,
      Technical: 1,
      Cultural: 2,
      Other: 0
    },
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop"
  },
];

export const monthlyAchievementsData = [
  { month: 'Jan', achievements: 12, students: 8 },
  { month: 'Feb', achievements: 19, students: 12 },
  { month: 'Mar', achievements: 15, students: 10 },
  { month: 'Apr', achievements: 25, students: 15 },
  { month: 'May', achievements: 22, students: 14 },
  { month: 'Jun', achievements: 30, students: 18 },
];

export const categoryDistributionData = [
  { name: 'Sports', value: 35 },
  { name: 'Technical', value: 28 },
  { name: 'Cultural', value: 25 },
  { name: 'Other', value: 12 },
];

export const statisticsData = [
  { label: 'Total Achievements', value: 143, icon: 'award', color: 'from-purple-500 to-indigo-600' },
  { label: 'Total Students', value: 6, icon: 'users', color: 'from-blue-500 to-cyan-600' },
  { label: 'National Level', value: 2, icon: 'flag', color: 'from-amber-500 to-orange-600' },
  { label: 'State Level', value: 4, icon: 'map-pin', color: 'from-emerald-500 to-teal-600' },
];

export const recentAchievementsData = [
  {
    id: 1,
    studentName: "Sarah Johnson",
    activity: "National Science Olympiad",
    level: "National",
    date: "2024-01-15",
    status: "Verified"
  },
  {
    id: 2,
    studentName: "Arjun Patel",
    activity: "State Basketball Championship",
    level: "State",
    date: "2024-02-10",
    status: "Verified"
  },
  {
    id: 3,
    studentName: "Priya Sharma",
    activity: "Cultural Dance Festival",
    level: "College",
    date: "2024-03-05",
    status: "Verified"
  },
];
