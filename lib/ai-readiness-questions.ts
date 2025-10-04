import { Question } from './question-types';

export const AI_READINESS_QUESTIONS: Question[] = [
  // === AI STRATEGY & GOVERNANCE (6 questions) ===
  {
    id: "AIR_01",
    section: "AI Strategy & Governance",
    prompt: "Our institution has a formal AI strategy that aligns with our mission and strategic plan.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether your institution has documented AI goals, policies, and implementation roadmap.",
    enableContext: true,
    contextPrompt: "Describe your current AI strategy documentation and governance structure."
  },
  {
    id: "AIR_02",
    section: "AI Strategy & Governance",
    prompt: "We have designated leadership responsible for AI initiatives and decision-making.",
    type: "likert",
    required: true,
    helpText: "Consider whether there's clear accountability and decision-making authority for AI projects.",
    enableContext: true
  },
  {
    id: "AIR_03",
    section: "AI Strategy & Governance",
    prompt: "Our AI governance framework addresses ethics, privacy, and responsible AI use.",
    type: "likert",
    required: true,
    helpText: "Assess your policies for ethical AI use, bias prevention, and privacy protection.",
    enableContext: true
  },
  {
    id: "AIR_04",
    section: "AI Strategy & Governance",
    prompt: "We have established metrics and KPIs to measure AI initiative success.",
    type: "likert",
    required: true,
    helpText: "Consider whether you track ROI, efficiency gains, and other success indicators for AI projects."
  },
  {
    id: "AIR_05",
    section: "AI Strategy & Governance",
    prompt: "Our budget planning includes dedicated funding for AI initiatives and infrastructure.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether AI investments are formally planned and budgeted."
  },
  {
    id: "AIR_06",
    section: "AI Strategy & Governance",
    prompt: "We regularly review and update our AI strategy based on emerging technologies and outcomes.",
    type: "likert",
    required: true,
    helpText: "Consider how often you reassess AI strategy and adapt to new developments."
  },

  // === PEDAGOGICAL INTEGRATION (5 questions) ===
  {
    id: "AIR_07",
    section: "Pedagogical Integration",
    prompt: "Faculty are trained and supported in integrating AI tools into their teaching practices.",
    type: "likert",
    required: true,
    helpText: "Assess the level of faculty development and support for AI-enhanced pedagogy.",
    enableContext: true,
    contextPrompt: "Describe current faculty training programs and support for AI integration."
  },
  {
    id: "AIR_08",
    section: "Pedagogical Integration",
    prompt: "We have developed curriculum guidelines for appropriate AI use in coursework and assessments.",
    type: "likert",
    required: true,
    helpText: "Consider whether there are clear policies about when and how AI can be used academically."
  },
  {
    id: "AIR_09",
    section: "Pedagogical Integration",
    prompt: "Students receive education about AI literacy, ethics, and responsible use.",
    type: "likert",
    required: true,
    helpText: "Evaluate student preparation for working with AI tools responsibly.",
    enableContext: true
  },
  {
    id: "AIR_10",
    section: "Pedagogical Integration",
    prompt: "Our learning management systems and educational technology integrate effectively with AI tools.",
    type: "likert",
    required: true,
    helpText: "Assess technical integration between existing systems and AI applications."
  },
  {
    id: "AIR_11",
    section: "Pedagogical Integration",
    prompt: "We regularly assess the impact of AI integration on learning outcomes and student success.",
    type: "likert",
    required: true,
    helpText: "Consider whether you measure and evaluate the effectiveness of AI in education."
  },

  // === TECHNOLOGY INFRASTRUCTURE (6 questions) ===
  {
    id: "AIR_12",
    section: "Technology Infrastructure",
    prompt: "Our IT infrastructure can support the computational requirements of AI applications.",
    type: "likert",
    required: true,
    helpText: "Evaluate processing power, storage, and network capacity for AI workloads.",
    enableContext: true,
    contextPrompt: "Describe your current computing infrastructure and any cloud resources."
  },
  {
    id: "AIR_13",
    section: "Technology Infrastructure",
    prompt: "We have secure, accessible data systems that can support AI analytics and machine learning.",
    type: "likert",
    required: true,
    helpText: "Consider data quality, accessibility, and security for AI applications."
  },
  {
    id: "AIR_14",
    section: "Technology Infrastructure",
    prompt: "Our cybersecurity measures are adequate for protecting AI systems and data.",
    type: "likert",
    required: true,
    helpText: "Assess security protocols specifically for AI applications and sensitive data."
  },
  {
    id: "AIR_15",
    section: "Technology Infrastructure",
    prompt: "We have established data governance practices that support AI development and deployment.",
    type: "likert",
    required: true,
    helpText: "Evaluate data management, quality control, and governance processes."
  },
  {
    id: "AIR_16",
    section: "Technology Infrastructure",
    prompt: "Our technology team has the skills and resources to implement and maintain AI systems.",
    type: "likert",
    required: true,
    helpText: "Consider technical expertise, staffing, and ongoing support capabilities.",
    enableContext: true
  },
  {
    id: "AIR_17",
    section: "Technology Infrastructure",
    prompt: "We have reliable backup and disaster recovery systems for AI-critical applications.",
    type: "likert",
    required: true,
    helpText: "Assess business continuity planning for AI-dependent processes."
  },

  // === ORGANIZATIONAL CULTURE & CHANGE MANAGEMENT (5 questions) ===
  {
    id: "AIR_18",
    section: "Organizational Culture & Change Management",
    prompt: "Our institution's culture is open to innovation and technological change.",
    type: "likert",
    required: true,
    helpText: "Evaluate organizational readiness for adopting new technologies and processes.",
    enableContext: true,
    contextPrompt: "Describe your institution's approach to innovation and change management."
  },
  {
    id: "AIR_19",
    section: "Organizational Culture & Change Management",
    prompt: "Staff and faculty are generally receptive to AI tools that can improve their work efficiency.",
    type: "likert",
    required: true,
    helpText: "Consider attitudes toward automation and AI-assisted processes."
  },
  {
    id: "AIR_20",
    section: "Organizational Culture & Change Management",
    prompt: "We have effective change management processes for implementing new AI initiatives.",
    type: "likert",
    required: true,
    helpText: "Assess your ability to plan, communicate, and execute technology implementations."
  },
  {
    id: "AIR_21",
    section: "Organizational Culture & Change Management",
    prompt: "Leadership actively champions AI adoption and provides visible support for initiatives.",
    type: "likert",
    required: true,
    helpText: "Evaluate leadership engagement and communication about AI priorities."
  },
  {
    id: "AIR_22",
    section: "Organizational Culture & Change Management",
    prompt: "We have processes for addressing concerns and resistance to AI implementation.",
    type: "likert",
    required: true,
    helpText: "Consider how you handle skepticism, fear, or resistance to AI adoption."
  },

  // === COMPLIANCE & RISK MANAGEMENT (3 questions) ===
  {
    id: "AIR_23",
    section: "Compliance & Risk Management",
    prompt: "We understand and comply with relevant regulations (FERPA, ADA, etc.) as they apply to AI use.",
    type: "likert",
    required: true,
    helpText: "Assess regulatory compliance for AI applications in education.",
    enableContext: true,
    contextPrompt: "Describe your approach to regulatory compliance for AI systems."
  },
  {
    id: "AIR_24",
    section: "Compliance & Risk Management",
    prompt: "We have conducted risk assessments for AI implementation across different operational areas.",
    type: "likert",
    required: true,
    helpText: "Consider whether you've evaluated potential risks and mitigation strategies."
  },
  {
    id: "AIR_25",
    section: "Compliance & Risk Management",
    prompt: "Our procurement and vendor management processes address AI-specific requirements and risks.",
    type: "likert",
    required: true,
    helpText: "Evaluate your approach to selecting and managing AI vendors and services."
  },

  // === FACULTY AI INTEGRATION (20 questions) ===
  {
    id: "AIR_26",
    section: "Faculty AI Integration",
    prompt: "Faculty in our institution are actively using AI tools to enhance their teaching effectiveness.",
    type: "likert",
    required: true,
    helpText: "Assess current faculty adoption of AI tools for course design, content creation, and student engagement."
  },
  {
    id: "AIR_27",
    section: "Faculty AI Integration",
    prompt: "Describe your institution's current approach to supporting faculty adoption of AI technologies.",
    type: "text",
    required: true,
    helpText: "Provide details about training programs, resources, and support systems for faculty AI integration."
  },
  {
    id: "AIR_28",
    section: "Faculty AI Integration",
    prompt: "Upload your faculty AI training materials or guidelines (if available).",
    type: "upload",
    required: false,
    helpText: "Share any existing faculty development resources related to AI adoption."
  },
  {
    id: "AIR_29",
    section: "Faculty AI Integration",
    prompt: "Our faculty have clear guidelines on appropriate AI use in research and scholarship.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether faculty understand how to use AI ethically in their research activities."
  },
  {
    id: "AIR_30",
    section: "Faculty AI Integration",
    prompt: "What are the biggest barriers preventing faculty from adopting AI tools at your institution?",
    type: "text",
    required: true,
    helpText: "Identify key challenges such as training, time, technical support, or institutional resistance."
  },
  {
    id: "AIR_31",
    section: "Faculty AI Integration",
    prompt: "Faculty receive adequate technical support for implementing AI tools in their work.",
    type: "likert",
    required: true,
    helpText: "Assess the availability and quality of IT support for faculty AI initiatives."
  },
  {
    id: "AIR_32",
    section: "Faculty AI Integration",
    prompt: "Our institution provides incentives or recognition for innovative AI use in teaching and research.",
    type: "likert",
    required: false,
    helpText: "Consider awards, grants, release time, or other recognition for AI innovation."
  },
  {
    id: "AIR_33",
    section: "Faculty AI Integration",
    prompt: "Describe a successful example of AI integration in teaching or research at your institution.",
    type: "text",
    required: false,
    helpText: "Share specific examples of faculty successfully using AI to enhance their work."
  },
  {
    id: "AIR_34",
    section: "Faculty AI Integration",
    prompt: "Faculty are comfortable using AI for automated grading and assessment tasks.",
    type: "likert",
    required: true,
    helpText: "Evaluate faculty readiness to use AI for efficiency in grading and feedback."
  },
  {
    id: "AIR_35",
    section: "Faculty AI Integration",
    prompt: "Our faculty development programs include AI literacy as a core component.",
    type: "likert",
    required: true,
    helpText: "Assess whether AI skills are integrated into ongoing faculty professional development."
  },
  {
    id: "AIR_36",
    section: "Faculty AI Integration",
    prompt: "What percentage of faculty in your institution have used AI tools in the past year?",
    type: "numeric",
    required: true,
    helpText: "Estimate the percentage of faculty who have experimented with or regularly use AI tools."
  },
  {
    id: "AIR_37",
    section: "Faculty AI Integration",
    prompt: "Faculty collaborate effectively with IT staff on AI implementation projects.",
    type: "likert",
    required: true,
    helpText: "Evaluate the working relationship between faculty and technical staff for AI initiatives."
  },
  {
    id: "AIR_38",
    section: "Faculty AI Integration",
    prompt: "Upload examples of AI-enhanced course materials or research outputs (if available).",
    type: "upload",
    required: false,
    helpText: "Share examples of how faculty are currently using AI in their academic work."
  },
  {
    id: "AIR_39",
    section: "Faculty AI Integration",
    prompt: "Our institution has clear processes for faculty to request AI tools and resources.",
    type: "likert",
    required: true,
    helpText: "Assess whether faculty have accessible pathways to obtain AI resources they need."
  },
  {
    id: "AIR_40",
    section: "Faculty AI Integration",
    prompt: "Describe your institution's vision for faculty AI integration over the next 3-5 years.",
    type: "text",
    required: true,
    helpText: "Articulate long-term goals and expectations for faculty AI adoption and integration."
  },
  {
    id: "AIR_41",
    section: "Faculty AI Integration",
    prompt: "Faculty understand the intellectual property implications of using AI in their work.",
    type: "likert",
    required: true,
    helpText: "Evaluate faculty awareness of IP issues related to AI-generated content and research."
  },
  {
    id: "AIR_42",
    section: "Faculty AI Integration",
    prompt: "What specific AI tools or platforms does your institution provide or recommend to faculty?",
    type: "text",
    required: false,
    helpText: "List specific AI tools, software, or platforms available to faculty."
  },
  {
    id: "AIR_43",
    section: "Faculty AI Integration",
    prompt: "Our faculty have opportunities to share AI best practices with colleagues.",
    type: "likert",
    required: true,
    helpText: "Assess whether there are forums, meetings, or platforms for faculty AI knowledge sharing."
  },
  {
    id: "AIR_44",
    section: "Faculty AI Integration",
    prompt: "Faculty are prepared to teach students about responsible AI use in their disciplines.",
    type: "likert",
    required: true,
    helpText: "Evaluate faculty readiness to guide students in ethical and effective AI use."
  },
  {
    id: "AIR_45",
    section: "Faculty AI Integration",
    prompt: "Upload your institutional AI policy for faculty (if available).",
    type: "upload",
    required: false,
    helpText: "Share your current faculty AI use policy or guidelines document."
  },

  // === STUDENT AI POLICY & ACADEMIC INTEGRITY (18 questions) ===
  {
    id: "AIR_46",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Our institution has clear, comprehensive policies governing student use of AI tools.",
    type: "likert",
    required: true,
    helpText: "Evaluate the clarity and comprehensiveness of your student AI use policies."
  },
  {
    id: "AIR_47",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Upload your current student AI use policy or academic integrity guidelines.",
    type: "upload",
    required: false,  // made optional to allow submission without upload
    helpText: "Share your institution's official policy documents regarding student AI use."
  },
  {
    id: "AIR_48",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Describe how your institution communicates AI policies to students.",
    type: "text",
    required: true,
    helpText: "Explain your approach to ensuring students understand AI use expectations and guidelines."
  },
  {
    id: "AIR_49",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Students receive clear guidance on when AI use is permitted versus prohibited in coursework.",
    type: "likert",
    required: true,
    helpText: "Assess whether students understand context-specific AI use expectations."
  },
  {
    id: "AIR_50",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Our institution has effective methods for detecting inappropriate AI use in student work.",
    type: "likert",
    required: true,
    helpText: "Evaluate your capability to identify when students use AI inappropriately."
  },
  {
    id: "AIR_51",
    section: "Student AI Policy & Academic Integrity",
    prompt: "What tools or methods does your institution use to detect AI-generated content in student submissions?",
    type: "text",
    required: true,
    helpText: "Describe specific detection tools, software, or manual review processes you employ."
  },
  {
    id: "AIR_52",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Students understand the consequences of violating AI use policies.",
    type: "likert",
    required: true,
    helpText: "Assess student awareness of penalties for inappropriate AI use."
  },
  {
    id: "AIR_53",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Our faculty are trained to identify and address AI policy violations.",
    type: "likert",
    required: true,
    helpText: "Evaluate faculty preparedness to recognize and handle AI policy infractions."
  },
  {
    id: "AIR_54",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Describe a recent situation where your institution had to address student AI policy violations.",
    type: "text",
    required: false,
    helpText: "Share how your institution has handled actual AI policy violations (anonymized)."
  },
  {
    id: "AIR_55",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Our AI policies are regularly reviewed and updated to address new technologies and use cases.",
    type: "likert",
    required: true,
    helpText: "Assess whether your policies evolve with changing AI landscape."
  },
  {
    id: "AIR_56",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Students receive education about responsible AI use and digital citizenship.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether students learn about ethical AI use beyond just policy compliance."
  },
  {
    id: "AIR_57",
    section: "Student AI Policy & Academic Integrity",
    prompt: "What percentage of courses at your institution have specific AI use guidelines in their syllabi?",
    type: "numeric",
    required: true,
    helpText: "Estimate the proportion of courses that include AI-specific guidance for students."
  },
  {
    id: "AIR_58",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Our institution differentiates between AI as a learning tool versus AI as a shortcut to bypass learning.",
    type: "likert",
    required: true,
    helpText: "Assess whether policies distinguish between beneficial and detrimental AI use."
  },
  {
    id: "AIR_59",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Upload examples of course-specific AI guidelines from syllabi (if available).",
    type: "upload",
    required: false,
    helpText: "Share examples of how individual courses address AI use in their specific context."
  },
  {
    id: "AIR_60",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Describe your institution's approach to balancing AI innovation with academic integrity.",
    type: "text",
    required: true,
    helpText: "Explain how you encourage beneficial AI use while maintaining academic standards."
  },
  {
    id: "AIR_61",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Students are taught to critically evaluate AI-generated information and content.",
    type: "likert",
    required: true,
    helpText: "Assess whether students develop skills to assess AI output quality and accuracy."
  },
  {
    id: "AIR_62",
    section: "Student AI Policy & Academic Integrity",
    prompt: "Our institution has clear appeals processes for AI policy violation allegations.",
    type: "likert",
    required: true,
    helpText: "Evaluate fairness and transparency in handling AI policy disputes."
  },
  {
    id: "AIR_63",
    section: "Student AI Policy & Academic Integrity",
    prompt: "What challenges has your institution faced in developing and implementing student AI policies?",
    type: "text",
    required: true,
    helpText: "Describe key obstacles in creating effective student AI governance."
  },

  // === TECHNOLOGY INFRASTRUCTURE (15 questions) ===
  {
    id: "AIR_64",
    section: "Technology Infrastructure",
    prompt: "Our IT infrastructure can support the computational demands of AI applications.",
    type: "likert",
    required: true,
    helpText: "Evaluate your network, storage, and processing capacity for AI workloads."
  },
  {
    id: "AIR_65",
    section: "Technology Infrastructure",
    prompt: "Upload your current IT infrastructure assessment or technology plan.",
    type: "upload",
    required: false,
    helpText: "Share documentation of your current technology capabilities and future plans."
  },
  {
    id: "AIR_66",
    section: "Technology Infrastructure",
    prompt: "Describe your institution's current cloud computing strategy and AI-related services.",
    type: "text",
    required: true,
    helpText: "Detail your use of cloud platforms, AI services, and hybrid infrastructure approaches."
  },
  {
    id: "AIR_67",
    section: "Technology Infrastructure",
    prompt: "Our institution has adequate cybersecurity measures for AI systems and data.",
    type: "likert",
    required: true,
    helpText: "Assess security protections for AI applications and the data they process."
  },
  {
    id: "AIR_68",
    section: "Technology Infrastructure",
    prompt: "We have established data governance protocols specifically for AI applications.",
    type: "likert",
    required: true,
    helpText: "Evaluate policies for data quality, access, and management in AI contexts."
  },
  {
    id: "AIR_69",
    section: "Technology Infrastructure",
    prompt: "What specific AI platforms or services does your institution currently use or plan to implement?",
    type: "text",
    required: true,
    helpText: "List specific AI tools, platforms, or services in use or under consideration."
  },
  {
    id: "AIR_70",
    section: "Technology Infrastructure",
    prompt: "Our IT staff have the technical expertise needed to support AI implementations.",
    type: "likert",
    required: true,
    helpText: "Assess whether IT personnel have necessary AI-related technical skills."
  },
  {
    id: "AIR_71",
    section: "Technology Infrastructure",
    prompt: "We have established backup and disaster recovery protocols for AI systems.",
    type: "likert",
    required: true,
    helpText: "Evaluate business continuity planning for AI-dependent operations."
  },
  {
    id: "AIR_72",
    section: "Technology Infrastructure",
    prompt: "Describe your institution's approach to AI system integration with existing enterprise systems.",
    type: "text",
    required: true,
    helpText: "Explain how AI tools connect with SIS, LMS, HR, and other core systems."
  },
  {
    id: "AIR_73",
    section: "Technology Infrastructure",
    prompt: "Our institution has allocated sufficient budget for AI infrastructure investments.",
    type: "likert",
    required: true,
    helpText: "Assess whether funding is available for necessary AI technology upgrades."
  },
  {
    id: "AIR_74",
    section: "Technology Infrastructure",
    prompt: "We monitor AI system performance and have established service level agreements.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether AI systems have performance monitoring and uptime requirements."
  },
  {
    id: "AIR_75",
    section: "Technology Infrastructure",
    prompt: "What are your institution's biggest technology barriers to AI implementation?",
    type: "text",
    required: true,
    helpText: "Identify key technical obstacles such as legacy systems, bandwidth, or security concerns."
  },
  {
    id: "AIR_76",
    section: "Technology Infrastructure",
    prompt: "Our institution complies with data privacy regulations (FERPA, GDPR, etc.) in AI implementations.",
    type: "likert",
    required: true,
    helpText: "Assess compliance with relevant data protection and privacy requirements."
  },
  {
    id: "AIR_77",
    section: "Technology Infrastructure",
    prompt: "We have established vendor management processes specifically for AI service providers.",
    type: "likert",
    required: true,
    helpText: "Evaluate procurement and oversight processes for AI vendors and contractors."
  },
  {
    id: "AIR_78",
    section: "Technology Infrastructure",
    prompt: "Upload your data privacy and security policies related to AI systems (if available).",
    type: "upload",
    required: false,
    helpText: "Share policies governing data protection in AI applications."
  },

  // === ORGANIZATIONAL CULTURE & CHANGE MANAGEMENT (12 questions) ===
  {
    id: "AIR_79",
    section: "Organizational Culture & Change Management",
    prompt: "Our institutional culture is open to AI innovation and experimentation.",
    type: "likert",
    required: true,
    helpText: "Assess whether your organization encourages AI exploration and accepts calculated risks."
  },
  {
    id: "AIR_80",
    section: "Organizational Culture & Change Management",
    prompt: "Describe the general attitude toward AI adoption among different stakeholder groups at your institution.",
    type: "text",
    required: true,
    helpText: "Compare attitudes among faculty, staff, administration, and students toward AI integration."
  },
  {
    id: "AIR_81",
    section: "Organizational Culture & Change Management",
    prompt: "Our institution has dedicated change management resources for AI transformation initiatives.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether you have personnel and processes to manage AI-related organizational change."
  },
  {
    id: "AIR_82",
    section: "Organizational Culture & Change Management",
    prompt: "Leadership actively champions AI adoption and models innovative behavior.",
    type: "likert",
    required: true,
    helpText: "Assess whether institutional leaders visibly support and participate in AI initiatives."
  },
  {
    id: "AIR_83",
    section: "Organizational Culture & Change Management",
    prompt: "What strategies has your institution used to address resistance to AI adoption?",
    type: "text",
    required: true,
    helpText: "Describe approaches to overcoming skepticism, fear, or opposition to AI integration."
  },
  {
    id: "AIR_84",
    section: "Organizational Culture & Change Management",
    prompt: "Our institution celebrates and shares success stories related to AI implementation.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether AI successes are recognized and communicated widely."
  },
  {
    id: "AIR_85",
    section: "Organizational Culture & Change Management",
    prompt: "Staff and faculty receive adequate communication about AI initiatives and their impact.",
    type: "likert",
    required: true,
    helpText: "Assess transparency and effectiveness of AI-related internal communications."
  },
  {
    id: "AIR_86",
    section: "Organizational Culture & Change Management",
    prompt: "Upload your change management plan or communication strategy for AI adoption (if available).",
    type: "upload",
    required: false,
    helpText: "Share documentation of your planned approach to managing AI transformation."
  },
  {
    id: "AIR_87",
    section: "Organizational Culture & Change Management",
    prompt: "Our institution provides adequate training and support during AI transitions.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether people receive help adapting to new AI-enhanced processes."
  },
  {
    id: "AIR_88",
    section: "Organizational Culture & Change Management",
    prompt: "We have mechanisms to gather feedback and adjust AI implementations based on user experience.",
    type: "likert",
    required: true,
    helpText: "Assess whether AI projects incorporate user feedback and iterate based on results."
  },
  {
    id: "AIR_89",
    section: "Organizational Culture & Change Management",
    prompt: "Describe the biggest cultural challenges your institution faces in AI adoption.",
    type: "text",
    required: true,
    helpText: "Identify key cultural barriers such as risk aversion, lack of digital literacy, or resistance to change."
  },
  {
    id: "AIR_90",
    section: "Organizational Culture & Change Management",
    prompt: "Our institution has established communities of practice or working groups focused on AI.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether there are formal or informal groups driving AI knowledge sharing and adoption."
  },

  // === IMPLEMENTATION PLANNING & STRATEGY (15 questions for comprehensive tier) ===
  {
    id: "AIR_91",
    section: "Implementation Planning & Strategy",
    prompt: "Our institution has a detailed, phased plan for AI implementation across departments.",
    type: "likert",
    required: true,
    helpText: "Assess whether there's a structured approach to rolling out AI initiatives systematically."
  },
  {
    id: "AIR_92",
    section: "Implementation Planning & Strategy",
    prompt: "Upload your AI implementation roadmap or strategic plan (if available).",
    type: "upload",
    required: false,
    helpText: "Share your documented approach to AI adoption and implementation timeline."
  },
  {
    id: "AIR_93",
    section: "Implementation Planning & Strategy",
    prompt: "Describe your institution's approach to prioritizing AI initiatives and allocating resources.",
    type: "text",
    required: true,
    helpText: "Explain how you decide which AI projects to pursue first and how you fund them."
  },
  {
    id: "AIR_94",
    section: "Implementation Planning & Strategy",
    prompt: "We have established success metrics and evaluation criteria for AI initiatives.",
    type: "likert",
    required: true,
    helpText: "Assess whether there are clear ways to measure AI project effectiveness and ROI."
  },
  {
    id: "AIR_95",
    section: "Implementation Planning & Strategy",
    prompt: "Our institution conducts pilot programs before full-scale AI implementations.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether you test AI solutions on a small scale before institution-wide deployment."
  },
  {
    id: "AIR_96",
    section: "Implementation Planning & Strategy",
    prompt: "What are your institution's top 3 AI implementation priorities for the next 2 years?",
    type: "text",
    required: true,
    helpText: "Identify the most important AI initiatives your institution plans to pursue."
  },
  {
    id: "AIR_97",
    section: "Implementation Planning & Strategy",
    prompt: "We have identified potential AI use cases across all major institutional functions.",
    type: "likert",
    required: true,
    helpText: "Assess whether you've systematically examined AI opportunities in academics, operations, and student services."
  },
  {
    id: "AIR_98",
    section: "Implementation Planning & Strategy",
    prompt: "Our AI implementation timeline is realistic and accounts for change management needs.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether implementation plans allow adequate time for training and adaptation."
  },
  {
    id: "AIR_99",
    section: "Implementation Planning & Strategy",
    prompt: "Describe how your institution plans to measure the success and impact of AI initiatives.",
    type: "text",
    required: true,
    helpText: "Explain specific metrics, assessment methods, and evaluation frameworks you'll use."
  },
  {
    id: "AIR_100",
    section: "Implementation Planning & Strategy",
    prompt: "We have contingency plans for AI initiatives that don't meet expectations.",
    type: "likert",
    required: true,
    helpText: "Assess whether there are plans to pivot, scale back, or discontinue unsuccessful AI projects."
  },
  {
    id: "AIR_101",
    section: "Implementation Planning & Strategy",
    prompt: "Our institution considers equity and accessibility in all AI implementation planning.",
    type: "likert",
    required: true,
    helpText: "Evaluate whether AI initiatives are designed to be inclusive and reduce rather than increase disparities."
  },
  {
    id: "AIR_102",
    section: "Implementation Planning & Strategy",
    prompt: "Upload any AI project proposals or business cases your institution has developed.",
    type: "upload",
    required: false,
    helpText: "Share examples of how your institution justifies and plans AI investments."
  },
  {
    id: "AIR_103",
    section: "Implementation Planning & Strategy",
    prompt: "What external partnerships or collaborations does your institution have for AI development?",
    type: "text",
    required: false,
    helpText: "Describe relationships with vendors, other institutions, or organizations supporting AI initiatives."
  },
  {
    id: "AIR_104",
    section: "Implementation Planning & Strategy",
    prompt: "Our institution regularly benchmarks AI capabilities against peer institutions.",
    type: "likert",
    required: true,
    helpText: "Assess whether you compare your AI maturity and progress with similar organizations."
  },
  {
    id: "AIR_105",
    section: "Implementation Planning & Strategy",
    prompt: "Describe your vision for how AI will transform your institution over the next 5-10 years.",
    type: "text",
    required: true,
    helpText: "Articulate the long-term transformation you expect AI to enable at your institution."
  }
];

// Domain and tier configuration
export interface Domain {
  name: string;
  description: string;
  questions: string[];
  weight: number;
}

export interface Tier {
  name: string;
  description: string;
  questionCount: number;
  price: number;
}

export const AI_DOMAINS: Record<string, Domain> = {
  ai_strategy: {
    name: "AI Strategy & Governance",
    description: "Institutional planning, leadership, and governance for AI initiatives",
    questions: ["AIR_01", "AIR_02", "AIR_03", "AIR_04", "AIR_05", "AIR_06", "AIR_07", "AIR_08"],
    weight: 0.20
  },
  pedagogical_integration: {
    name: "Pedagogical Integration",
    description: "AI adoption in teaching, learning, and curriculum",
    questions: ["AIR_09", "AIR_10", "AIR_11", "AIR_12", "AIR_13", "AIR_14", "AIR_15"],
    weight: 0.20
  },
  technology_infrastructure: {
    name: "Technology Infrastructure",
    description: "Technical capacity and systems to support AI implementation",
    questions: ["AIR_16", "AIR_17", "AIR_18", "AIR_19", "AIR_20", "AIR_21", "AIR_22"],
    weight: 0.15
  },
  organizational_culture: {
    name: "Organizational Culture & Change Management",
    description: "Institutional culture, change management, and stakeholder readiness",
    questions: ["AIR_23", "AIR_24", "AIR_25", "AIR_26", "AIR_27", "AIR_28"],
    weight: 0.15
  },
  compliance_risk: {
    name: "Compliance & Risk Management",
    description: "Regulatory compliance, risk assessment, and governance",
    questions: ["AIR_29", "AIR_30", "AIR_31", "AIR_32", "AIR_33"],
    weight: 0.10
  },
  academic_integrity: {
    name: "Academic Integrity",
    description: "Student guidelines, academic integrity frameworks, and learning outcome preservation",
    questions: ["AIR_34", "AIR_35", "AIR_36", "AIR_37", "AIR_38"],
    weight: 0.08
  },
  benchmarking_standards: {
    name: "Benchmarking & Standards",
    description: "Peer institution comparison and accreditation alignment",
    questions: ["AIR_39", "AIR_40", "AIR_41", "AIR_42"],
    weight: 0.08
  },
  mission_alignment: {
    name: "Mission Alignment",
    description: "Ensuring AI initiatives support institutional mission and student success outcomes",
    questions: ["AIR_43", "AIR_44", "AIR_45"],
    weight: 0.04
  }
};

export const AI_TIERS: Record<string, Tier> = {
  "higher-ed-ai-pulse-check": {
    name: "Higher Ed AI Pulse Check",
    description: "Quick AI readiness snapshot with AI-generated insights report (8-10 pages)",
    questionCount: 50,
    price: 2000
  },
  "ai-readiness-comprehensive": {
    name: "AI Readiness Comprehensive",
    description: "Comprehensive assessment & strategy with 25-page detailed report",
    questionCount: 105,
    price: 4995
  },
  "ai-transformation-blueprint": {
    name: "AI Transformation Blueprint",
    description: "Complete AI transformation roadmap with 40-page board-ready Blueprint",
    questionCount: 150,
    price: 0 // Contact for quote
  },
  "ai-enterprise-partnership": {
    name: "AI Enterprise Partnership",
    description: "Comprehensive AI transformation partnership with ongoing support",
    questionCount: 200,
    price: 0 // Contact for quote
  }
};

export const SCORING_CONFIG = {
  domains: AI_DOMAINS,
  interpretation: {
    '81-100': {
      title: 'AI-Ready Leader',
      description: 'Your institution demonstrates exceptional AI readiness with strong governance, infrastructure, and strategic planning.',
      recommendations: [
        'Continue advancing AI initiatives with confidence',
        'Share best practices with peer institutions',
        'Explore cutting-edge AI applications'
      ]
    },
    '61-80': {
      title: 'AI-Ready Adopter',
      description: 'Your institution shows strong AI readiness with good foundations in most areas.',
      recommendations: [
        'Focus on remaining gaps in strategy or infrastructure',
        'Expand AI training programs',
        'Develop pilot AI projects'
      ]
    },
    '41-60': {
      title: 'AI-Developing',
      description: 'Your institution has moderate AI readiness with clear opportunities for improvement.',
      recommendations: [
        'Develop comprehensive AI strategy',
        'Invest in infrastructure upgrades',
        'Build staff AI literacy'
      ]
    },
    '21-40': {
      title: 'AI-Emerging',
      description: 'Your institution is in early stages of AI readiness development.',
      recommendations: [
        'Establish AI governance framework',
        'Conduct technology infrastructure assessment',
        'Begin staff training programs'
      ]
    },
    '0-20': {
      title: 'AI-Beginning',
      description: 'Your institution is at the beginning of its AI readiness journey.',
      recommendations: [
        'Create AI steering committee',
        'Develop basic AI literacy',
        'Assess current technology capabilities'
      ]
    }
  }
};

// Utility functions
export function getQuestionsForTier(tier: string): Question[] {
  const tierConfig = AI_TIERS[tier];
  if (!tierConfig) {
    return AI_READINESS_QUESTIONS.slice(0, 25); // Default fallback
  }

  return AI_READINESS_QUESTIONS.slice(0, tierConfig.questionCount);
}

export function calculateDomainScores(responses: Record<string, number>): Record<string, { score: number; percentage: number }> {
  const domainScores: Record<string, { score: number; percentage: number }> = {};

  Object.entries(AI_DOMAINS).forEach(([domainKey, domain]) => {
    const domainResponses = domain.questions
      .map(qId => responses[qId])
      .filter(response => response !== undefined);

    if (domainResponses.length > 0) {
      const totalScore = domainResponses.reduce((sum, score) => sum + score, 0);
      const maxPossibleScore = domainResponses.length * 4; // Assuming 0-4 Likert scale
      const percentage = (totalScore / maxPossibleScore) * 100;

      domainScores[domainKey] = {
        score: totalScore,
        percentage: Math.round(percentage)
      };
    }
  });

  return domainScores;
}

export function calculateOverallScore(domainScores: Record<string, { score: number; percentage: number }>): number {
  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(AI_DOMAINS).forEach(([domainKey, domain]) => {
    const domainScore = domainScores[domainKey];
    if (domainScore) {
      weightedScore += domainScore.percentage * domain.weight;
      totalWeight += domain.weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}
