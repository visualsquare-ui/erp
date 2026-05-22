import type {
  Client,
  Invoice,
  PortfolioAsset,
  Project,
  Task,
  Vendor,
  VendorBill,
} from "@/types/erp";

export const clients: Client[] = [
  {
    id: "client-1",
    name: "Mina Park",
    companyName: "Hudson Table Studio",
    email: "mina@hudsontable.example",
    phone: "(201) 555-0142",
  },
  {
    id: "client-2",
    name: "Daniel Kim",
    companyName: "North Jersey Dental",
    email: "daniel@njdental.example",
    phone: "(973) 555-0188",
  },
  {
    id: "client-3",
    name: "Sarah Lee",
    companyName: "Metro K-Food Market",
    email: "sarah@metrokfood.example",
    phone: "(212) 555-0175",
  },
];

export const vendors: Vendor[] = [
  {
    id: "vendor-1",
    name: "Garden State Print Co.",
    specialty: "Menus, brochures, folded flyers",
  },
  {
    id: "vendor-2",
    name: "Metro Large Format",
    specialty: "Banners, window graphics, foam boards",
  },
];

export const projects: Project[] = [
  {
    id: "project-1",
    clientId: "client-1",
    name: "Spring Catering Menu Refresh",
    type: "print",
    status: "in_progress",
    startDate: "2026-05-04",
    dueDate: "2026-06-03",
    quoteAmount: 4850,
    description: "Menu redesign, proof approval, print brokerage, delivery.",
  },
  {
    id: "project-2",
    clientId: "client-2",
    name: "Patient Booking Landing Page",
    type: "web",
    status: "quote",
    startDate: "2026-05-15",
    dueDate: "2026-06-20",
    quoteAmount: 7200,
    description: "Landing page design and responsive handoff package.",
  },
  {
    id: "project-3",
    clientId: "client-3",
    name: "Market Rebrand Launch Kit",
    type: "branding",
    status: "in_progress",
    startDate: "2026-04-22",
    dueDate: "2026-06-12",
    quoteAmount: 12800,
    description: "Logo refinement, signage direction, brand guide, launch assets.",
  },
  {
    id: "project-4",
    clientId: "client-3",
    name: "Weekend Sale Window Graphics",
    type: "print",
    status: "done",
    startDate: "2026-04-01",
    dueDate: "2026-04-18",
    quoteAmount: 3100,
    description: "Large format window promotion graphics and vendor coordination.",
  },
];

export const tasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    title: "Collect final menu copy",
    assignee: "Jamie",
    status: "review",
    dueDate: "2026-05-24",
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Confirm paper stock with printer",
    assignee: "Alex",
    status: "doing",
    dueDate: "2026-05-27",
  },
  {
    id: "task-3",
    projectId: "project-2",
    title: "Draft landing page wireframe",
    assignee: "Mina",
    status: "todo",
    dueDate: "2026-05-30",
  },
  {
    id: "task-4",
    projectId: "project-3",
    title: "Prepare brand guide v2",
    assignee: "Jamie",
    status: "doing",
    dueDate: "2026-06-02",
  },
];

export const invoices: Invoice[] = [
  {
    id: "invoice-1",
    projectId: "project-1",
    clientId: "client-1",
    invoiceNumber: "VS-2026-0001",
    issueDate: "2026-05-10",
    terms: "net_30",
    dueDate: "2026-06-09",
    status: "sent",
    subtotal: 4850,
    tax: 198.75,
    total: 5048.75,
    paidAmount: 0,
  },
  {
    id: "invoice-2",
    projectId: "project-4",
    clientId: "client-3",
    invoiceNumber: "VS-2026-0002",
    issueDate: "2026-04-18",
    terms: "net_15",
    dueDate: "2026-05-03",
    status: "paid",
    subtotal: 3100,
    tax: 205.38,
    total: 3305.38,
    paidAmount: 3305.38,
  },
  {
    id: "invoice-3",
    projectId: "project-3",
    clientId: "client-3",
    invoiceNumber: "VS-2026-0003",
    issueDate: "2026-05-01",
    terms: "net_30",
    dueDate: "2026-05-31",
    status: "sent",
    subtotal: 6400,
    tax: 0,
    total: 6400,
    paidAmount: 3200,
  },
];

export const vendorBills: VendorBill[] = [
  {
    id: "bill-1",
    projectId: "project-1",
    vendorId: "vendor-1",
    dueDate: "2026-06-05",
    amount: 1420,
    status: "received",
  },
  {
    id: "bill-2",
    projectId: "project-4",
    vendorId: "vendor-2",
    dueDate: "2026-04-25",
    amount: 980,
    status: "paid",
  },
];

export const assets: PortfolioAsset[] = [
  {
    id: "asset-1",
    projectId: "project-4",
    kind: "result_photo",
    title: "Installed window graphics",
    thumbnailUrl: "/portfolio-window-graphics.svg",
    isPortfolio: true,
  },
  {
    id: "asset-2",
    projectId: "project-3",
    kind: "drive_link",
    title: "Brand guide draft",
    thumbnailUrl: "/portfolio-brand-guide.svg",
    isPortfolio: true,
  },
];
