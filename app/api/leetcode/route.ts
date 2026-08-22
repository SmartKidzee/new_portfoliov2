import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "SmartKidzee";

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                ranking
                reputation
                starRating
              }
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              userCalendar {
                streak
                totalActiveDays
                submissionCalendar
              }
            }
          }
        `,
        variables: { username },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`LeetCode API returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    const matchedUser = payload?.data?.matchedUser;

    if (!matchedUser) {
      throw new Error("LeetCode user not found");
    }

    const submitStats = matchedUser.submitStats?.acSubmissionNum || [];
    const totalSolved = submitStats.find((s: { difficulty: string }) => s.difficulty === "All")?.count ?? 0;
    const easySolved = submitStats.find((s: { difficulty: string }) => s.difficulty === "Easy")?.count ?? 0;
    const mediumSolved = submitStats.find((s: { difficulty: string }) => s.difficulty === "Medium")?.count ?? 0;
    const hardSolved = submitStats.find((s: { difficulty: string }) => s.difficulty === "Hard")?.count ?? 0;

    let submissionCalendarRaw: Record<string, number> = {};
    try {
      if (matchedUser.userCalendar?.submissionCalendar) {
        submissionCalendarRaw = JSON.parse(matchedUser.userCalendar.submissionCalendar);
      }
    } catch {
      submissionCalendarRaw = {};
    }

    return NextResponse.json({
      status: "success",
      username: matchedUser.username,
      ranking: matchedUser.profile?.ranking ?? 0,
      reputation: matchedUser.profile?.reputation ?? 0,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      streak: matchedUser.userCalendar?.streak ?? 0,
      totalActiveDays: matchedUser.userCalendar?.totalActiveDays ?? 0,
      submissionCalendar: submissionCalendarRaw,
    });
  } catch (error) {
    // Fallback data if LeetCode GraphQL is temporarily unreachable
    return NextResponse.json({
      status: "fallback",
      username,
      ranking: 3472771,
      reputation: 0,
      totalSolved: 32,
      easySolved: 24,
      mediumSolved: 7,
      hardSolved: 1,
      streak: 6,
      totalActiveDays: 14,
      submissionCalendar: {
        "1773619200": 1,
        "1774396800": 1,
        "1777248000": 1,
        "1786320000": 2,
        "1786406400": 6,
        "1786492800": 6,
        "1786579200": 7,
        "1786665600": 4,
        "1786752000": 1,
        "1786924800": 4,
        "1787011200": 4,
        "1787097600": 3,
        "1787184000": 8,
        "1787270400": 7,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
