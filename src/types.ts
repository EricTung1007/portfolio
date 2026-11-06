export interface Knowledge {
  profile: Profile;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  publications?: Publication[];
  faqs: FAQ[];
}

export interface Profile {
  name: string;
  tagline: string;
  contact: { email: string; github: string; linkedin: string; orcid?: string };
}

export interface Publication {
  title: string;
  journal: string;
  year: string;
  doi?: string;
}

export interface Education {
  institution: string;
  degree: string;
  location?: string;
  details?: string[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  achievements?: string[];
}

export interface Skills {
  core?: string[];
  backend_data?: string[];
  ai_tools?: string[];
  working_familiarity?: string[];
}

export interface Project {
  title: string;
  role: string;
  year?: string;
  description: string[];
  stack: string[];
  link: string;
}

export interface FAQ {
  q: string;
  a_en: string;
  a_zh: string;
}
