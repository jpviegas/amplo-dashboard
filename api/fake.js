export const companyData = {
  accounts: [
    {
      id: 1,
      email: "admin@admin.com",
      password: "admin",
      role: "admin",
    },
    {
      id: 2,
      email: "jp@jp.com",
      password: "jp",
      role: "jp",
    },
  ],

  companies: [
    {
      id: "1",
      name: "Empresa 1",
      cnpj: "00000000000001",
      employeeQuantity: "1",
    },
    {
      id: "2",
      name: "Empresa 2",
      cnpj: "00000000000002",
      employeeQuantity: "2",
    },
  ],

  jobRoles: [
    { id: 1, name: "Cargo 1" },
    { id: 2, name: "Cargo 2" },
    { id: 3, name: "Cargo 3" },
  ],

  departments: [
    { id: 1, department: "Departamento 1" },
    { id: 2, department: "Departamento 2" },
    { id: 3, department: "Departamento 3" },
    { id: 4, department: "Departamento 4" },
  ],
  // Basic company information
  info: {
    name: "TechCorp Solutions",
    founded: 2010,
    headquarters: "San Francisco, CA",
    description: "Leading provider of innovative technology solutions",
    website: "www.techcorp-solutions.com",
    email: "contact@techcorp-solutions.com",
    phone: "+1 (555) 123-4567",
  },

  // Leadership team
  leadership: [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Chief Executive Officer",
      image: "/images/sarah-johnson.jpg",
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Chief Technology Officer",
      image: "/images/michael-chen.jpg",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Chief Financial Officer",
      image: "/images/emily-rodriguez.jpg",
    },
  ],

  // Products/Services
  products: [
    {
      id: 1,
      name: "CloudSync Pro",
      description: "Enterprise cloud storage and synchronization solution",
      price: 299.99,
      category: "Cloud Services",
    },
    {
      id: 2,
      name: "SecureGuard",
      description: "Advanced cybersecurity protection platform",
      price: 199.99,
      category: "Security",
    },
    {
      id: 3,
      name: "DataAnalytics Suite",
      description: "Business intelligence and data visualization tools",
      price: 399.99,
      category: "Analytics",
    },
  ],

  // Office locations
  locations: [
    {
      id: 1,
      city: "San Francisco",
      address: "123 Tech Street, CA 94105",
      phone: "+1 (555) 123-4567",
      isHeadquarters: true,
    },
    {
      id: 2,
      city: "New York",
      address: "456 Innovation Ave, NY 10013",
      phone: "+1 (555) 234-5678",
      isHeadquarters: false,
    },
    {
      id: 3,
      city: "London",
      address: "789 Digital Lane, EC2A 4NE",
      phone: "+44 20 7123 4567",
      isHeadquarters: false,
    },
  ],

  // Latest news/updates
  news: [
    {
      id: 1,
      title: "TechCorp Solutions Launches New AI Platform",
      date: "2024-03-15",
      summary:
        "Revolutionary artificial intelligence solution for enterprise customers",
    },
    {
      id: 2,
      title: "Q4 Financial Results Exceed Expectations",
      date: "2024-02-28",
      summary: "Record-breaking quarter with 45% year-over-year growth",
    },
    {
      id: 3,
      title: "New Partnership Announcement",
      date: "2024-02-10",
      summary: "Strategic partnership with leading cloud provider",
    },
  ],

  // Career opportunities
  careers: [
    {
      id: 1,
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "San Francisco",
      type: "Full-time",
    },
    {
      id: 2,
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "New York",
      type: "Full-time",
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "London",
      type: "Full-time",
    },
  ],

  // Employee start dates
  employeeStartDates: [
    {
      id: 1,
      name: "John Smith",
      startDate: "2024/01/15",
      startTime: "09:00",
    },
    {
      id: 2,
      name: "Maria Garcia",
      startDate: "2024/02/01",
      startTime: "08:30",
    },
    {
      id: 3,
      name: "David Wilson",
      startDate: "2024/03/10",
      startTime: "09:15",
    },
    {
      id: 4,
      name: "John Doe",
      startDate: "2024/05/03",
      startTime: "19:00",
    },
  ],

  // Employees information
  employees: [
    {
      id: 1,
      name: "Alice Thompson",
      company: "TechCorp Solutions",
      department: "Engineering",
      status: "ativo",
    },
    {
      id: 2,
      name: "Robert Martinez",
      company: "TechCorp Solutions",
      department: "Marketing",
      status: "ativo",
    },
    {
      id: 3,
      name: "Jennifer Lee",
      company: "TechCorp Solutions",
      department: "Sales",
      status: "inativo",
    },
  ],

  colors: {
    bgPrimary: "bg-[#223954]/50 hover:bg-[#223954]/80",
    bgSecondary: "bg-[#00AFEF]",
    textPrimary: "text-[#FFFFFF]",
    textSecondary: "text-[#0F0F0F]",
    textDark: "dark:text-[#FFFFFF]",
    header: true,
  },

  workingHours: [
    {
      id: 1,
      name: "01-",
      type: "Semanal",
      hour: "seg qua sex",
      status: "ativo",
    },
    {
      id: 2,
      name: "02-",
      type: "Jornada",
      hour: "07:00 - 12:00 / 13:00 - 16:00",
      status: "ativo",
    },
    {
      id: 3,
      name: "03-",
      type: "Semanal",
      hour: "seg qua sex: 08:00 dom: folga",
      status: "ativo",
    },
  ],
};

// Helper function to simulate API endpoints
export const api = {
  // Get all company information
  getCompanyInfo: () => {
    return Promise.resolve(companyData.info);
  },

  // Get leadership team
  getLeadership: () => {
    return Promise.resolve(companyData.leadership);
  },

  // Get products
  getProducts: () => {
    return Promise.resolve(companyData.products);
  },

  // Get single product by ID
  getProduct: (id) => {
    const product = companyData.products.find((p) => p.id === id);
    return Promise.resolve(product);
  },

  // Get office locations
  getLocations: () => {
    return Promise.resolve(companyData.locations);
  },

  // Get news articles
  getNews: () => {
    return Promise.resolve(companyData.news);
  },

  // Get career opportunities
  getCareers: () => {
    return Promise.resolve(companyData.careers);
  },

  // Get employee start dates
  getEmployeeStartDates: () => {
    return Promise.resolve(companyData.employeeStartDates);
  },

  // Get employees
  getEmployees: () => {
    return Promise.resolve(companyData.employees);
  },

  getColors: () => {
    return Promise.resolve(companyData.colors);
  },

  getWorkingHours: () => {
    return Promise.resolve(companyData.workingHours);
  },

  getAccount: () => {
    return Promise.resolve(companyData.accounts);
  },

  getCompanies: () => {
    return Promise.resolve(companyData.companies);
  },

  getJobRoles: () => {
    return Promise.resolve(companyData.jobRoles);
  },

  getDepartments: () => {
    return Promise.resolve(companyData.departments);
  },
};
