"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { submitFonts } from "../app/actions"

interface FontInfo {
  family: string
  fullName: string
  postscriptName: string
  checked: boolean
}

export default function LocalFontsSelector() {
  const [step, setStep] = useState(1)
  const [fonts, setFonts] = useState<FontInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userAgent, setUserAgent] = useState<string>("")

  useEffect(() => {
    setUserAgent(window.navigator.userAgent)
  }, [])

  const queryFonts = async () => {
    if (!("queryLocalFonts" in window)) {
      setError("Your browser does not support querying local fonts.")
      return
    }

    try {
      const fontData = await (window as any).queryLocalFonts()
      const uniqueFonts = Array.from(new Set(fontData.map((font: any) => font.fullName))).map((fullName) => {
        const font = fontData.find((f: any) => f.fullName === fullName)
        return {
          family: font.family,
          fullName: font.fullName,
          postscriptName: font.postscriptName,
          checked: true,
        }
      })
      console.log(fontData[0]);
      setFonts(uniqueFonts)
      setStep(2)
    } catch (err) {
      setError("An error occurred while querying local fonts. Make sure you've granted the necessary permissions.")
    }
  }

  const handleCheckboxChange = (index: number) => {
    setFonts((prevFonts) => prevFonts.map((font, i) => (i === index ? { ...font, checked: !font.checked } : font)))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    const checkedFonts = fonts.filter((font) => font.checked)

    try {
      const result = await submitFonts(checkedFonts, userAgent)
      setMessage(result.message)
    } catch (err) {
      setError("An error occurred while submitting the fonts.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to create a unique, safe font family name
  const createUniqueFontFamily = (fullName: string, index: number) => {
    return `font-preview-${index}-${fullName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`
  }

  return (
    <div className="w-full max-w-4xl space-y-4 bg-white p-6 rounded-lg shadow-md">
      {step === 1 && (
        <>
          <Button onClick={queryFonts}>STEP 1</Button>
          <p className="text-sm text-gray-500">
            After clicking, you'll be asked to grant permission to access your local fonts.
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Select fonts to send:</h2>
          <p className="text-sm text-gray-500 mb-2">
            Uncheck the fonts you don't want to send. Your user-agent string will also be sent:
          </p>
          <p className="text-xs bg-gray-100 p-2 rounded mb-4 break-all">{userAgent}</p>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Select</TableHead>
                  <TableHead>Font Name</TableHead>
                  <TableHead>Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fonts.map((font, index) => {
                  const uniqueFontFamily = createUniqueFontFamily(font.fullName, index)
                  return (
                    <TableRow key={font.postscriptName}>
                      <TableCell>
                        <Checkbox
                          id={font.postscriptName}
                          checked={font.checked}
                          onCheckedChange={() => handleCheckboxChange(index)}
                        />
                      </TableCell>
                      <TableCell>{font.fullName}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontFamily: uniqueFontFamily,
                            fontFeatureSettings: '"liga" 0, "calt" 0',
                          }}
                        >
                          {font.fullName}
                        </span>
                        <style jsx>{`
                          @font-face {
                            font-family: '${uniqueFontFamily}';
                            src: local('${font.fullName}');
                            font-display: block;
                          }
                        `}</style>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="mt-4">
            {isSubmitting ? "Submitting..." : "STEP 2"}
          </Button>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert variant="default">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

