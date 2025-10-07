-- Seed at least 50 policy templates to support the marketing claim of "50+ policy templates".
-- Safe to run multiple times; titles are unique per education band.

DO $$
DECLARE
  base_templates jsonb := '[
    {
      "policy_type": "Governance",
      "title": "AI Governance Charter",
      "description": "Foundational charter defining responsibilities, scope, and reporting structure for institutional AI initiatives.",
      "template_content": "# AI Governance Charter\n## Purpose\nEstablish oversight for ethical, effective AI adoption across the institution.\n## Scope\nApplies to all departments using AI tools for instruction, operations, or research.",
      "stakeholders": ["Board of Education", "Superintendent", "Chief Technology Officer"],
      "implementation_steps": ["Form cross-functional AI governance council", "Approve operating cadence", "Publish charter to staff"]
    },
    {
      "policy_type": "Privacy & Security",
      "title": "AI Data Privacy Policy",
      "description": "Defines data classification, consent, and retention rules for AI-powered systems handling learner information.",
      "template_content": "# AI Data Privacy Policy\nOutline lawful basis, parental/guardian consent procedures, and vendor data sharing restrictions.",
      "stakeholders": ["Data Protection Officer", "Legal", "IT Security"],
      "implementation_steps": ["Inventory AI systems", "Classify personal data", "Document retention schedule"]
    },
    {
      "policy_type": "Instructional Use",
      "title": "Responsible Classroom AI Policy",
      "description": "Guidelines for teachers and students leveraging generative AI while maintaining academic integrity.",
      "template_content": "# Responsible Classroom AI\nClarify approved tools, citation expectations, and misuse escalation pathway.",
      "stakeholders": ["Curriculum Director", "Faculty Senate", "Student Affairs"],
      "implementation_steps": ["Align with honor code", "Pilot with volunteer instructors", "Collect feedback and iterate"]
    },
    {
      "policy_type": "Data Management",
      "title": "AI Data Governance Standard",
      "description": "Standardizes meta-data, lineage, and quality checks for datasets feeding AI models.",
      "template_content": "# AI Data Governance\nInclude schema documentation expectations and quality thresholds prior to model training.",
      "stakeholders": ["Data Governance Council", "Institutional Research", "IT"],
      "implementation_steps": ["Assign data stewards", "Define quality checks", "Publish governance catalog"]
    },
    {
      "policy_type": "Procurement",
      "title": "AI Vendor Vetting Checklist",
      "description": "Checklist covering compliance, bias mitigation, and student safety requirements before procurement.",
      "template_content": "# AI Vendor Vetting\nEnsure vendors disclose model provenance, data handling, and accessibility accommodations.",
      "stakeholders": ["Procurement", "Legal", "Accessibility Office"],
      "implementation_steps": ["Develop scoring rubric", "Review third-party audits", "Document approval decision"]
    },
    {
      "policy_type": "Student Safety",
      "title": "AI Safeguards & Monitoring Policy",
      "description": "Defines monitoring, escalation, and guardian communication for AI tools interacting with students.",
      "template_content": "# AI Safeguards\nSet monitoring cadence, incident response criteria, and communication workflows.",
      "stakeholders": ["Student Services", "Counseling", "IT Security"],
      "implementation_steps": ["Enable content filters", "Document escalation paths", "Schedule quarterly safety reviews"]
    },
    {
      "policy_type": "Professional Development",
      "title": "AI Training & Upskilling Plan",
      "description": "Outlines competencies, delivery cadence, and certification paths for faculty and staff.",
      "template_content": "# AI Training Plan\nMap skill pathways from awareness to advanced practitioner with micro-credentials.",
      "stakeholders": ["HR", "Instructional Design", "Faculty Development"],
      "implementation_steps": ["Assess baseline skills", "Publish training calendar", "Track completion metrics"]
    },
    {
      "policy_type": "Ethics",
      "title": "AI Ethics & Bias Mitigation Policy",
      "description": "Establishes principles for equitable AI, auditing cadence, and remediation expectations.",
      "template_content": "# AI Ethics Policy\nAdopt fairness, accountability, transparency, and explainability principles for AI deployment.",
      "stakeholders": ["Ethics Committee", "DEI Office", "Research"],
      "implementation_steps": ["Define audit checklist", "Schedule bias reviews", "Report findings to leadership"]
    },
    {
      "policy_type": "Assessment",
      "title": "AI-Enhanced Assessment Integrity Policy",
      "description": "Protects academic integrity when AI assists with grading or feedback.",
      "template_content": "# Assessment Integrity\nClarify acceptable AI usage in scoring, automated feedback, and exam settings.",
      "stakeholders": ["Assessment Office", "Academic Affairs", "Registrar"],
      "implementation_steps": ["Audit grading workflows", "Configure detection safeguards", "Communicate policy to faculty"]
    },
    {
      "policy_type": "Operations",
      "title": "AI Operations & Maintenance SOP",
      "description": "Operational playbook for patching, updating, and monitoring AI services.",
      "template_content": "# AI Operations SOP\nDefine change management process, monitoring alerts, and rollback triggers.",
      "stakeholders": ["IT Operations", "DevOps", "Service Desk"],
      "implementation_steps": ["Document runbooks", "Automate health checks", "Review incident history"]
    }
  ]'::jsonb;
  tpl jsonb;
  level text;
  levels constant text[] := ARRAY['District', 'Elementary', 'Middle School', 'High School', 'Higher Education'];
BEGIN
  FOR tpl IN SELECT value FROM jsonb_array_elements(base_templates) AS value LOOP
    FOREACH level IN ARRAY levels LOOP
      INSERT INTO public.ai_policy_templates (policy_type, title, description, template_content, stakeholders, implementation_steps)
      SELECT
        tpl->>'policy_type',
        format('%s - %s', tpl->>'title', level),
        format('%s Tailored for %s programs.', tpl->>'description', level),
        format('%s\n\n## Audience Focus\nAdapt this template for %s stakeholders and include annual review checkpoints.', tpl->>'template_content', level),
        COALESCE((SELECT array_agg(value::text) FROM jsonb_array_elements_text(tpl->'stakeholders')), ARRAY[]::text[]) || level,
        COALESCE((SELECT array_agg(value::text) FROM jsonb_array_elements_text(tpl->'implementation_steps')), ARRAY[]::text[]) || format('Customize policy rollout plan for %s audience', level)
      WHERE NOT EXISTS (
        SELECT 1 FROM public.ai_policy_templates WHERE title = format('%s - %s', tpl->>'title', level)
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'AI policy templates seeded: %',
    (SELECT COUNT(*) FROM public.ai_policy_templates);
END $$;
