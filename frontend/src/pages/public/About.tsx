import { Link } from "react-router-dom";
import {
  BookOpen,
  Globe,
  Heart,
  Target,
  Lightbulb,
  GraduationCap,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks";

const values = [
  {
    icon: Heart,
    title: "Student-Centered",
    description:
      "Every decision we make prioritizes the learning experience and growth of our students.",
  },
  {
    icon: Target,
    title: "Excellence",
    description:
      "We maintain the highest standards in curriculum design, teaching quality, and platform experience.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We blend traditional Hindi teaching methods with cutting-edge AI technology for effective learning.",
  },
  {
    icon: Globe,
    title: "Inclusivity",
    description:
      "Hindi learning should be accessible to everyone, regardless of their background or location.",
  },
];

const whyHindi = [
  {
    title: "World's 3rd Most Spoken Language",
    description:
      "Over 600 million people speak Hindi worldwide, making it one of the most widely spoken languages on the planet.",
  },
  {
    title: "Cultural Richness",
    description:
      "Access a vast library of literature, Bollywood cinema, music, and centuries of rich cultural heritage.",
  },
  {
    title: "Career Opportunities",
    description:
      "India's growing economy creates massive demand for Hindi-speaking professionals in business, tech, and media.",
  },
  {
    title: "Gateway to Other Languages",
    description:
      "Learning Hindi makes it easier to pick up Urdu, Sanskrit, and other Indo-Aryan languages.",
  },
];

const team = [
  {
    name: "NRB Vidyalaya Faculty",
    role: "Expert Educators",
    description:
      "Our team of certified Hindi language educators brings decades of combined teaching experience with expertise in modern pedagogical methods.",
  },
  {
    name: "Technology Team",
    role: "Platform Developers",
    description:
      "Passionate engineers building AI-powered tools that personalize and enhance the Hindi learning journey for every student.",
  },
  {
    name: "Content Creators",
    role: "Curriculum Designers",
    description:
      "Specialists who craft engaging lessons, quizzes, and interactive content aligned with CEFR and Indian language proficiency standards.",
  },
];

const stats = [
  { label: "Students Enrolled", valueKey: "totalStudents" as const, suffix: "+" },
  { label: "Active Courses", valueKey: "publishedCourses" as const, suffix: "" },
  { label: "Total Lessons", valueKey: "totalLessons" as const, suffix: "+" },
  { label: "Quizzes Available", valueKey: "totalQuizzes" as const, suffix: "+" },
];

export function AboutPage() {
  const { data: statsData } = useDashboardStats();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-20 lg:py-28">
        <div className="container mx-auto relative px-4">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-saffron-400 text-saffron-400" />
              Since 2020
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
              About <span className="text-saffron-400 font-hindi">NRB Vidyalaya</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 lg:text-xl">
              A premier institution dedicated to teaching Hindi through innovative methods and
              AI-powered technology, making language learning accessible and effective for students
              worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="saffron" asChild>
                <Link to="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/contact">Get in Touch</Link>
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
                <div className="text-3xl font-bold text-primary">
                  {statsData ? `${statsData[stat.valueKey]}${stat.suffix}` : "--"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-3xl font-bold lg:text-4xl">
                Empowering learners through technology and tradition
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                NRB Vidyalaya was founded with a singular vision: to make high-quality Hindi
                education accessible to every learner, everywhere. We combine time-tested teaching
                methodologies with modern AI technology to create personalized, engaging, and
                effective learning experiences.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Whether you are a complete beginner or looking to refine your advanced Hindi skills,
                our platform adapts to your pace, identifies areas for improvement, and provides
                structured paths to fluency.
              </p>
            </div>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-saffron-500/10 px-3 py-1 text-sm font-medium text-saffron-600">
                <Sparkles className="h-4 w-4" />
                Our Vision
              </div>
              <h2 className="text-3xl font-bold lg:text-4xl">
                A world where Hindi learning knows no boundaries
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We envision a future where geographical, economic, and social barriers no longer
                prevent anyone from learning Hindi. Through our platform, a student in any corner of
                the world can access expert instruction, practice with AI tutors, earn recognized
                certificates, and connect with a global community of Hindi learners.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our goal is to become the leading digital platform for Hindi education, serving
                millions of learners and setting new standards for language learning technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">Our Core Values</h2>
            <p className="mt-4 text-muted-foreground">
              The principles that guide everything we do at NRB Vidyalaya.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border-2 transition-colors hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Learn Hindi */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Why Learn <span className="font-hindi text-primary">हिंदी</span>?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Hindi is not just a language -- it is a gateway to one of the world's richest cultures
              and fastest-growing economies.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {whyHindi.map((item) => (
              <Card key={item.title} className="border-2">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron-500/10">
                    <BookOpen className="h-5 w-5 text-saffron-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">Our Team</h2>
            <p className="mt-4 text-muted-foreground">
              Dedicated professionals committed to your Hindi learning success.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold lg:text-4xl">Ready to Start Your Hindi Journey?</h2>
            <p className="mt-4 text-primary-foreground/80">
              Join hundreds of students already learning Hindi with our AI-powered platform.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="saffron" asChild>
                <Link to="/register">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
