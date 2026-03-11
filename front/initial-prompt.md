Hey claude.
i have a project i want to work using react ts + tailwind and django drf
for frontend i want to use react query, axios, zod, react-hook-form, zustand (if needed) and others.


it is an school system which has the public website content for advertising and social communication, and management part which has scheduals, attendance, teacher student parent portals and other things.

school name: Sultan Zoy High School

first i want to make the front end public website content which is relatively easier.

i want you to generate some of the parts of the project with beautiful UI/UX and typed functions and components.

***************
structure pattern:
theming: generally i want two theme: dark and light, and for colors if you want to use a color instead of directly using it like bg-red-200 or text-blue-200 and if that color doesn't exist in below color values, define color variables. first give me the color var names and its values like this:
  card-color: white
  background: #1201ef

and then use them like this in classes.
bg-background or  text-card-color and other like this (JUST LIKE THIS NO OTHER WAY, YOU DO NOT USE LIKE text-var(--color-card-color) OR ANY OTHER WAY, JUST THE WAY I TOLD).

these are the existing colors i am using. you can use them like that or if you want to add new color variables just follow the above rules, and don't worry about how it works. 

@theme {
  /* Brand */
  --color-primary: var(--color-blue-600);
  --color-primary-dark: var(--color-blue-800);
  --color-secondary: var(--color-emerald-500);
  --color-accent: var(--color-amber-500);

  /* Layout */
  --color-background: var(--color-white);
  --color-surface: var(--color-slate-50);
  --color-card: var(--color-white);

  /* Text */
  --color-text-primary: var(--color-slate-800);
  --color-text-secondary: var(--color-slate-500);

  /* Borders */
  --color-border: var(--color-slate-200);

  /* Muted / disabled */
  --color-muted: var(--color-slate-400);

  /* Hover / active surfaces */
  --color-surface-hover: var(--color-slate-100);

  /* Focus / ring */
  --color-focus: var(--color-blue-500);

  /* Status */
  --color-success: var(--color-emerald-500);
  --color-warning: var(--color-amber-500);
  --color-error: var(--color-red-500);
  --color-info: var(--color-blue-500);

  /* Soft status backgrounds */
  --color-info-soft: var(--color-blue-100);
  --color-success-soft: var(--color-emerald-100);
  --color-warning-soft: var(--color-amber-100);
  --color-error-soft: var(--color-red-100);

  /* Destructive actions */
  --color-danger: var(--color-red-500);
}

[data-theme="dark"] {
  /* Brand */
  --color-primary: var(--color-blue-500);
  --color-primary-dark: var(--color-blue-600);
  --color-secondary: var(--color-emerald-500);
  --color-accent: var(--color-amber-400);

  /* Layout */
  --color-background: var(--color-slate-900);
  --color-surface: var(--color-slate-800);
  --color-card: var(--color-slate-700);

  /* Text */
  --color-text-primary: var(--color-slate-100);
  --color-text-secondary: var(--color-slate-300);

  /* Borders */
  --color-border: var(--color-slate-600);

  /* Muted / disabled */
  --color-muted: var(--color-slate-500);

  /* Hover / active surfaces */
  --color-surface-hover: var(--color-slate-700);

  /* Focus / ring */
  --color-focus: var(--color-blue-400);

  /* Status */
  --color-success: var(--color-emerald-400);
  --color-warning: var(--color-amber-400);
  --color-error: var(--color-red-400);
  --color-info: var(--color-blue-400);

  /* Soft status backgrounds */
  --color-info-soft: var(--color-blue-900);
  --color-success-soft: var(--color-emerald-900);
  --color-warning-soft: var(--color-amber-900);
  --color-error-soft: var(--color-red-900);

  /* Destructive actions */
  --color-danger: var(--color-red-400);
}


**************
this is a very brief requirements of the project, you can add other details if you feel suitable.

Recommended Sections for the School Website (Sultan Zoy High School)
1. Home Page
- Welcome message and a brief introduction of the school.
- Attractive photos and videos of the school environment, classrooms, and learning activities.
2. About Us
- Information about the school’s history, mission, values, and goals.
- Introductions of school management, teachers, and staff with short descriptions and photos.
- Display of awards, certificates, and recognition received by the school.
3. Academic Programs
- Information on courses and educational materials offered at the school.
- Class schedules and exam timetables.
4. News and Events
- Updates on recent school news and activities.
- School event calendar.
5. Contact Us
- Phone number, email address, and physical school address.
- School location map for parents and visitors.
6. Parents Section
- Guidance and support information for parents.
- Discussion space for parents to share questions and feedback.
7. Students Section
- Student profiles and personal academic information.
- Discussion forum for students to communicate and collaborate.
8. Security and Privacy Page
- Explanation of privacy policies and how student and user information is protected.
9. Gallery
- Photos and videos of school activities, ceremonies, and important events.
- Display of student artwork and projects.
10. Teacher Profiles
- Information about teachers’ qualifications and experience.
- Educational content and shared learning resources from teachers.
11. Feedback and Surveys
- Online surveys to collect feedback from parents, students, and staff.
- Feedback and suggestion forms.
12. Awards and Achievements
- Display of school awards and student achievements.
- Information about students’ personal academic and extracurricular achievements.
13. Online Library- Access to digital books, articles, and educational resources.
- Library catalog of available books.
14. Career Opportunities
- Listing available job opportunities in the school.
- Online job application form.
15. Community Support
- Information about social support programs and community collaborations.
- Introduction to charity organizations and partners working with the school.
16. Student Portal
- Personal student accounts with access to grades, assignments, and learning materials.
- Direct communication channel with teachers.
17. Testimonials
- Reviews and experiences shared by parents and students.
18. Thank You Page
- Appreciation message for supporters, parents, and partner organizations.
- Display of sponsors and donors.
19. Student Projects
- Display of students’ outstanding academic and creative projects.
- Encouragement of teamwork and collaborative projects.
20. School History
- Detailed information on the school’s establishment and development.
- Display of historical photos and important milestones.
21. Sports Teams
- Introduction of school sports teams and training programs.
- Display of match results and sports events.
22. Cultural and Performing Arts
- Information about cultural programs and art activities at the school.
- Photos and videos from performances and student art shows.
23. Competitions and Contests
- Information about academic, cultural, and athletic competitions.
- Encouraging students to participate and guidelines for competitions.
24. Internships and Work Experience
- Introduction to internship opportunities for students.
- Providing exposure to various career fields.
25. Honors and Awards
- Display of achievements and honors received by the school and students.
26. Educational Trips
- Information about educational tours and scientific field trips.27. International Collaborations
- Introduction to international educational partnerships and exchange projects.
28. Library Services
- Explanation of library services including digital resources and book lending.
29. Student Associations
- Introduction to student clubs and extracurricular groups.
- Display of student activities and leadership roles.
30. Parent-Teacher Interactions
- Information about parent-teacher meetings and communication guidelines.
- Feedback forms for parents.
31. Parent Involvement
- Encouraging more parental participation in school activities.
- Introduction of parent-led volunteer groups.
32. Arts and Crafts
- Display of student artwork and handmade crafts.
- Organization of workshops and art training sessions.
33. Parent Portal
- Private messaging system between parents and teachers.
- Access to academic progress reports and student grades.
34. Hall of Fame
- Highlighting distinguished students and teachers of the school.
35. Charity Events
- Information about charity events organized by the school.
- Encouraging parents and students to participate in charitable activities.
36. Recreational Activities
- Introduction to recreational programs and entertainment events for students.
- Online registration for recreational activities.
37. Alumni Relations
- Profiles and updates of alumni and graduates.
- Organizing alumni meetings and events.


right now i have completed the Home, About, Academic Programs, News And Events, Contact Us, Gallery, teacher profile, Awards and achievements and testimonials pages and have these plus other components.
Navbar, Footer, CTASection, PageHeader and others which can be imported from components/ or components/layout/

now i want you to make the career oportunities section good.

if you have any question or do not understand any part, tell me, if no then go.
