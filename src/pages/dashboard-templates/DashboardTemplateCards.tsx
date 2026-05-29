import { Button } from "@/components/ui/button";
import { Animate } from "@/components/ui/animate";
import { Notebook } from "@/components/ui/notebook/Notebook";
import { NotebookLinkCard } from "@/components/features/NotebookLinkCard";
import { CardMetaRow } from "@/components/features/CardMetaRow";
import { dashboardTemplates } from "@/data/dashboardTemplates";
import { cn } from "@/lib/utils";

const ROW_H = "320px";

export default function DashboardTemplateCards() {
  return (
    <div className="pt-8 lg:pt-12">
      <Notebook
        lines="both"
        rowH={ROW_H}
        cellGap="2px"
        className="notebook--cell-separators"
      >
        {dashboardTemplates.map((template, index) => {
          const row = Math.floor(index / 2) + 1;
          const isLeft = index % 2 === 0;

          return (
            <div
              key={template.id}
              className={cn(
                "col-[1/-1]",
                isLeft
                  ? "md:col-[1/5] lg:col-[1/7]"
                  : "md:col-[5/-1] lg:col-[7/-1]",
              )}
              style={{ gridRowStart: row }}
            >
              <Animate delay={index * 160} className="h-full">
                <NotebookLinkCard
                  as="div"
                  title={template.title}
                  description={template.description}
                  tone="background"
                  size="featured"
                  descriptionClamp={3}
                  media={
                    <div className="aspect-video overflow-hidden -mx-6 -mt-6 mb-4">
                      <img
                        src={template.imageUrl}
                        alt={template.title}
                        className="w-full h-full object-cover object-top transition-transform duration-200 group-hover/post:scale-105"
                        loading="lazy"
                      />
                    </div>
                  }
                  meta={
                    <CardMetaRow className="pt-4">
                      <span className="uppercase">Template</span>
                      <span className="tabular-nums">{template.id}</span>
                    </CardMetaRow>
                  }
                  actions={
                    <>
                      <Button size="sm" asChild>
                        <a
                          href={template.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live App
                        </a>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <a
                          href={template.codeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get The Code
                        </a>
                      </Button>
                    </>
                  }
                />
              </Animate>
            </div>
          );
        })}
      </Notebook>
    </div>
  );
}
