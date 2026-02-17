import { getProjects } from '@/lib/services/projects';
import ProjectsClient from './ProjectsClient';
import type { Project } from '@/types';

export default async function ProjectsPage() {
    let projects: Project[] = [];
    try {
        projects = await getProjects();
    } catch {
        projects = [];
    }

    return <ProjectsClient initialProjects={projects} />;
}
