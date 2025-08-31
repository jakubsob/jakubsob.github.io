import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Animate } from "@/components/ui/animate"
import { Github } from "lucide-react"

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
                    <Github className="w-4 h-4 mr-1" />
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
