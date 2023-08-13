import { useCreateProjectModal } from "@/components/modals/create-project-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";
import { api } from "@/utils/api";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./ui/use-toast";

export default function ProjectSwitcher() {
  const { data } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [, setCreateProjectModalOpen, CreateProjectModal] =
    useCreateProjectModal();

  const projects = api.project.getAll.useQuery();

  const currentProject = useMemo(
    () =>
      typeof router.query.pslug === "string"
        ? projects.data?.find((item) => item.slug === router.query.pslug)
        : null,
    [projects.data, router.query.pslug]
  );

  useEffect(() => {
    if (projects.isError) {
      toast({
        title: "Something went wrong!",
        description: projects.error.message,
        variant: "destructive",
      });
    }
  }, [projects.error?.message, projects.isError, toast]);

  if (!data || projects.isLoading) {
    return <Skeleton className="-mx-2 h-10 w-32" />;
  }

  if (projects.isError) {
    return <p>Error!</p>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="-mx-2 px-2">
            <Image
              src={
                currentProject
                  ? `/api/avatar/${currentProject.id}`
                  : data.user.image || `/api/avatar/${data.user.id}`
              }
              className="mr-2 h-6 w-6 rounded-full object-cover"
              width={256}
              height={256}
              alt="Project logo"
            />
            {currentProject?.name || data.user.name || data.user.email}
            <ChevronsUpDownIcon size={20} className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Personal Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <Image
                  src={data.user.image || `/api/avatar/${data.user.id}`}
                  alt="Project logo"
                  width={256}
                  height={256}
                  className="mr-2 h-5 w-5 rounded-full object-cover"
                />
                <span className="flex-1 truncate">
                  {data.user.name || data.user.email}
                </span>
                <CheckIcon
                  size={20}
                  className={cn("ml-3 opacity-0", {
                    "opacity-100": !currentProject,
                  })}
                />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Chabots</DropdownMenuLabel>
            {projects.data.map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  href={{
                    pathname: router.pathname,
                    query: {
                      pslug: item.slug,
                    },
                  }}
                >
                  <Image
                    src={`/api/avatar/${item.id}`}
                    alt="Project logo"
                    className="mr-2 h-5 w-5 rounded-full object-cover"
                    width={256}
                    height={256}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  <CheckIcon
                    size={20}
                    className={cn("ml-3 opacity-0", {
                      "opacity-100":
                        currentProject && item.id === currentProject.id,
                    })}
                  />
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateProjectModalOpen(true)}>
            <PlusIcon size={20} className="mr-2" />
            New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProjectModal />
    </>
  );
}
