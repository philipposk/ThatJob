const fs = require('fs');
const path = require('path');
const React = require('react');
const {
  Document,
  Page,
  Text,
  View,
  Link,
  Image,
  StyleSheet,
  renderToFile,
} = require('@react-pdf/renderer');

const outputDir = path.join(process.cwd(), 'generated-cvs');
fs.mkdirSync(outputDir, { recursive: true });

const possiblePhotoPaths = [
  path.join(process.cwd(), 'public', 'cv', 'profile-photo.jpg'),
  path.join(process.cwd(), 'public', 'cv', 'profile-photo.jpeg'),
  path.join(process.cwd(), 'public', 'cv', 'profile-photo.png'),
  path.join(process.cwd(), 'profile-photo.jpg'),
  path.join(process.cwd(), 'profile-photo.jpeg'),
  path.join(process.cwd(), 'profile-photo.png'),
];

const profilePhoto = possiblePhotoPaths.find((filePath) => fs.existsSync(filePath));

// Override locally with env vars if you generate real PDFs (never commit secrets).
const base = {
  name: process.env.CV_PREVIEW_NAME || 'Sample Candidate',
  location: process.env.CV_PREVIEW_LOCATION || 'City, Country',
  phone: process.env.CV_PREVIEW_PHONE || '+00 00 00 00 00',
  email: process.env.CV_PREVIEW_EMAIL || 'you@example.com',
  linkedin: process.env.CV_PREVIEW_LINKEDIN || 'linkedin.com/in/your-profile',
  portfolio: process.env.CV_PREVIEW_PORTFOLIO || 'portfolio.example',
  github: process.env.CV_PREVIEW_GITHUB || 'github.com/your-username',
  languages: ['English (professional)'],
  // Keep this modest: light reading + hobby scale, not “research programme” or “platform ecosystem”.
  interests: [
    'Casual reading online (science, medicine, language — short articles and explainers, not formal study)',
    'Keeping up with AI and dev tools in a hands-on, practical way (trying models and assistants, not architecting platforms)',
    'Furniture making and vintage motorbike restoration',
    'Small hobby web apps and practice projects on my personal site — learning and fun, not a company or product line',
  ],
};

const aiEngineerCV = {
  role: 'AI Engineer',
  accent: '#1F6FEB',
  accentSoft: '#EAF2FF',
  profile:
    'AI engineer with an MSc in Computational Physics and hands-on experience building AI-powered products end to end. Strong in Python, machine learning, NLP, forecasting, and full-stack delivery.',
  sidebarTitle: 'Core Stack',
  sidebarItems: [
    'Python, SQL, C/C++, TypeScript',
    'PyTorch, TensorFlow, scikit-learn, Hugging Face',
    'Pandas, NumPy, Matplotlib',
    'NLP, speech workflows, forecasting, anomaly detection',
    'Next.js, React, Supabase, PostgreSQL',
    'Git, Docker, open-source model workflows',
  ],
  experience: [
    {
      title: 'Independent AI / Product Builder',
      meta: '2023 - Present',
      bullets: [
        'Built and iterated on AI-powered applications across document automation, speech workflows, forecasting, health tracking, and developer tooling.',
        'Worked across experimentation, model integration, frontend/backend delivery, and deployment-oriented implementation.',
      ],
    },
    {
      title: 'Data Analyst, University of the Aegean',
      meta: '2022 - 2023',
      bullets: [
        'Processed environmental and microbiological datasets using SQL/Python and produced analyses for decision support.',
      ],
    },
    {
      title: 'Co-Founder, Mediterranean Institute',
      meta: '2020 - 2024',
      bullets: [
        'Turned scientific literature into educational material, strengthening research synthesis and technical communication.',
      ],
    },
  ],
  projects: [
    {
      name: 'ThatJob',
      text: 'AI-powered assistant for tailored CVs and cover letters using job matching, company research, and document generation.',
    },
    {
      name: 'Mr.Transcribe',
      text: 'Speech-to-text web app with AI-assisted refinement, optimized for Greek.',
    },
    {
      name: 'Digestive Diary',
      text: 'Health tracking app using voice and photo input to identify patterns and generate insights.',
    },
    {
      name: 'MarketForecast',
      text: 'Time-series analysis and forecasting tool focused on pattern detection and predictive modeling.',
    },
  ],
  education: [
    {
      title: 'MSc in Computational Physics',
      meta: 'University of Copenhagen | 2021 - 2024',
      text: 'Thesis: misalignment detection for McStas neutron simulation data using optimization and machine learning.',
    },
    {
      title: 'BSc in Physics',
      meta: 'National and Kapodistrian University of Athens | 2017 - 2021',
      text: 'Specialization in telecommunications, electronics, computer science, and automated systems.',
    },
  ],
};

const consultantCV = {
  role: 'Technology Consultant',
  accent: '#0C8A6A',
  accentSoft: '#E8F8F3',
  profile:
    'Technology consultant candidate with an MSc in Computational Physics and hands-on experience building digital products, AI applications, and data-driven tools. Strong at turning ideas into working systems and explaining technical work clearly.',
  sidebarTitle: 'Strengths',
  sidebarItems: [
    'Problem framing and structured thinking',
    'Rapid prototyping and MVP delivery',
    'AI, analytics, and automation workflows',
    'Stakeholder communication',
    'Product thinking and solution design',
    'Fast learning across tools and domains',
  ],
  experience: [
    {
      title: 'Independent Builder - AI, Data, and Product Projects',
      meta: '2023 - Present',
      bullets: [
        'Built small side-project apps and experiments across AI, education, analytics, automation, and simple web UIs (hobby / learning scale, not a formal product org).',
        'Worked from rough idea to prototype, iteration, and basic deployment where it made sense.',
      ],
    },
    {
      title: 'Data Analyst, University of the Aegean',
      meta: '2022 - 2023',
      bullets: [
        'Created SQL/Python data workflows that turned complex datasets into usable outputs for stakeholders.',
      ],
    },
    {
      title: 'Co-Founder, Mediterranean Institute',
      meta: '2020 - 2024',
      bullets: [
        'Converted scientific literature into practical learning material for participants and teachers.',
      ],
    },
  ],
  projects: [
    {
      name: 'ThatJob',
      text: 'Combines user needs, business logic, AI integration, and product delivery in a practical tool.',
    },
    {
      name: 'ProjectHub',
      text: 'Research management and analysis portal for documents, papers, projects, and data-heavy workflows.',
    },
    {
      name: 'School',
      text: 'Online learning platform demonstrating structured content delivery and practical platform thinking.',
    },
    {
      name: 'AppMaker / WebsiteCreator / AppBlueprints',
      text: 'AI-assisted tools for rapid prototyping, system blueprints, and solution design.',
    },
  ],
  education: [
    {
      title: 'MSc in Computational Physics',
      meta: 'University of Copenhagen | 2021 - 2024',
      text: 'Quantitative background in modelling, computation, machine learning, and analytical problem solving.',
    },
    {
      title: 'BSc in Physics',
      meta: 'National and Kapodistrian University of Athens | 2017 - 2021',
      text: 'Foundation in physics, mathematics, statistics, and technical computing.',
    },
  ],
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F6F8FB',
    fontFamily: 'Helvetica',
    fontSize: 8.9,
    color: '#162033',
  },
  sidebarBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 182,
    backgroundColor: '#10213A',
  },
  sidebarStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
  },
  sidebarContent: {
    position: 'absolute',
    left: 22,
    top: 20,
    width: 138,
  },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    marginBottom: 10,
    objectFit: 'cover',
  },
  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarInitials: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#10213A',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 1.15,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  rolePill: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 14,
  },
  rolePillText: {
    color: '#FFFFFF',
    fontSize: 8.3,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.6,
  },
  sideSection: {
    marginBottom: 12,
  },
  sideHeading: {
    color: '#D8E1EF',
    fontSize: 7.8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  sideText: {
    color: '#F3F7FF',
    fontSize: 8.1,
    lineHeight: 1.32,
    marginBottom: 4,
  },
  sideBullet: {
    color: '#F3F7FF',
    fontSize: 8,
    lineHeight: 1.28,
    marginBottom: 3,
  },
  main: {
    marginLeft: 182,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 22,
    paddingRight: 24,
  },
  topAccent: {
    height: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    marginBottom: 11,
    border: '1 solid #DDE4F0',
  },
  section: {
    marginBottom: 9,
  },
  sectionHeading: {
    fontSize: 9,
    color: '#50617F',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  entry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    border: '1 solid #E1E7F0',
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 9.6,
    fontFamily: 'Helvetica-Bold',
    color: '#13213A',
    width: '72%',
  },
  entryMeta: {
    fontSize: 8,
    color: '#64748B',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    width: '28%',
  },
  entryText: {
    fontSize: 8.35,
    lineHeight: 1.28,
    color: '#2B3648',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 9.1,
    fontFamily: 'Helvetica-Bold',
    color: '#13213A',
    marginBottom: 2,
  },
});

const e = React.createElement;

function renderSidebarItem(item) {
  return e(Text, { style: styles.sideBullet, key: item }, `• ${item}`);
}

function renderLinkLine(label, value, url) {
  return e(
    View,
    { key: label, style: { marginBottom: 5 } },
    e(Text, { style: styles.sideHeading }, label),
    url
      ? e(Link, { src: url, style: styles.sideText }, value)
      : e(Text, { style: styles.sideText }, value)
  );
}

function renderExperienceEntry(item) {
  return e(
    View,
    { key: `${item.title}-${item.meta}`, style: styles.entry },
    e(
      View,
      { style: styles.entryHeader },
      e(Text, { style: styles.entryTitle }, item.title),
      e(Text, { style: styles.entryMeta }, item.meta)
    ),
    ...item.bullets.map((bullet) =>
      e(Text, { key: bullet, style: styles.entryText }, `• ${bullet}`)
    )
  );
}

function renderProjectEntry(item) {
  return e(
    View,
    { key: item.name, style: styles.entry },
    e(Text, { style: styles.projectName }, item.name),
    e(Text, { style: styles.entryText }, item.text)
  );
}

function renderEducationEntry(item) {
  return e(
    View,
    { key: `${item.title}-${item.meta}`, style: styles.entry },
    e(
      View,
      { style: styles.entryHeader },
      e(Text, { style: styles.entryTitle }, item.title),
      e(Text, { style: styles.entryMeta }, item.meta)
    ),
    e(Text, { style: styles.entryText }, item.text)
  );
}

function CVDocument(config) {
  return e(
    Document,
    {
      title: `${base.name} - ${config.role}`,
      author: base.name,
      subject: `${config.role} CV`,
      creator: 'Cursor + @react-pdf/renderer',
      keywords: `${config.role}, CV, ${base.name}`,
    },
    e(
      Page,
      { size: 'A4', style: styles.page },
      e(View, {
        style: [styles.sidebarBg, styles.sidebarStripe, { backgroundColor: config.accent }],
      }),
      e(View, { style: styles.sidebarBg }),
      e(
        View,
        { style: styles.sidebarContent },
        profilePhoto
          ? e(Image, { src: profilePhoto, style: styles.avatarImage })
          : e(
              View,
              { style: styles.avatarCircle },
              e(
                Text,
                { style: styles.avatarInitials },
                base.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? '')
                  .join('') || '?'
              )
            ),
        e(Text, { style: styles.name }, base.name),
        e(
          View,
          { style: [styles.rolePill, { backgroundColor: config.accent }] },
          e(Text, { style: styles.rolePillText }, config.role.toUpperCase())
        ),
        e(
          View,
          { style: styles.sideSection },
          e(Text, { style: styles.sideHeading }, 'Contact'),
          e(Text, { style: styles.sideText }, base.location),
          e(Text, { style: styles.sideText }, base.phone),
          e(Link, { src: `mailto:${base.email}`, style: styles.sideText }, base.email),
          e(Link, { src: `https://${base.linkedin}`, style: styles.sideText }, base.linkedin),
          e(Link, { src: `https://${base.portfolio}`, style: styles.sideText }, base.portfolio),
          e(Link, { src: `https://${base.github}`, style: styles.sideText }, base.github)
        ),
        e(
          View,
          { style: styles.sideSection },
          e(Text, { style: styles.sideHeading }, config.sidebarTitle),
          ...config.sidebarItems.map(renderSidebarItem)
        ),
        e(
          View,
          { style: styles.sideSection },
          e(Text, { style: styles.sideHeading }, 'Languages'),
          ...base.languages.map((item) => e(Text, { style: styles.sideBullet, key: item }, `• ${item}`))
        ),
        e(
          View,
          { style: styles.sideSection },
          e(Text, { style: styles.sideHeading }, 'Interests'),
          ...base.interests.map((item) => e(Text, { style: styles.sideBullet, key: item }, `• ${item}`))
        )
      ),
      e(
        View,
        { style: styles.main },
        e(View, { style: [styles.topAccent, { backgroundColor: config.accent }] }),
        e(
          View,
          { style: styles.summaryCard },
          e(Text, { style: styles.sectionHeading }, 'Profile'),
          e(Text, { style: styles.entryText }, config.profile)
        ),
        e(
          View,
          { style: styles.section },
          e(Text, { style: styles.sectionHeading }, 'Experience'),
          ...config.experience.map(renderExperienceEntry)
        ),
        e(
          View,
          { style: styles.section },
          e(Text, { style: styles.sectionHeading }, 'Selected Projects'),
          ...config.projects.map(renderProjectEntry)
        ),
        e(
          View,
          { style: styles.section },
          e(Text, { style: styles.sectionHeading }, 'Education'),
          ...config.education.map(renderEducationEntry)
        )
      )
    )
  );
}

async function main() {
  const files = [
    {
      name: 'Sample_AI_Engineer_CV.pdf',
      config: aiEngineerCV,
    },
    {
      name: 'Sample_Technology_Consultant_CV.pdf',
      config: consultantCV,
    },
  ];

  for (const file of files) {
    const targetPath = path.join(outputDir, file.name);
    await renderToFile(e(CVDocument, file.config), targetPath);
    console.log(`Created ${targetPath}`);
  }

  if (!profilePhoto) {
    console.log(
      'No profile photo found. To add one later, place a JPG or PNG at public/cv/profile-photo.png and rerun this script.'
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
