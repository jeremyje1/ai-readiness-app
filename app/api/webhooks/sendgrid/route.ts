import { NextRequest, NextResponse } from "next/server"

/**
 * SendGrid Contact Form Webhook
 * Receives lead generation form submissions and sends formatted emails via SendGrid
 */

interface ContactFormData {
    firstName: string
    lastName: string
    email: string
    institution: string
    role: string
    institutionType: string
    interest: string
    message: string
    timeline?: string
    submittedAt: string
    source: string
}

export async function POST(request: NextRequest) {
    try {
        // SendGrid Configuration
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
        const FROM_EMAIL = "info@northpathstrategies.org"
        const TO_EMAIL = "info@northpathstrategies.org"

        if (!SENDGRID_API_KEY) {
            console.error("SENDGRID_API_KEY is not configured")
            return NextResponse.json(
                { error: "Email service not configured" },
                {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            )
        }

        // Parse form data with error handling
        let formData: ContactFormData
        try {
            formData = await request.json()
        } catch (parseError) {
            console.error("❌ Invalid JSON payload received")
            return NextResponse.json(
                { error: "Invalid request payload" },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            )
        }

        // Early validation - reject completely empty submissions (likely bots)
        if (!formData || typeof formData !== 'object') {
            console.warn("⚠️ Rejected empty/invalid payload")
            return NextResponse.json(
                { error: "Invalid request payload" },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            )
        }

        console.log("📨 Received form submission:", {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            institution: formData.institution,
            interest: formData.interest
        })

        // Validate required fields
        const requiredFields = ["firstName", "lastName", "email", "institution", "role", "institutionType", "interest", "message"]
        const missingFields = requiredFields.filter(field => !formData[field as keyof ContactFormData])

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(", ")}` },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            )
        }

        // Prepare email subject
        const emailSubject = `🎯 New Lead: ${formData.interest} - ${formData.institution}`

        // Prepare plain text email
        const emailText = `
New Contact Form Submission from Lead Generation Page

CONTACT INFORMATION
-------------------
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Institution: ${formData.institution}
Role: ${formData.role}
Institution Type: ${formData.institutionType}

INTEREST & TIMELINE
-------------------
Primary Interest: ${formData.interest}
Timeline: ${formData.timeline || "Not specified"}

MESSAGE
-------
${formData.message}

SUBMISSION DETAILS
------------------
Submitted At: ${new Date(formData.submittedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })} CST
Source: ${formData.source}
IP Address: ${request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"}
User Agent: ${request.headers.get("user-agent") || "Unknown"}

---
Reply directly to this email to respond to ${formData.firstName}.
`

        // Prepare HTML email
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1e3a8a; margin-bottom: 10px; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
        .field { margin-bottom: 12px; }
        .field-label { font-weight: 600; color: #475569; }
        .field-value { color: #0f172a; }
        .message-box { background: white; border-left: 4px solid #2563eb; padding: 15px; margin-top: 10px; }
        .priority { background: #fef3c7; border: 1px solid #fbbf24; padding: 10px; border-radius: 6px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎯 New Lead from AI Blueprint</h2>
        </div>
        <div class="content">
            <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="field">
                    <span class="field-label">Name:</span>
                    <span class="field-value">${formData.firstName} ${formData.lastName}</span>
                </div>
                <div class="field">
                    <span class="field-label">Email:</span>
                    <span class="field-value"><a href="mailto:${formData.email}">${formData.email}</a></span>
                </div>
                <div class="field">
                    <span class="field-label">Institution:</span>
                    <span class="field-value">${formData.institution}</span>
                </div>
                <div class="field">
                    <span class="field-label">Role:</span>
                    <span class="field-value">${formData.role}</span>
                </div>
                <div class="field">
                    <span class="field-label">Institution Type:</span>
                    <span class="field-value">${formData.institutionType}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Interest & Timeline</div>
                <div class="field">
                    <span class="field-label">Primary Interest:</span>
                    <span class="field-value">${formData.interest}</span>
                </div>
                <div class="field">
                    <span class="field-label">Timeline:</span>
                    <span class="field-value">${formData.timeline || "Not specified"}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Message</div>
                <div class="message-box">
                    ${formData.message.replace(/\n/g, "<br>")}
                </div>
            </div>

            ${formData.timeline === "urgent" ? `
            <div class="priority">
                ⚠️ <strong>Priority Lead:</strong> This prospect indicated an urgent timeline (within 2 weeks). Follow up promptly!
            </div>
            ` : ""}

            <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${formData.email}?subject=Re: AI Readiness Consultation&body=Hi ${formData.firstName},%0D%0A%0D%0AThank you for reaching out..." class="btn">
                    Reply to ${formData.firstName}
                </a>
            </div>
        </div>
        <div class="footer">
            <p>Submitted: ${new Date(formData.submittedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })} CST</p>
            <p>Source: ${formData.source}</p>
            <p>AI Blueprint Lead Generation System</p>
        </div>
    </div>
</body>
</html>
`

        // Send email via SendGrid
        console.log("📤 Sending email to SendGrid API...")
        const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SENDGRID_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: TO_EMAIL }],
                        subject: emailSubject
                    }
                ],
                from: {
                    email: FROM_EMAIL,
                    name: "AI Blueprint Lead System"
                },
                reply_to: {
                    email: formData.email,
                    name: `${formData.firstName} ${formData.lastName}`
                },
                content: [
                    {
                        type: "text/plain",
                        value: emailText
                    },
                    {
                        type: "text/html",
                        value: emailHtml
                    }
                ]
            })
        })

        if (!sendGridResponse.ok) {
            const errorText = await sendGridResponse.text()
            console.error("❌ SendGrid API Error:", sendGridResponse.status, errorText)
            throw new Error(`SendGrid error: ${sendGridResponse.status}`)
        }

        console.log("✅ Email sent successfully via SendGrid!")

        // Optional: Send confirmation email to the user
        try {
            const confirmationResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${SENDGRID_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: [{ email: formData.email }],
                            subject: "We received your inquiry - NorthPath Strategies"
                        }
                    ],
                    from: {
                        email: FROM_EMAIL,
                        name: "Jeremy Estrella, NorthPath Strategies"
                    },
                    reply_to: {
                        email: TO_EMAIL,
                        name: "Jeremy Estrella"
                    },
                    content: [
                        {
                            type: "text/html",
                            value: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; background: #f9fafb; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Thank You for Reaching Out!</h2>
        </div>
        <div class="content">
            <p>Hi ${formData.firstName},</p>
            
            <p>Thank you for your interest in custom AI readiness solutions for ${formData.institution}. I received your inquiry regarding <strong>${formData.interest}</strong> and will review it carefully.</p>
            
            <p>I typically respond to inquiries within 24 hours (often sooner). In the meantime, feel free to explore more resources at <a href="https://northpathstrategies.org">northpathstrategies.org</a>.</p>
            
            <p>I look forward to discussing how I can help ${formData.institution} achieve its AI goals.</p>
            
            <p>Best regards,<br>
            <strong>Jeremy Estrella</strong><br>
            Founder, NorthPath Strategies<br>
            <a href="mailto:info@northpathstrategies.org">info@northpathstrategies.org</a></p>
        </div>
        <div class="footer">
            <p>NorthPath Strategies | Custom AI Solutions for Education</p>
            <p><a href="https://northpathstrategies.org">northpathstrategies.org</a></p>
        </div>
    </div>
</body>
</html>
`
                        }
                    ]
                })
            })

            if (confirmationResponse.ok) {
                console.log("✅ Confirmation email sent to user")
            } else {
                console.warn("⚠️ Failed to send confirmation email to user")
            }
        } catch (error) {
            console.warn("⚠️ Error sending confirmation email:", error)
        }

        // Return success with CORS headers
        return NextResponse.json({
            success: true,
            message: "Form submitted successfully"
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        })

    } catch (error) {
        console.error("❌ Contact form submission error:", error)
        return NextResponse.json(
            { error: "Failed to process form submission" },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            }
        )
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}
