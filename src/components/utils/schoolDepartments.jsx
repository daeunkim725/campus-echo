// ============================================================
// SCHOOL DEPARTMENTS CONFIGURATION
// Edit this file to update departments/majors for each school.
// Each entry: { code: "DEPT_CODE", name: "Display Name" }
// ============================================================

export const SCHOOL_DEPARTMENTS = {
  ETHZ: [
    { code: "D-ARCH", name: "Architecture" },
    { code: "D-BAUG", name: "Civil Engineering" },
    { code: "D-BSSE", name: "Biosystems Science" },
    { code: "D-INFK", name: "Computer Science" },
    { code: "D-ITET", name: "Electrical Engineering" },
    { code: "D-MATL", name: "Materials Science" },
    { code: "D-MATH", name: "Mathematics" },
    { code: "D-MAVT", name: "Mechanical Engineering" },
    { code: "D-MTEC", name: "Management & Technology" },
    { code: "D-PHYS", name: "Physics" },
    { code: "D-USYS", name: "Environmental Systems" },
    { code: "D-ERDW", name: "Earth Sciences" },
    { code: "D-BIOL", name: "Biology" },
    { code: "D-CHAB", name: "Chemistry & Applied Biosciences" },
    { code: "D-GESS", name: "Humanities, Social & Political Sciences" },
    { code: "D-HEST", name: "Health Sciences & Technology" },
  ],
  EPFL: [
    // TODO: Add EPFL departments here
    // { code: "IC", name: "Computer & Communication Sciences" },
  ],
  UNIZH: [
    // TODO: Add Uni Zürich departments here
  ],
  UNIBASEL: [
    // TODO: Add Uni Basel departments here
  ],
  UNIBE: [
    // TODO: Add Uni Bern departments here
  ],
  UNIL: [
    // TODO: Add Uni Lausanne departments here
  ],
  UNIFR: [
    // TODO: Add Uni Fribourg departments here
  ],
  UNIGE: [
    // TODO: Add Uni Genève departments here
  ],
  UNISG: [
    // TODO: Add Uni St. Gallen departments here
  ],
  USI: [
    // TODO: Add USI Lugano departments here
  ],
  UNILU: [
    // TODO: Add Uni Lucerne departments here
  ],
};

// Academic levels per school — edit as needed
export const SCHOOL_LEVELS = {
  ETHZ: ["BSc", "MSc", "PhD"],
  EPFL: ["BSc", "MSc", "PhD"],
  UNIZH: ["BSc", "MSc", "PhD"],
  UNIBASEL: ["BSc", "MSc", "PhD"],
  UNIBE: ["BSc", "MSc", "PhD"],
  UNIL: ["BSc", "MSc", "PhD"],
  UNIFR: ["BSc", "MSc", "PhD"],
  UNIGE: ["BSc", "MSc", "PhD"],
  UNISG: ["BSc", "MSc", "PhD"],
  USI: ["BSc", "MSc", "PhD"],
  UNILU: ["BSc", "MSc", "PhD"],
};

export function getSchoolDepartments(schoolCode) {
  return SCHOOL_DEPARTMENTS[schoolCode] || [];
}

export function getSchoolLevels(schoolCode) {
  return SCHOOL_LEVELS[schoolCode] || ["BSc", "MSc", "PhD"];
}