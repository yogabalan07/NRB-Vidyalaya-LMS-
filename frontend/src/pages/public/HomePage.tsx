import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Users,
  Award,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Well-organized Hindi curriculum from beginner to advanced levels.",
  },
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Intelligent tutoring, auto-grading, and personalized learning paths.",
  },
  {
    icon: Users,
    title: "Expert Teachers",
    description: "Learn from experienced Hindi language educators.",
  },
  {
    icon: Award,
    title: "Certified Learning",
    description: "Earn certificates upon course completion.",
  },
];

const stats = [
  { value: "500+", label: "Students" },
  { value: "50+", label: "Courses" },
  { value: "1000+", label: "Lessons" },
  { value: "98%", label: "Satisfaction" },
];

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto relative px-4">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-saffron-400 text-saffron-400" />
              Professional Hindi Learning Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
              Master{" "}
              <span className="text-saffron-400 devanagari">हिंदी</span>{" "}
              with NRB Vidyalaya
            </h1>
            <p className="mt-6 text-lg text-white/70 lg:text-xl">
              A comprehensive learning management system with AI-powered tutoring,
              structured courses, and interactive quizzes for Hindi language learners.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="xl" variant="saffron" asChild>
                <Link to={ROUTES.REGISTER}>
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link to={ROUTES.COURSES}>Explore Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Everything you need to learn Hindi
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our platform combines traditional teaching methods with modern AI technology.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-2 transition-colors hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hindi Alphabet Preview */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Learn <span className="devanagari text-primary">हिंदी वर्णमाला</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Master the Devanagari script with interactive lessons and practice.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "च", "छ", "ज", "झ"].map(
              (char) => (
                <div
                  key={char}
                  className="flex h-16 w-16 items-center justify-center rounded-xl bg-background text-2xl font-bold shadow-sm border transition-all hover:scale-110 hover:shadow-md hover:border-primary/30 cursor-pointer"
                >
                  <span className="devanagari">{char}</span>
                </div>
              )
            )}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to={ROUTES.COURSES}>
                Learn All Alphabets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Ready to start your Hindi journey?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join hundreds of students learning Hindi with our AI-powered platform.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="xl" variant="saffron" asChild>
                <Link to={ROUTES.REGISTER}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
