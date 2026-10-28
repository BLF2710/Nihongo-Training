// The privacy policy, as data: the page (pages/PrivacyPage.tsx) only lays it out. Keep it true to what the code does;
// when a feature changes what is collected or shared, update this text and LAST_UPDATED.

export const LAST_UPDATED = "28 October 2026";

/**
 * Who runs the site and how to reach them outside the app. Fill these in before launch (a real name and an inbox you
 * read); while they are empty the policy points to Help & support only.
 */
export const OPERATOR: { name: string | null; email: string | null } = { name: null, email: null };

export type PolicyBlock = { kind: "text"; text: string } | { kind: "list"; items: string[] };
export type PolicySection = { id: string; title: string; blocks: PolicyBlock[] };

const text = (value: string): PolicyBlock => ({ kind: "text", text: value });
const list = (...items: string[]): PolicyBlock => ({ kind: "list", items });

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    id: "summary", title: "In short",
    blocks: [list(
      "We keep what the site needs to work: your account, your learning progress, and what you choose to share with friends.",
      "We don't sell your data, show ads, or use analytics or tracking tools, and the site sets no cookies.",
      "Some features send text or audio to outside services to work (listed below). Recordings from the speaking test are never stored.",
      "You choose who sees your progress, and you can ask us to delete your account and data.",
    )],
  },
  {
    id: "collect", title: "What we collect",
    blocks: [
      text("When you create an account or sign in:"),
      list(
        "Your username, email address and a scrambled form of your password (never the password itself).",
        "If you sign in with Google: your Google account's email address and an identifier Google gives us. We never see your Google password.",
        "Whether your email address is confirmed, when you last signed in, and your time zone (so your study day starts at your midnight).",
      ),
      text("What you add to your profile: display name, bio, languages, learning goal, daily goal and, if you upload one, a profile picture. Pictures are re-encoded to a small square image; location and camera details are removed and the original file is not kept."),
      text("Your learning: lessons and units completed, answers and scores, XP, streaks, study time, review cards, the mistake notebook, mock exam and speaking test results (the transcript and scores, never the recording), and achievements."),
      text("Social features, if you use them: friends and friend requests, blocks, challenges, cheers and nudges, messages to other learners, reports, and your choices for activity sharing, suggestions and \"studying now\"."),
      text("Help & support and the study assistant: the messages you send and the replies."),
      text("To protect accounts, the server briefly counts requests per network address (for example failed sign-ins). These counters are deleted when their time window ends."),
    ],
  },
  {
    id: "use", title: "How we use it",
    blocks: [list(
      "To run your account: signing in, keeping your progress, unlocking lessons and units, and the daily goal and streak.",
      "To send email you need: confirming your address and resetting your password. We don't send newsletters or marketing.",
      "To show your profile and activity to the people you allow (see \"Who can see what\").",
      "To keep the site safe: limiting sign-in attempts, handling reports, and an audit log of what administrators change.",
    )],
  },
  {
    id: "visibility", title: "Who can see what",
    blocks: [list(
      "Other signed-in learners can see your display name, username and profile picture when they look you up or see you in a list. There is no public directory of learners.",
      "Your progress, bio and achievements follow your choice in Settings → Privacy & friends: only you, your friends, or all signed-in learners.",
      "Activity sharing, friend suggestions and \"studying now\" are separate choices in the same place; suggestions and \"studying now\" are off unless you turn them on.",
      "Your email address is never shown to other learners.",
      "Administrators can see account details and the content of reports and support requests to run the site; their actions are recorded in an audit log.",
    )],
  },
  {
    id: "services", title: "Outside services",
    blocks: [
      text("Some features rely on other companies. Only what a feature needs is sent:"),
      list(
        "Microsoft Azure Speech: the audio of a speaking-test answer, to score pronunciation and fluency (only when you take the speaking test).",
        "Anthropic (Claude): your questions to the study assistant, and the transcript of written or spoken test answers for content grading.",
        "Google: sign-in with Google, if you choose it.",
        "Our email provider: your email address and the message, when we send you a confirmation or password-reset email.",
        "Our hosting provider, which runs the servers and database.",
      ),
      text("These companies process the data to provide their service to us under their own privacy terms. We don't send them your learning history or profile beyond what is listed."),
    ],
  },
  {
    id: "browser", title: "Stored in your browser",
    blocks: [text("The site uses your browser's local storage (not cookies) to keep you signed in and remember settings: your sign-in token, name and username, chosen language and course level, theme, unfinished activities, and cached course updates. Signing out removes the sign-in details; the rest you can clear from your browser's site data.")],
  },
  {
    id: "retention", title: "How long we keep it",
    blocks: [list(
      "Your account and learning data are kept while your account exists.",
      "If you deactivate your account, you can no longer sign in, but your data is kept in case you come back. Ask us if you want it deleted (see below).",
      "Database backups are kept for about two weeks and then replaced, so deleted data disappears from backups within that time.",
      "Expired sign-in links, password-reset links and request counters are removed automatically.",
    )],
  },
  {
    id: "rights", title: "Your choices and rights",
    blocks: [
      list(
        "See and correct your details in Settings at any time, and change who sees your progress.",
        "Remove your profile picture, unfriend or block other learners, and turn sharing features off.",
        "Ask for a copy of your data, or for your account and data to be deleted, through Help & support. We answer within 30 days.",
      ),
      text("Depending on where you live, you may have further rights under data protection law, including the right to complain to your data protection authority."),
    ],
  },
  {
    id: "security", title: "Security",
    blocks: [text("Passwords are stored only in scrambled (hashed) form, connections are encrypted, and sign-in attempts are limited. No system is perfectly secure, but if something goes wrong that affects your data, we will tell you.")],
  },
  {
    id: "children", title: "Children",
    blocks: [text("Lingora is not meant for children under 13, and we don't knowingly collect their data. If you believe a child under 13 has an account, contact us and we will delete it.")],
  },
  {
    id: "changes", title: "Changes to this policy",
    blocks: [text("If we change what we collect or how we use it, we'll update this page and the date at the top, and tell signed-in learners about important changes on the site.")],
  },
];
