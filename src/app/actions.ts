"use server"

interface FontInfo {
  family: string
  fullName: string
  postscriptName: string
}

export async function submitFonts(fonts: FontInfo[], userAgent: string) {
  // Here you would typically send this data to your database or perform any server-side operations
  console.log("Received fonts:", fonts)
  console.log("User-Agent:", userAgent)

  // Simulate a server delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return a success message
  return { message: `Successfully received ${fonts.length} fonts and user-agent information` }
}

