'use client';

import {useState, useEffect, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {submitFonts} from '../app/actions';

interface FontInfo {
  family: string;
  fullName: string;
  postscriptName: string;
  checked: boolean;
}

export default function LocalFontsSelector() {
  const [step, setStep] = useState(1);
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ghurl, setGhurl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAgent, setUserAgent] = useState<string>('');

  const osname = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserAgent(window.navigator.userAgent);
  }, []);

  const queryFonts = async () => {
    if (!('queryLocalFonts' in window)) {
      setError('Your browser does not support querying local fonts.');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fontData = await (window as any).queryLocalFonts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uniqueFonts = Array.from(
        new Set(fontData.map((font: any) => font.fullName)),
      ).map((fullName) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const font = fontData.find((f: any) => f.fullName === fullName);
        return {
          family: font.family,
          fullName: font.fullName,
          postscriptName: font.postscriptName,
          checked: true,
        };
      });
      console.log(fontData[0]);
      setFonts(uniqueFonts);
      setStep(2);
      // eslint-disable-next-line
    } catch (_) {
      setError(
        'An error occurred while querying local fonts. Did you grant the permissions.',
      );
    }
  };

  const handleCheckboxChange = (index: number) => {
    setFonts((prevFonts) =>
      prevFonts.map((font, i) =>
        i === index ? {...font, checked: !font.checked} : font,
      ),
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const checkedFonts = fonts.filter((font) => font.checked);
    try {
      const result = await submitFonts(
        checkedFonts,
        userAgent,
        osname.current?.value,
      );
      setMessage(result.message);
      setGhurl(result.url);
      // eslint-disable-next-line
    } catch (_) {
      setError('An error occurred while submitting the fonts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to create a unique, safe font family name
  const createUniqueFontFamily = (fullName: string, index: number) => {
    return `font-preview-${index}-${fullName
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}`;
  };

  return (
    <div className="w-full max-w-4xl space-y-4 bg-white p-6 rounded-lg shadow-md">
      {step === 1 && (
        <>
          <h2 className="text-3xl font-semibold mb-2">Local font survey</h2>
          <p className="text-gray-800">
            This little app aims to gather data about locally available fonts
            across devices and operating systems. The data and the code is
            open-source, available{' '}
            <a href="https://github.com/stoyan/fontes-locais/">
              here on GitHub
            </a>
            .
          </p>
          <p>
            There are two steps in the process. In step 1 we use{' '}
            <code>queryFonts</code> to get the data about the local fonts on
            your device. The <code>queryFonts</code> API is available in Chrome
            only. In step 2 you review the list of fonts and uncheck any you
            don&apos;t want to share for whatever reason (e.g. privacy
            concerns).
          </p>
          <p>
            When you submit the list, it&apos;s written in GitHub in the{' '}
            <code>/data</code> directory using a timestamp as a file name
          </p>

          <Button onClick={queryFonts}>STEP 1: Collect local font info</Button>
          <p className="text-gray-800">
            After clicking, you&apos; be asked to grant permission to access
            your local fonts. Grant the permission if you want to help the
            research.
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-3xl font-semibold mb-2">
            Select the fonts to send
          </h2>
          <p className="text-gray-800 mb-2">
            {fonts.length} font files found. Uncheck the ones you don&apos;t
            want to send to the GitHub repo.
          </p>
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
                  const uniqueFontFamily = createUniqueFontFamily(
                    font.fullName,
                    index,
                  );
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
                          }}>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p>
            Your user-agent string will also be stored to figure out which fonts
            go with which operating system:
          </p>
          <p className="text-sm bg-gray-100 p-2 rounded mb-4 break-all">
            {userAgent}
          </p>
          <p>
            And because browsers lie about the operating system to prevent
            finderprinting, optionally you can let us know what is your actual
            operating system:
          </p>
          <p>
            <Input
              ref={osname}
              type="text"
              placeholder="(optional) Actual operating system"
              className="w-full"
            />
          </p>

          {error && (
            <Alert variant="destructive" className="text-lg">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert variant="default" className="border-lime-700 text-lg">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                <p>{message}</p>
                <a href={ghurl ?? ''}>{ghurl}</a>
              </AlertDescription>
            </Alert>
          )}
          {!message && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-4">
              {isSubmitting
                ? 'Submitting...'
                : '(final) STEP 2: Send data to GitHub'}
            </Button>
          )}
          <p className="text-gray-600 mb-2">
            By the way, some of the font previews may show a default font rather
            than the actual one. This is because some fonts (e.g. Arial Hebrew
            or Apple Color Emoji) don&apos;t have the roman letters to spell
            their name.
          </p>
        </>
      )}
    </div>
  );
}
