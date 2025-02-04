'use server';

interface FontInfo {
  family: string;
  fullName: string;
  postscriptName: string;
}

export async function submitFonts(
  fonts: FontInfo[],
  userAgent: string,
  os: string|undefined,
) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'stoyan'; // Change this
  const REPO_NAME = 'fontes-locais'; // Change this
  const FILE_PATH = `${Date.now()}.md`; // Unique file name

  const fileContent = `# ${userAgent}\n## ${os}\n\n 1. ${fonts
    .map((f) => f.fullName)
    .join('\n 1. ')}`;

  const encodedContent = Buffer.from(fileContent).toString('base64');

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add new submission`,
        content: encodedContent,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'GitHub API error');
  }

  return {
    message: `Successfully saved ${fonts.length} fonts and user-agent information to GitHub: `,
    url: `https://www.github.com/${REPO_OWNER}/${REPO_NAME}/tree/main/data/${FILE_PATH}`,
  };
}
