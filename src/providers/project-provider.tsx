import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { type Project } from "@/lib/schema/projects";
import { api } from "@/utils/api";
import { type ReactNode, createContext, useContext } from "react";

type ProjectContextType = {
  project: Project;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export default function ProjectProvider({
  children,
  projectSlug,
}: {
  children: ReactNode;
  projectSlug: string;
}) {
  const project = api.project.getBySlug.useQuery({ projectSlug });

  if (project.isLoading) {
    return (
      <header className="border-b bg-card text-card-foreground">
        <div className="container flex min-h-[8rem] items-center py-2">
          <Skeleton className="h-8 w-32" />
        </div>
      </header>
    );
  }

  if (project.isError) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{project.error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ProjectContext.Provider value={{ project: project.data }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw "useProject must use inside ProjectProvider";
  }
  return context;
}
