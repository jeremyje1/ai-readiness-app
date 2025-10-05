-- Seed Compliance Frameworks and Controls
-- Based on user specifications for K-12 and Higher Education

-- ============================================================================
-- HIGHER EDUCATION FRAMEWORKS
-- ============================================================================

-- Insert Higher Ed frameworks
INSERT INTO public.compliance_frameworks (id, name, audience, description, regulatory_body, review_cycle_months) VALUES
('00000000-0000-0000-0000-000000000001', 'FERPA', 'both', 'Family Educational Rights and Privacy Act - Student privacy and educational records', 'U.S. Department of Education', 12),
('00000000-0000-0000-0000-000000000002', 'GLBA Safeguards', 'highered', 'Gramm-Leach-Bliley Act Safeguards Rule - Financial data protection', 'Federal Trade Commission', 12),
('00000000-0000-0000-0000-000000000003', 'Title IX', 'both', 'Title IX of the Education Amendments - Sex discrimination in education', 'U.S. Department of Education', 12),
('00000000-0000-0000-0000-000000000004', 'HIPAA', 'highered', 'Health Insurance Portability and Accountability Act - Health information privacy', 'U.S. Department of Health and Human Services', 12),
('00000000-0000-0000-0000-000000000005', 'HEOA', 'highered', 'Higher Education Opportunity Act - Student aid and campus safety', 'U.S. Department of Education', 12),
('00000000-0000-0000-0000-000000000006', 'NIST 800-171', 'highered', 'NIST Special Publication 800-171 - Controlled Unclassified Information protection', 'National Institute of Standards and Technology', 12),
('00000000-0000-0000-0000-000000000007', 'NIST 800-53', 'highered', 'NIST Special Publication 800-53 - Security and Privacy Controls baseline', 'National Institute of Standards and Technology', 12),
('00000000-0000-0000-0000-000000000008', 'State Privacy Laws', 'both', 'State-specific privacy regulations (CPRA/CCPA/VCDPA)', 'State Governments', 12),
('00000000-0000-0000-0000-000000000009', 'Clery Act', 'highered', 'Jeanne Clery Disclosure of Campus Security Policy and Campus Crime Statistics Act', 'U.S. Department of Education', 12),
('00000000-0000-0000-0000-000000000010', 'PCI DSS', 'both', 'Payment Card Industry Data Security Standard', 'PCI Security Standards Council', 12),
('00000000-0000-0000-0000-000000000011', 'SACSCOC', 'highered', 'Southern Association of Colleges and Schools Commission on Colleges', 'SACSCOC', 60),
('00000000-0000-0000-0000-000000000012', 'Middle States', 'highered', 'Middle States Commission on Higher Education', 'MSCHE', 96),
('00000000-0000-0000-0000-000000000013', 'WASC', 'highered', 'Western Association of Schools and Colleges', 'WASC', 72),
('00000000-0000-0000-0000-000000000014', 'HLC', 'highered', 'Higher Learning Commission', 'HLC', 120);

-- ============================================================================
-- K-12 FRAMEWORKS  
-- ============================================================================

INSERT INTO public.compliance_frameworks (id, name, audience, description, regulatory_body, review_cycle_months) VALUES
('00000000-0000-0000-0000-000000000015', 'COPPA', 'k12', 'Children''s Online Privacy Protection Act - Under 13 privacy protection', 'Federal Trade Commission', 12),
('00000000-0000-0000-0000-000000000016', 'CIPA', 'k12', 'Children''s Internet Protection Act - Internet safety in schools', 'Federal Communications Commission', 12),
('00000000-0000-0000-0000-000000000017', 'IDEA', 'k12', 'Individuals with Disabilities Education Act - Special education compliance', 'U.S. Department of Education', 12),
('00000000-0000-0000-0000-000000000018', 'Section 508', 'k12', 'Section 508 of the Rehabilitation Act - Technology accessibility', 'U.S. Access Board', 12),
('00000000-0000-0000-0000-000000000019', 'NIST CSF', 'both', 'NIST Cybersecurity Framework - Security program scaffolding', 'National Institute of Standards and Technology', 12),
('00000000-0000-0000-0000-000000000020', 'PPRA', 'k12', 'Protection of Pupil Rights Amendment - Student survey protections', 'U.S. Department of Education', 12);

-- ============================================================================
-- HIGHER EDUCATION CONTROLS
-- ============================================================================

-- FERPA Controls (applicable to both)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000001', 'FERPA-01', 'Student Record Access Controls', 'Implement proper access controls for educational records in AI systems', 2.0, ARRAY['Student Privacy', 'Data Access', 'AI Processing']),
('00000000-0000-0000-0000-000000000001', 'FERPA-02', 'Directory Information Management', 'Manage directory information disclosure in AI-powered systems', 1.5, ARRAY['Information Disclosure', 'Privacy Controls']),
('00000000-0000-0000-0000-000000000001', 'FERPA-03', 'Consent Management for AI Processing', 'Obtain and manage proper consent for AI processing of educational records', 2.5, ARRAY['Consent Management', 'Legal Compliance']),
('00000000-0000-0000-0000-000000000001', 'FERPA-04', 'Third-Party AI Vendor Agreements', 'Establish proper agreements with AI vendors processing educational records', 3.0, ARRAY['Vendor Management', 'Legal Agreements']),
('00000000-0000-0000-0000-000000000001', 'FERPA-05', 'Audit Trail for AI Decisions', 'Maintain audit trails for AI-assisted decisions affecting students', 2.0, ARRAY['Audit Trails', 'Decision Transparency']);

-- GLBA Safeguards Controls (Higher Ed only)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000002', 'GLBA-01', 'Financial Data Encryption in AI', 'Encrypt financial data processed by AI systems', 2.0, ARRAY['Data Encryption', 'Financial Privacy']),
('00000000-0000-0000-0000-000000000002', 'GLBA-02', 'AI Vendor Risk Assessment', 'Assess risks of AI vendors processing financial information', 2.5, ARRAY['Vendor Risk', 'Financial Security']),
('00000000-0000-0000-0000-000000000002', 'GLBA-03', 'Incident Response for AI Systems', 'Implement incident response procedures for AI-related data breaches', 3.0, ARRAY['Incident Response', 'Breach Management']);

-- Title IX Controls (both audiences)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000003', 'TITLEIX-01', 'AI Bias Assessment - Gender', 'Assess AI systems for gender bias in educational services and decisions', 3.0, ARRAY['Bias Prevention', 'Gender Equity', 'Civil Rights']),
('00000000-0000-0000-0000-000000000003', 'TITLEIX-02', 'Reporting System AI Integration', 'Ensure AI systems support proper Title IX reporting and investigation processes', 2.5, ARRAY['Reporting Systems', 'Investigation Support']),
('00000000-0000-0000-0000-000000000003', 'TITLEIX-03', 'AI Decision Transparency', 'Provide transparency in AI-assisted Title IX decisions and recommendations', 2.0, ARRAY['Decision Transparency', 'Due Process']);

-- HIPAA Controls (Higher Ed only)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000004', 'HIPAA-01', 'PHI Encryption in AI Systems', 'Encrypt protected health information processed by AI systems', 2.5, ARRAY['Health Privacy', 'Data Encryption']),
('00000000-0000-0000-0000-000000000004', 'HIPAA-02', 'AI Vendor BAAs', 'Establish Business Associate Agreements with AI vendors processing PHI', 3.0, ARRAY['Vendor Agreements', 'Legal Compliance']),
('00000000-0000-0000-0000-000000000004', 'HIPAA-03', 'Audit Controls for Health AI', 'Implement audit controls for AI systems processing health information', 2.0, ARRAY['Audit Controls', 'Access Monitoring']);

-- NIST 800-53 Controls (Higher Ed baseline)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000007', 'NIST53-01', 'AI System Authorization', 'Authorize AI systems before deployment in accordance with NIST guidelines', 2.5, ARRAY['System Authorization', 'Risk Management']),
('00000000-0000-0000-0000-000000000007', 'NIST53-02', 'Continuous Monitoring of AI', 'Implement continuous monitoring for AI system security and compliance', 3.0, ARRAY['Continuous Monitoring', 'Security Controls']),
('00000000-0000-0000-0000-000000000007', 'NIST53-03', 'AI Risk Assessment', 'Conduct comprehensive risk assessments for AI system implementations', 2.0, ARRAY['Risk Assessment', 'Security Planning']);

-- ============================================================================
-- K-12 SPECIFIC CONTROLS
-- ============================================================================

-- COPPA Controls (K-12 only)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000015', 'COPPA-01', 'Under 13 Consent Management', 'Obtain and manage parental consent for AI processing of under-13 student data', 3.0, ARRAY['Parental Consent', 'Child Privacy', 'Legal Compliance']),
('00000000-0000-0000-0000-000000000015', 'COPPA-02', 'Age Verification in AI Systems', 'Implement age verification mechanisms in AI educational tools', 2.5, ARRAY['Age Verification', 'Privacy Controls']),
('00000000-0000-0000-0000-000000000015', 'COPPA-03', 'Data Minimization for Children', 'Minimize data collection from children in AI educational applications', 2.0, ARRAY['Data Minimization', 'Child Protection']),
('00000000-0000-0000-0000-000000000015', 'COPPA-04', 'Parental Access Rights', 'Provide parents access to their child''s data processed by AI systems', 2.0, ARRAY['Parental Rights', 'Data Access']);

-- CIPA Controls (K-12 only)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000016', 'CIPA-01', 'Content Filtering in AI Tools', 'Implement appropriate content filtering for AI-powered educational tools', 2.0, ARRAY['Content Filtering', 'Student Safety']),
('00000000-0000-0000-0000-000000000016', 'CIPA-02', 'Monitoring AI-Generated Content', 'Monitor AI-generated content for inappropriate material', 2.5, ARRAY['Content Monitoring', 'Student Protection']),
('00000000-0000-0000-0000-000000000016', 'CIPA-03', 'Internet Safety Education', 'Educate students about safe AI tool usage and digital citizenship', 1.5, ARRAY['Digital Citizenship', 'Safety Education']);

-- IDEA Controls (K-12 only)  
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000017', 'IDEA-01', 'AI in IEP Implementation', 'Ensure AI tools properly support IEP goals and accommodations', 3.0, ARRAY['Special Education', 'Individualized Support', 'Legal Compliance']),
('00000000-0000-0000-0000-000000000017', 'IDEA-02', 'Accessibility in AI Tools', 'Verify AI educational tools meet accessibility requirements for students with disabilities', 2.5, ARRAY['Accessibility', 'Inclusive Design']),
('00000000-0000-0000-0000-000000000017', 'IDEA-03', 'IEP Data Privacy', 'Protect IEP and special education data in AI processing systems', 2.0, ARRAY['Special Education Privacy', 'Data Protection']);

-- Section 508 Controls (K-12 focus)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000018', 'S508-01', 'AI Tool Accessibility Compliance', 'Ensure AI educational tools comply with Section 508 accessibility standards', 2.5, ARRAY['Accessibility', 'Compliance', 'Inclusive Technology']),
('00000000-0000-0000-0000-000000000018', 'S508-02', 'Accessibility Testing Protocol', 'Implement testing protocols for AI tool accessibility', 2.0, ARRAY['Testing Procedures', 'Quality Assurance']),
('00000000-0000-0000-0000-000000000018', 'S508-03', 'Accessibility Training Program', 'Train staff on accessibility requirements for AI educational tools', 1.5, ARRAY['Staff Training', 'Accessibility Awareness']);

-- ============================================================================
-- SHARED FRAMEWORK CONTROLS (BOTH AUDIENCES)
-- ============================================================================

-- NIST CSF Controls (both)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000019', 'NISTCSF-01', 'AI Asset Inventory', 'Maintain inventory of all AI systems and tools in use', 1.5, ARRAY['Asset Management', 'Inventory Control']),
('00000000-0000-0000-0000-000000000019', 'NISTCSF-02', 'AI Risk Assessment Framework', 'Implement risk assessment framework for AI implementations', 2.5, ARRAY['Risk Management', 'Security Framework']),
('00000000-0000-0000-0000-000000000019', 'NISTCSF-03', 'AI Incident Response Plan', 'Develop incident response procedures specific to AI system failures or breaches', 3.0, ARRAY['Incident Response', 'Business Continuity']),
('00000000-0000-0000-0000-000000000019', 'NISTCSF-04', 'AI System Recovery Procedures', 'Establish recovery procedures for AI system disruptions', 2.0, ARRAY['System Recovery', 'Operational Resilience']),
('00000000-0000-0000-0000-000000000019', 'NISTCSF-05', 'AI Security Awareness Training', 'Provide AI-specific security awareness training for staff', 1.5, ARRAY['Security Training', 'Staff Awareness']);

-- State Privacy Laws (both)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000008', 'STATE-01', 'State Data Residency Requirements', 'Ensure AI processing complies with state data residency requirements', 2.0, ARRAY['Data Residency', 'State Compliance']),
('00000000-0000-0000-0000-000000000008', 'STATE-02', 'Consumer Rights Implementation', 'Implement consumer rights for AI data processing (access, deletion, portability)', 2.5, ARRAY['Consumer Rights', 'Data Rights']),
('00000000-0000-0000-0000-000000000008', 'STATE-03', 'Sensitive Data Processing Controls', 'Implement additional controls for sensitive personal information in AI', 3.0, ARRAY['Sensitive Data', 'Enhanced Protection']);

-- PCI DSS Controls (both, if payments)
INSERT INTO public.framework_controls (framework_id, code, title, description, complexity_weight, impact_areas) VALUES
('00000000-0000-0000-0000-000000000010', 'PCI-01', 'Payment Data in AI Systems', 'Ensure payment card data is properly protected in AI applications', 3.0, ARRAY['Payment Security', 'Financial Data Protection']),
('00000000-0000-0000-0000-000000000010', 'PCI-02', 'AI Vendor PCI Compliance', 'Verify AI vendors meet PCI DSS requirements when processing payment data', 2.5, ARRAY['Vendor Compliance', 'Payment Processing']);

-- ============================================================================
-- SAMPLE POLICY MAPPINGS
-- ============================================================================

-- Sample policy mappings to demonstrate the relationship
INSERT INTO public.policy_control_mappings (control_id, policy_title, policy_url, mapping_strength, coverage_percentage) VALUES
('00000000-0000-0000-0000-000000000001', 'Student Data Privacy Policy', '/policies/student-privacy', 'full', 85),
('00000000-0000-0000-0000-000000000001', 'AI Acceptable Use Policy', '/policies/ai-acceptable-use', 'partial', 60),
('00000000-0000-0000-0000-000000000015', 'Children Online Safety Policy', '/policies/child-safety', 'full', 90),
('00000000-0000-0000-0000-000000000019', 'Information Security Policy', '/policies/information-security', 'full', 75);

-- ============================================================================
-- SAMPLE VENDOR DEPENDENCIES  
-- ============================================================================

-- Sample vendor dependencies to show integration
INSERT INTO public.vendor_control_dependencies (control_id, vendor_name, dependency_type, risk_impact, notes) VALUES
('00000000-0000-0000-0000-000000000001', 'ChatGPT EDU', 'required', 'high', 'Primary AI tool for educational content generation'),
('00000000-0000-0000-0000-000000000015', 'Khan Academy', 'supporting', 'medium', 'Educational platform with AI features for K-12'),
('00000000-0000-0000-0000-000000000015', 'IXL Learning', 'supporting', 'medium', 'Adaptive learning platform with AI assessment'),
('00000000-0000-0000-0000-000000000004', 'Epic Systems', 'required', 'critical', 'Student health records system with AI analytics');

-- Update sequences to avoid conflicts
SELECT setval('compliance_frameworks_id_seq', (SELECT MAX(id) FROM public.compliance_frameworks WHERE id ~ '^[0-9]+$')::bigint, true);
SELECT setval('framework_controls_id_seq', (SELECT MAX(id) FROM public.framework_controls WHERE id ~ '^[0-9]+$')::bigint, true);