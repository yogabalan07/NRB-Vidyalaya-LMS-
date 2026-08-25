import { useState, useMemo } from "react";
import { BookOpen, Check, X, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Topic = "basics" | "numbers" | "colors" | "family" | "food" | "greetings" | "common";
type Difficulty = "easy" | "medium" | "hard";

interface VocabWord {
  hindi: string;
  english: string;
  example: string;
  transliteration: string;
}

const VOCAB: Record<Topic, VocabWord[]> = {
  basics: [
    { hindi: "नमस्ते", english: "Hello", example: "नमस्ते, आप कैसे हैं?", transliteration: "namaste" },
    { hindi: "धन्यवाद", english: "Thank you", example: "आपका धन्यवाद।", transliteration: "dhanyavaad" },
    { hindi: "हाँ", english: "Yes", example: "हाँ, मैं समझा।", transliteration: "haan" },
    { hindi: "नहीं", english: "No", example: "नहीं, मुझे नहीं पता।", transliteration: "nahin" },
    { hindi: "कृपया", english: "Please", example: "कृपया बैठ जाइए।", transliteration: "kripya" },
    { hindi: "माफ़ कीजिए", english: "Excuse me", example: "माफ़ कीजिए, आप कहाँ जा रहे हैं?", transliteration: "maaf kijiye" },
    { hindi: "अच्छा", english: "Good", example: "सब अच्छा है।", transliteration: "accha" },
    { hindi: "बुरा", english: "Bad", example: "यह बुरा है।", transliteration: "bura" },
  ],
  numbers: [
    { hindi: "एक", english: "One", example: "एक किताब।", transliteration: "ek" },
    { hindi: "दो", english: "Two", example: "दो सेब।", transliteration: "do" },
    { hindi: "तीन", english: "Three", example: "तीन लोग।", transliteration: "teen" },
    { hindi: "चार", english: "Four", example: "चार कमरे।", transliteration: "chaar" },
    { hindi: "पाँच", english: "Five", example: "पाँच उंगलियाँ।", transliteration: "paanch" },
    { hindi: "छह", english: "Six", example: "छह महीने।", transliteration: "chhah" },
    { hindi: "सात", english: "Seven", example: "सात दिन।", transliteration: "saat" },
    { hindi: "आठ", english: "Eight", example: "आठ बजे।", transliteration: "aath" },
  ],
  colors: [
    { hindi: "लाल", english: "Red", example: "लाल गुलाब।", transliteration: "laal" },
    { hindi: "नीला", english: "Blue", example: "नीला आसमान।", transliteration: "neela" },
    { hindi: "हरा", english: "Green", example: "हरा पेड़।", transliteration: "hara" },
    { hindi: "पीला", english: "Yellow", example: "पीला फूल।", transliteration: "peela" },
    { hindi: "सफ़ेद", english: "White", example: "सफ़ेद बादल।", transliteration: "safed" },
    { hindi: "काला", english: "Black", example: "काली रात।", transliteration: "kaala" },
    { hindi: "नारंगी", english: "Orange", example: "नारंगी संतरा।", transliteration: "narangi" },
    { hindi: "गुलाबी", english: "Pink", example: "गुलाबी गुलाब।", transliteration: "gulabi" },
  ],
  family: [
    { hindi: "माँ", english: "Mother", example: "माँ बहुत प्यारी हैं।", transliteration: "maa" },
    { hindi: "पिता", english: "Father", example: "पिता ऑफिस जाते हैं।", transliteration: "pita" },
    { hindi: "भाई", english: "Brother", example: "मेरा भाई स्कूल जाता है।", transliteration: "bhai" },
    { hindi: "बहन", english: "Sister", example: "मेरी बहन पढ़ाई करती है।", transliteration: "bahan" },
    { hindi: "दादा", english: "Grandfather (paternal)", example: "दादा कहानी सुनाते हैं।", transliteration: "dada" },
    { hindi: "दादी", english: "Grandmother (paternal)", example: "दादी खाना बनाती हैं।", transliteration: "dadi" },
    { hindi: "चाचा", english: "Uncle", example: "चाचा जी आ रहे हैं।", transliteration: "chacha" },
    { hindi: "चाची", english: "Aunt", example: "चाची ने मिठाई बनाई।", transliteration: "chachi" },
  ],
  food: [
    { hindi: "खाना", english: "Food", example: "खाना बहुत स्वादिष्ट है।", transliteration: "khaana" },
    { hindi: "पानी", english: "Water", example: "पानी दीजिए।", transliteration: "paani" },
    { hindi: "रोटी", english: "Bread", example: "गरम रोटी बनाओ।", transliteration: "roti" },
    { hindi: "चावल", english: "Rice", example: "चावल पक रहे हैं।", transliteration: "chawal" },
    { hindi: "दाल", english: "Lentils", example: "दाल बनाई है।", transliteration: "daal" },
    { hindi: "सब्ज़ी", english: "Vegetables", example: "सब्ज़ी काट दो।", transliteration: "sabzi" },
    { hindi: "दूध", english: "Milk", example: "दूध गरम करो।", transliteration: "doodh" },
    { hindi: "चाय", english: "Tea", example: "एक कप चाय बनाओ।", transliteration: "chai" },
  ],
  greetings: [
    { hindi: "सुप्रभात", english: "Good morning", example: "सुप्रभात, कैसे हैं?", transliteration: "suprabhat" },
    { hindi: "शुभ संध्या", english: "Good evening", example: "शुभ संध्या, स्वागत है।", transliteration: "shubh sandhya" },
    { hindi: "शुभ रात्रि", english: "Good night", example: "शुभ रात्रि, सो जाइए।", transliteration: "shubh ratri" },
    { hindi: "कैसे हैं?", english: "How are you?", example: "आप कैसे हैं?", transliteration: "kaise hain?" },
    { hindi: "मैं ठीक हूँ", english: "I am fine", example: "जी, मैं ठीक हूँ।", transliteration: "main theek hoon" },
    { hindi: "आपका नाम क्या है?", english: "What is your name?", example: "आपका नाम क्या है?", transliteration: "aapka naam kya hai?" },
    { hindi: "मेरा नाम...", english: "My name is...", example: "मेरा नाम राहुल है।", transliteration: "mera naam..." },
    { hindi: "फिर मिलेंगे", english: "See you later", example: "फिर मिलेंगे, अलविदा।", transliteration: "phir milenge" },
  ],
  common: [
    { hindi: "पानी", english: "Water", example: "पानी पियो।", transliteration: "paani" },
    { hindi: "घर", english: "Home", example: "घर चलो।", transliteration: "ghar" },
    { hindi: "स्कूल", english: "School", example: "स्कूल जाओ।", transliteration: "school" },
    { hindi: "किताब", english: "Book", example: "किताब पढ़ो।", transliteration: "kitab" },
    { hindi: "दोस्त", english: "Friend", example: "वह मेरा दोस्त है।", transliteration: "dost" },
    { hindi: "समय", english: "Time", example: "समय बहुत कीमती है।", transliteration: "samay" },
    { hindi: "प्यार", english: "Love", example: "प्यार बहुत ज़रूरी है।", transliteration: "pyaar" },
    { hindi: "खुशी", english: "Happiness", example: "खुशी बाँटो।", transliteration: "khushi" },
  ],
};

const TOPICS: { value: Topic; label: string }[] = [
  { value: "basics", label: "Basics" },
  { value: "numbers", label: "Numbers" },
  { value: "colors", label: "Colors" },
  { value: "family", label: "Family" },
  { value: "food", label: "Food" },
  { value: "greetings", label: "Greetings" },
  { value: "common", label: "Common Words" },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp as T;
  }
  return shuffled;
}

export function StudentVocabularyPage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic>("basics");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [studyMode, setStudyMode] = useState<"cards" | "quiz">("cards");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const words = useMemo(() => {
    const base = VOCAB[selectedTopic];
    const limit =
      selectedDifficulty === "easy" ? 6 : selectedDifficulty === "medium" ? 10 : base.length;
    return base.slice(0, limit);
  }, [selectedTopic, selectedDifficulty]);

  const quizWords = useMemo(() => shuffleArray(words), [words]);
  const currentWord = quizWords[quizIndex];

  const startQuiz = () => {
    setStudyMode("quiz");
    setQuizIndex(0);
    setScore(0);
    setQuizAnswer(null);
    setQuizFinished(false);
    setShowHint(false);
  };

  const handleAnswer = (answer: string) => {
    if (quizAnswer !== null || !currentWord) return;
    setQuizAnswer(answer);
    if (answer === currentWord.hindi) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (quizIndex < quizWords.length - 1) {
      setQuizIndex((i) => i + 1);
      setQuizAnswer(null);
      setShowHint(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setScore(0);
    setQuizAnswer(null);
    setQuizFinished(false);
    setShowHint(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <p className="text-muted-foreground">
          Learn and practice Hindi vocabulary by topic.
        </p>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Topic</p>
          <div className="flex gap-1">
            {TOPICS.map((t) => (
              <Button
                key={t.value}
                variant={selectedTopic === t.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic(t.value)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Difficulty</p>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <Button
                key={d.value}
                variant={selectedDifficulty === d.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(d.value)}
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Mode</p>
          <div className="flex gap-1">
            <Button
              variant={studyMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setStudyMode("cards")}
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Cards
            </Button>
            <Button
              variant={studyMode === "quiz" ? "default" : "outline"}
              size="sm"
              onClick={startQuiz}
            >
              Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Mode */}
      {studyMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((w, i) => (
            <Card key={`${selectedTopic}-${i}`} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl font-bold">{w.hindi}</span>
                  <Badge variant="secondary">{w.transliteration}</Badge>
                </div>
                <p className="text-sm font-medium text-primary">{w.english}</p>
                <p className="mt-3 rounded bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {w.example}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Mode */}
      {studyMode === "quiz" && !quizFinished && currentWord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Question {quizIndex + 1} / {quizWords.length}
              </span>
              <Badge>Score: {score}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                What does this Hindi word mean?
              </p>
              <p className="text-4xl font-bold">{currentWord.hindi}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentWord.transliteration}
              </p>
            </div>

            {showHint && (
              <p className="text-center text-sm text-muted-foreground">
                Example: {currentWord.example}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {shuffleArray(words).map((w) => {
                const isCorrect = w.hindi === currentWord.hindi;
                const isSelected = w.hindi === quizAnswer;
                let className = "w-full justify-center";
                if (quizAnswer !== null) {
                  if (isCorrect) className += " bg-green-100 border-green-500 text-green-800";
                  else if (isSelected) className += " bg-red-100 border-red-500 text-red-800";
                }
                return (
                  <Button
                    key={w.hindi}
                    variant={quizAnswer === null ? "outline" : "outline"}
                    className={className}
                    onClick={() => handleAnswer(w.hindi)}
                    disabled={quizAnswer !== null}
                  >
                    {quizAnswer !== null && isCorrect && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {quizAnswer !== null && isSelected && !isCorrect && (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    {w.english}
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-center gap-2">
              {!showHint && quizAnswer === null && (
                <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
                  Show Hint
                </Button>
              )}
              {quizAnswer !== null && (
                <Button onClick={handleNext}>
                  {quizIndex < quizWords.length - 1 ? (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "See Results"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Finished */}
      {studyMode === "quiz" && quizFinished && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-5xl font-bold text-primary">{score}/{quizWords.length}</p>
            <p className="mt-3 text-lg font-medium">
              {score === quizWords.length
                ? "Perfect! Excellent work!"
                : score >= quizWords.length / 2
                ? "Good job! Keep practicing!"
                : "Keep learning, you'll improve!"}
            </p>
            <Button className="mt-6" onClick={resetQuiz}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
