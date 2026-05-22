export type ProjectType = "web" | "app" | "print" | "logo" | "branding";

export type PurchaseBillsMode = "hidden" | "optional" | "required";

export type ProjectWorkflow = {
  purchaseBills: PurchaseBillsMode;
  primaryOutput: string;
};

const workflows: Record<ProjectType, ProjectWorkflow> = {
  web: {
    purchaseBills: "hidden",
    primaryOutput: "Design handoff link",
  },
  app: {
    purchaseBills: "hidden",
    primaryOutput: "Design handoff link",
  },
  print: {
    purchaseBills: "required",
    primaryOutput: "Finished product photos",
  },
  logo: {
    purchaseBills: "optional",
    primaryOutput: "AI, SVG, and PNG files",
  },
  branding: {
    purchaseBills: "optional",
    primaryOutput: "Brand guide and asset package",
  },
};

export function getProjectWorkflow(type: ProjectType): ProjectWorkflow {
  return workflows[type];
}
