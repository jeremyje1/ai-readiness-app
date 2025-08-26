/**
 * Streamlined AI Readiness Questions - Core Focus Areas
 * Reduced question count with open-ended context capture
 */

export const STREAMLINED_AI_QUESTIONS = [
    // Leadership & Strategy (3 questions)
    {
        id: 'leadership-1',
        section: 'Leadership & Strategy',
        prompt: 'How would you describe your organization\'s current AI strategy and leadership commitment?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'No formal strategy',
                2: 'Early exploration',
                3: 'Basic framework',
                4: 'Comprehensive strategy',
                5: 'Fully integrated approach'
            }
        },
        contextPrompt: 'Please describe your current AI leadership structure, strategy documents, or initiatives:',
        helpText: 'Consider formal AI policies, executive sponsorship, and strategic planning'
    },
    {
        id: 'leadership-2',
        section: 'Leadership & Strategy',
        prompt: 'How ready is your leadership team to champion AI adoption across the organization?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'Not ready/resistant',
                2: 'Cautiously interested',
                3: 'Moderately supportive',
                4: 'Actively supportive',
                5: 'Champions of change'
            }
        },
        contextPrompt: 'What specific leadership challenges or opportunities do you see regarding AI adoption?',
        helpText: 'Think about executive buy-in, change management, and organizational culture'
    },

    // Infrastructure & Technology (2 questions)
    {
        id: 'infrastructure-1',
        section: 'Infrastructure & Technology',
        prompt: 'How would you rate your current technology infrastructure\'s readiness for AI implementation?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'Significant upgrades needed',
                2: 'Some improvements required',
                3: 'Adequate foundation',
                4: 'Good infrastructure',
                5: 'Excellent, AI-ready'
            }
        },
        contextPrompt: 'Describe your current technology stack, cloud capabilities, and any infrastructure limitations:',
        helpText: 'Consider network capacity, cloud services, data storage, and security systems'
    },
    {
        id: 'infrastructure-2',
        section: 'Infrastructure & Technology',
        prompt: 'How mature is your data management and governance framework?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'No formal framework',
                2: 'Basic data practices',
                3: 'Developing governance',
                4: 'Strong framework',
                5: 'Advanced data maturity'
            }
        },
        contextPrompt: 'Tell us about your data sources, quality processes, and governance policies:',
        helpText: 'Think about data quality, accessibility, privacy protections, and compliance'
    },

    // Human Resources & Skills (2 questions)
    {
        id: 'skills-1',
        section: 'Human Resources & Skills',
        prompt: 'What is the current AI literacy and skill level across your organization?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'Very low/no experience',
                2: 'Limited awareness',
                3: 'Basic understanding',
                4: 'Good skill base',
                5: 'Advanced expertise'
            }
        },
        contextPrompt: 'Describe current staff AI knowledge, training programs, or skill gaps you\'ve identified:',
        helpText: 'Consider both technical and non-technical staff capabilities'
    },
    {
        id: 'skills-2',
        section: 'Human Resources & Skills',
        prompt: 'How prepared is your organization to provide AI training and professional development?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'No training plans',
                2: 'Considering options',
                3: 'Basic training planned',
                4: 'Comprehensive program',
                5: 'Ongoing development culture'
            }
        },
        contextPrompt: 'What training initiatives, budget, or development plans do you have for AI skills?',
        helpText: 'Think about training budget, time allocation, and ongoing support'
    },

    // Ethics & Policy (2 questions)
    {
        id: 'ethics-1',
        section: 'Ethics & Policy',
        prompt: 'How developed are your AI ethics guidelines and responsible use policies?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'No policies exist',
                2: 'Under development',
                3: 'Basic guidelines',
                4: 'Comprehensive policies',
                5: 'Advanced framework'
            }
        },
        contextPrompt: 'Describe any AI policies, ethical guidelines, or governance structures you have in place:',
        helpText: 'Consider student/staff privacy, bias prevention, and transparent AI use'
    },
    {
        id: 'ethics-2',
        section: 'Ethics & Policy',
        prompt: 'How well does your organization address AI transparency and stakeholder communication?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'No communication plan',
                2: 'Limited transparency',
                3: 'Basic communication',
                4: 'Good stakeholder engagement',
                5: 'Excellent transparency'
            }
        },
        contextPrompt: 'How do you plan to communicate AI use to students, parents, faculty, or other stakeholders?',
        helpText: 'Think about transparency, consent processes, and stakeholder involvement'
    },

    // Implementation & Support (2 questions)
    {
        id: 'implementation-1',
        section: 'Implementation & Support',
        prompt: 'How ready is your organization to pilot and implement AI solutions?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'Not ready to start',
                2: 'Planning phase',
                3: 'Ready for small pilots',
                4: 'Ready for broader implementation',
                5: 'Actively implementing'
            }
        },
        contextPrompt: 'Describe any current AI pilots, planned implementations, or specific use cases you\'re considering:',
        helpText: 'Consider your implementation timeline, pilot projects, and success metrics'
    },
    {
        id: 'implementation-2',
        section: 'Implementation & Support',
        prompt: 'How adequate are your resources (budget, time, personnel) for AI initiatives?',
        type: 'scale_with_context',
        required: true,
        scale: {
            min: 1,
            max: 5,
            labels: {
                1: 'Insufficient resources',
                2: 'Limited resources',
                3: 'Adequate resources',
                4: 'Good resource allocation',
                5: 'Ample resources'
            }
        },
        contextPrompt: 'Tell us about your AI budget, dedicated staff time, and resource allocation plans:',
        helpText: 'Think about budget constraints, staff capacity, and timeline pressures'
    },

    // Open-ended Strategic Questions (2 questions)
    {
        id: 'strategic-1',
        section: 'Strategic Vision',
        prompt: 'What are your top 3 priority use cases for AI in your organization?',
        type: 'open_ended',
        required: true,
        contextPrompt: 'Please describe the specific AI applications or use cases that would have the most impact:',
        helpText: 'Think about areas like student support, administrative efficiency, personalized learning, etc.'
    },
    {
        id: 'strategic-2',
        section: 'Strategic Vision',
        prompt: 'What are the biggest barriers or concerns preventing faster AI adoption in your organization?',
        type: 'open_ended',
        required: true,
        contextPrompt: 'Describe the main challenges, concerns, or obstacles you face:',
        helpText: 'Consider technical, financial, cultural, regulatory, or other barriers'
    }
];

export const QUICK_MODE_QUESTIONS = STREAMLINED_AI_QUESTIONS.slice(0, 8); // First 8 questions
export const COMPREHENSIVE_MODE_QUESTIONS = STREAMLINED_AI_QUESTIONS; // All 12 questions

export const QUESTION_SECTIONS = [
    'Leadership & Strategy',
    'Infrastructure & Technology',
    'Human Resources & Skills',
    'Ethics & Policy',
    'Implementation & Support',
    'Strategic Vision'
];
