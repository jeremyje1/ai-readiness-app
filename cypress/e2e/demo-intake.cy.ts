/// <reference types="cypress" />

describe("Demo intake-to-dashboard flow", () => {
    beforeEach(() => {
        cy.intercept("POST", "/api/demo/register", (req) => {
            expect(req.body.firstName).to.eq("Taylor")
            expect(req.body.lastName).to.eq("Jordan")
            expect(req.body.email).to.eq("taylor.jordan@example.edu")
            expect(req.body.institutionName).to.eq("River Bend District")
            expect(req.body.institutionType).to.eq("Higher Education")
            expect(req.body.role).to.eq("CIO / CTO / Technology Director")
            expect(req.body.interestAreas).to.include.members(["policy", "funding", "analytics"])
            expect(req.body.quickAssessment).to.deep.equal({ governance: 3, training: 3, funding: 3 })

            req.reply({
                statusCode: 200,
                body: {
                    success: true,
                    leadId: "lead-demo-123",
                    readinessLevel: "Developing",
                    overallScore: 60,
                    leadQualification: "WARM"
                }
            })
        }).as("registerDemoLead")

        cy.intercept("POST", "/api/demo/login", {
            statusCode: 200,
            body: {
                success: true,
                userId: "demo-user",
                redirectUrl: "/dashboard/personalized?demo=true&tour=start"
            }
        }).as("loginDemoUser")
    })

    it("captures intake data and transitions to redirect state", () => {
        cy.visit("/demo")

        cy.get("#first-name").clear().type("Taylor")
        cy.get("#last-name").clear().type("Jordan")
        cy.get("#work-email").clear().type("taylor.jordan@example.edu")
        cy.get("#institution-name").clear().type("River Bend District")

        cy.get('[data-testid="institution-type-select"]').click()
        cy.contains('[role="option"]', "Higher Education").click()

        cy.get('[data-testid="role-select"]').click()
        cy.contains('[role="option"]', "CIO / CTO / Technology Director").click()

        cy.get('[data-testid="interest-analytics"]').click()

        cy.get("#goals").clear().type("Highlight analytics ROI and grant readiness for leadership.")

        cy.get('[data-testid="start-demo-button"]').click()

        cy.wait("@registerDemoLead")
        cy.wait("@loginDemoUser")

        cy.contains("Redirecting you to the personalized dashboard.").should("be.visible")
        cy.contains("Launching interactive tour").should("be.visible")
    })
})
