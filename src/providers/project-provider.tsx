import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type Project } from "@/lib/schema/projects";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
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
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
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
