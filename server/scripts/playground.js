// Run in mongosh:   load("server/scripts/playground.js")
// Creates a throw-away database "skillmesh_playground" with 8 people to practise on.
// Safe to re-run: it drops and recreates the collection each time.
const pg = db.getSiblingDB("skillmesh_playground");
pg.people.drop();
pg.people.insertMany([
  {
    "name": "Aarav Mehta",
    "role": "Full-stack Developer",
    "color": "#dce4ff",
    "skills": [
      "React",
      "Node.js",
      "PostgreSQL",
      "API Design"
    ],
    "interests": [
      "AI/ML",
      "Startups",
      "Hackathons"
    ],
    "bio": "Turns messy ideas into reliable products. Loves shipping fast and learning in public.",
    "online": true,
    "availability": {
      "hours": "Weekends",
      "days": [
        "Saturday",
        "Sunday"
      ]
    }
  },
  {
    "name": "Ishita Kapoor",
    "role": "UI/UX Designer",
    "color": "#ffe2dd",
    "skills": [
      "Figma",
      "Prototyping",
      "Design Systems",
      "Research"
    ],
    "interests": [
      "Design",
      "Startups",
      "Social Impact"
    ],
    "bio": "Designs thoughtful digital experiences from first sketch to polished prototype.",
    "online": true,
    "availability": {
      "hours": "Evenings",
      "days": [
        "Monday",
        "Wednesday",
        "Friday"
      ]
    }
  },
  {
    "name": "Kabir Singh",
    "role": "AI/ML Engineer",
    "color": "#e6dcff",
    "skills": [
      "Python",
      "Machine Learning",
      "NLP",
      "Data Science"
    ],
    "interests": [
      "AI/ML",
      "Research",
      "Hackathons"
    ],
    "bio": "Interested in practical AI, recommendation systems, and turning data into useful products.",
    "online": false,
    "availability": {
      "hours": "Flexible",
      "days": [
        "Tuesday",
        "Thursday",
        "Saturday"
      ]
    }
  },
  {
    "name": "Meera Joshi",
    "role": "Backend Developer",
    "color": "#d7f3e7",
    "skills": [
      "Java",
      "Spring Boot",
      "SQL",
      "System Design"
    ],
    "interests": [
      "Startups",
      "Fintech",
      "Hackathons"
    ],
    "bio": "Builds scalable APIs and clean backend architecture. Big fan of solving real problems.",
    "online": true,
    "availability": {
      "hours": "Weekends",
      "days": [
        "Saturday",
        "Sunday"
      ]
    }
  },
  {
    "name": "Rohan Bedi",
    "role": "Product Manager",
    "color": "#fff0ca",
    "skills": [
      "Product Strategy",
      "Agile",
      "Research",
      "Analytics"
    ],
    "interests": [
      "Startups",
      "Social Impact",
      "Fintech"
    ],
    "bio": "Connects user problems to product strategy and helps teams stay focused on outcomes.",
    "online": true,
    "availability": {
      "hours": "Evenings",
      "days": [
        "Monday",
        "Tuesday",
        "Thursday"
      ]
    }
  },
  {
    "name": "Ananya Rao",
    "role": "Frontend Developer",
    "color": "#d6edff",
    "skills": [
      "JavaScript",
      "HTML/CSS",
      "React",
      "Accessibility"
    ],
    "interests": [
      "Design",
      "AI/ML",
      "Hackathons"
    ],
    "bio": "Makes the web feel fast, accessible, and delightful. Always building something new.",
    "online": false,
    "availability": {
      "hours": "Flexible",
      "days": [
        "Wednesday",
        "Friday",
        "Sunday"
      ]
    }
  },
  {
    "name": "Dev Malhotra",
    "role": "Cloud & DevOps",
    "color": "#f6ddeb",
    "skills": [
      "Docker",
      "AWS",
      "CI/CD",
      "Linux"
    ],
    "interests": [
      "Startups",
      "Fintech",
      "Hackathons"
    ],
    "bio": "Enjoys automating deployments and making products resilient from day one.",
    "online": true,
    "availability": {
      "hours": "Weekends",
      "days": [
        "Saturday",
        "Sunday"
      ]
    }
  },
  {
    "name": "Simran Gill",
    "role": "Data Analyst",
    "color": "#e7e8ec",
    "skills": [
      "SQL",
      "Python",
      "Power BI",
      "Statistics"
    ],
    "interests": [
      "AI/ML",
      "Research",
      "Social Impact"
    ],
    "bio": "Finds the story inside data and turns analysis into decisions teams can use.",
    "online": true,
    "availability": {
      "hours": "Evenings",
      "days": [
        "Monday",
        "Wednesday"
      ]
    }
  }
]);
print("Inserted " + pg.people.countDocuments() + " people into skillmesh_playground.people");
