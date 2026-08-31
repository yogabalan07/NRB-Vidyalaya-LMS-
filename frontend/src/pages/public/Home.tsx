import { Link } from "react-router-dom";
import { BookOpen, Brain, Users, Award, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/ui/card";
import { statsService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { FadeIn, SlideUp } from "@/components/animations";
import { AnimatedHindiLetters } from "@/components/animations/AnimatedHindiLetters";
import { AnimatedBook } from "@/components/animations/AnimatedBook";
import { AnimatedPencil } from "@/components/animations/AnimatedPencil";
import { FloatingParticles } from "@/components/animations/FloatingParticles";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";

const features = [
  { icon: BookOpen, title: "Structured Courses", description: "Well-organized Hindi curriculum from beginner to advanced." },
  { icon: Brain, title: "AI-Powered Learning", description: "Intelligent tutoring and personalized learning paths." },
  { icon: Users, title: "Expert Teachers", description: "Learn from experienced Hindi language educators." },
  { icon: Award, title: "Certified Learning", description: "Earn certificates upon course completion." },
];

export function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ["stats", "public"],
    queryFn: statsService.getDashboardStats,
  });

  const displayStats = [
    { value: stats?.totalStudents ?? 0, suffix: "+", label: "Students" },
    { value: stats?.publishedCourses ?? 0, suffix: "+", label: "Courses" },
    { value: stats?.totalLessons ?? 0, suffix: "+", label: "Lessons" },
    { value: stats?.totalEnrollments ?? 0, suffix: "+", label: "Enrollments" },
  ];
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-20 lg:py-28">
        <AnimatedHindiLetters />
        <FloatingParticles />
        <div className="container mx-auto relative px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="max-w-3xl flex-1">
              <FadeIn direction="down" delay={100}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
                  <Star className="h-3.5 w-3.5 fill-saffron-400 text-saffron-400" />
                  Professional Hindi Learning Platform
                </div>
              </FadeIn>
              <FadeIn delay={200}>
                <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
                  Master <span className="text-saffron-400 font-hindi">हिंदी</span> with NRB Vidyalaya
                </h1>
              </FadeIn>
              <FadeIn delay={400}>
                <p className="mt-6 text-lg text-white/70 lg:text-xl">
                  A comprehensive learning management system with AI-powered tutoring, structured courses, and interactive quizzes.
                </p>
              </FadeIn>
              <FadeIn delay={600}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" variant="saffron" asChild>
                    <Link to="/register">Start Learning<ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
            <FadeIn delay={500} className="hidden lg:block">
              <div className="relative">
                <AnimatedBook size={160} />
                <AnimatedPencil size={100} className="absolute -right-4 -bottom-2" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {displayStats.map((stat, i) => (
              <SlideUp key={stat.label} delay={i * 100} className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">Everything you need to learn Hindi</h2>
            <p className="mt-4 text-muted-foreground">Our platform combines traditional teaching with modern AI technology.</p>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <FadeIn key={feature.title} delay={i * 100}>
                  <Card className="border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-md h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
              <h2 className="text-3xl font-bold lg:text-4xl">Ready to start your Hindi journey?</h2>
              <p className="mt-4 text-primary-foreground/80">Join hundreds of students learning Hindi with our AI-powered platform.</p>
              <div className="mt-8 flex justify-center gap-3">
                <Button size="lg" variant="saffron" asChild>
                  <Link to="/register">Get Started Free<ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
