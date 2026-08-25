import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Settings2, AlertTriangle, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const PRACTICE_PHRASES = [
  { hindi: "नमस्ते, मेरा नाम राहुल है।", english: "Hello, my name is Rahul." },
  { hindi: "मैं हिंदी सीख रहा हूँ।", english: "I am learning Hindi." },
  { hindi: "आज मौसम बहुत अच्छा है।", english: "The weather is very nice today." },
  { hindi: "मुझे चाय पसंद है।", english: "I like tea." },
  { hindi: "कृपया मेरी मदद कीजिए।", english: "Please help me." },
  { hindi: "आप कहाँ रहते हैं?", english: "Where do you live?" },
  { hindi: "मैं स्कूल जा रहा हूँ।", english: "I am going to school." },
  { hindi: "यह बहुत सुंदर है।", english: "This is very beautiful." },
];

export function StudentSpeakingPracticePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<number | null>(null);
  const [textInput, setTextInput] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "hi-IN";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          const t = result[0]?.transcript ?? "";
          if (result.isFinal) {
            final += t;
          } else {
            interim += t;
          }
        }
        if (final) setTranscript(final);
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: Event & { error: string }) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    setError(null);
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setInterimTranscript("");
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setError("Failed to start speech recognition.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Speaking Practice</h1>
        <p className="text-muted-foreground">
          Practice your Hindi speaking skills with speech recognition.
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Speech Recognition</p>
            <p className="text-xs text-muted-foreground">
              {isSupported === null
                ? "Checking availability..."
                : isSupported
                ? "Available in your browser. Hindi (hi-IN) is configured."
                : "Not supported in your browser. Use text input as fallback."}
            </p>
          </div>
          <Badge variant={isSupported ? "default" : "destructive"}>
            {isSupported === null
              ? "Checking"
              : isSupported
              ? "Available"
              : "Unavailable"}
          </Badge>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Practice Phrases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Practice Phrases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {PRACTICE_PHRASES.map((phrase, i) => (
              <button
                key={i}
                onClick={() => setSelectedPhrase(i)}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  selectedPhrase === i
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
              >
                <p className="font-medium">{phrase.hindi}</p>
                <p className="text-xs text-muted-foreground">{phrase.english}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recording Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Record Your Speech</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPhrase !== null && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Say this phrase:</p>
              <p className="text-lg font-bold">{PRACTICE_PHRASES[selectedPhrase]?.hindi}</p>
              <p className="text-sm text-muted-foreground">
                {PRACTICE_PHRASES[selectedPhrase]?.english}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 py-6">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="h-20 w-20 rounded-full"
              onClick={toggleRecording}
              disabled={!isSupported}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
          </div>

          {(transcript || interimTranscript) && (
            <div className="rounded-lg border p-4">
              <Label className="text-xs text-muted-foreground">
                {transcript ? "Recognized:" : "Listening..."}
              </Label>
              <p className="mt-1 text-lg font-medium">
                {transcript}
                {interimTranscript && (
                  <span className="text-muted-foreground">{interimTranscript}</span>
                )}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <Label className="text-xs text-muted-foreground">
              Or type your Hindi text as fallback:
            </Label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="अपना वाक्य यहाँ लिखें..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button variant="outline" size="sm" disabled={!textInput.trim()}>
                <Volume2 className="mr-1 h-4 w-4" />
                Listen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
