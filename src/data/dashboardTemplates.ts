export interface DashboardTemplate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string;
  codeUrl: string;
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: "01",
    title: "Template 01",
    description: "Intersection of sidebar and tabset navigation",
    imageUrl:
      "https://jakubsobolewski.com/shiny-dashboard-templates/assets/01.png",
    demoUrl: "https://jakubsobolewski.com/shiny-dashboard-templates/01",
    codeUrl:
      "https://github.com/jakubsob/shiny-dashboard-templates/tree/main/01",
  },
  {
    id: "02",
    title: "Template 02",
    description: "Sidebar icon navigation with cards main layout",
    imageUrl:
      "https://jakubsobolewski.com/shiny-dashboard-templates/assets/02.png",
    demoUrl: "https://jakubsobolewski.com/shiny-dashboard-templates/02",
    codeUrl:
      "https://github.com/jakubsob/shiny-dashboard-templates/tree/main/02",
  },
];
