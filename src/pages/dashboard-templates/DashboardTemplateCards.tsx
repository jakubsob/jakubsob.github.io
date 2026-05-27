import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Animate } from "@/components/ui/animate"

const dashboardTemplates = [
  {
    id: "01",
    title: "Template 01",
    description: "Intersection of sidebar and tabset navigation",
    imageUrl: "https://jakubsobolewski.com/shiny-dashboard-templates/assets/01.png",
    demoUrl: "https://jakubsobolewski.com/shiny-dashboard-templates/01",
    codeUrl: "https://github.com/jakubsob/shiny-dashboard-templates/tree/main/01"
  },
  {
    id: "02",
    title: "Template 02",
    description: "Sidebar icon navigation with cards main layout",
    imageUrl: "https://jakubsobolewski.com/shiny-dashboard-templates/assets/02.png",
    demoUrl: "https://jakubsobolewski.com/shiny-dashboard-templates/02",
    codeUrl: "https://github.com/jakubsob/shiny-dashboard-templates/tree/main/02"
  }
]

export default function DashboardTemplateCards() {
  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {dashboardTemplates.map((template, index) => (
          <Animate key={template.id} delay={index * 200}>
            <Card className="overflow-hidden h-full transition-shadow duration-200 group">
              <div className="aspect-video overflow-hidden">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            <CardHeader>
              <CardTitle>
                {template.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors mb-4">
                {template.description}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                >
                  <a
                    href={template.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live App
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <a
                    href={template.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    Get The Code
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          </Animate>
        ))}
      </div>
    </div>
  )
}
