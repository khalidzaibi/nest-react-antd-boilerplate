import { OptionDoc } from "./options.types";

export const optionsData: Record<
  string,
  Omit<OptionDoc, "createdBy" | "createdAt" | "updatedAt">[]
> = {
  "user-designations": [
    { name: "CEO", type: "user-designations", status: 1 },
    { name: "COO", type: "user-designations", status: 1 },
    { name: "HR", type: "user-designations", status: 1 },
    { name: "Admin", type: "user-designations", status: 1 },
    { name: "IT Support", type: "user-designations", status: 1 },
    { name: "Full Stack Developer", type: "user-designations", status: 1 },
    { name: "Sales Engineer", type: "user-designations", status: 1 },
    { name: "Support Engineer", type: "user-designations", status: 1 },
  ],
};

// A helper to flatten everything into one array if needed
export const allOptions = Object.values(optionsData).flat();
