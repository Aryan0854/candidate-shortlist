import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { brId, candidatesForAnalysis, requiredSkills } = await request.json();

    const mockAnalysisData = {
      message: "✅ Resume Processed Successfully!",
      resume_detected_skills: ["java", "aws"],
      candidates: [
        {
          employee_name: "Deepak Choudhary",
          individual_skill_match_percent: {
            java: 100,
            react: 18.05
          },
          resume_experience_years: 3,
          expected_experience: "E2 (3-5 yrs)",
          experience_match_percent: 75,
          resume_summary: "Deepak Choudhary Java Backend Developer with 3+ years of experience in building secure, scalable, and high-performance backend systems using Core Java, Spring Boot, Spring Security, Hibernate, and RESTful Microservices. Proficient in MySQL, RabbitMQ, JUnit, Mockito, Git, and Maven with a strong focus on API development, asynchronous messaging, and performance tuning.",
          preview_text: "Deepak Choudhary Java Backend Developer"
        },
        {
          employee_name: "Surya Venkata Bhavani Kalluri",
          individual_skill_match_percent: {
            dotnet: 95,
            sql: 78
          },
          resume_experience_years: 2,
          expected_experience: "E2 (3-5 yrs)",
          experience_match_percent: 60,
          resume_summary: "Surya Venkata Bhavani Kalluri is a .NET Developer with 1.5+ years of experience in building web applications using C#, ASP.NET, HTML, CSS, JavaScript, and SQL Server. Proven track record in API integration and database management.",
          preview_text: "Surya Venkata Bhavani Kalluri .NET Developer"
        }
      ]
    };

    return NextResponse.json({
      message: `Analysis job started for ${mockAnalysisData.candidates.length} candidate(s) under BR ID ${brId}.`,
      resultCount: mockAnalysisData.candidates.length,
      resultsReady: mockAnalysisData
    }, { status: 202 });

  } catch (error: any) {
    console.error('Error triggering analysis:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
